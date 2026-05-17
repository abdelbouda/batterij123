import Stripe from 'stripe';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

// Functie om de productnaam op te schonen (als back-up fallback)
function cleanProductName(name) {
  let clean = name.split('—')[0].split('-')[0];
  return clean.trim();
}

// Helperfunctie om Google Shopping te doorzoeken via SerpApi
async function getLowestGoogleShoppingPrice(searchQuery) {
  try {
    console.log(`[*] Zoeken op Google Shopping naar: "${searchQuery}"...`);
    
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_shopping',
        q: searchQuery, // Dit is nu de EAN, de opgeschoonde modelnaam, of de fallback query
        hl: 'nl',
        gl: 'nl',
        api_key: SERPAPI_KEY
      }
    });

    const shoppingResults = response.data.shopping_results;

    if (!shoppingResults || shoppingResults.length === 0) {
      console.log(`[-] Geen Google Shopping resultaten gevonden voor: ${searchQuery}`);
      return null;
    }

    let lowestPrice = Infinity;
    let lowestPriceUrl = '';
    let itemTitle = '';

    shoppingResults.forEach(item => {
      let price = item.extracted_price || parseFloat(item.price?.replace(/[^\d,.-]/g, '').replace(',', '.'));
      
      if (price && price < lowestPrice) {
        lowestPrice = price;
        lowestPriceUrl = item.link || item.product_link;
        itemTitle = item.title;
      }
    });

    if (lowestPrice === Infinity) return null;

    return {
      price: lowestPrice,
      url: lowestPriceUrl,
      title: itemTitle
    };

  } catch (error) {
    console.error(`[-] SerpApi fout voor ${searchQuery}:`, error.message);
    return null;
  }
}

async function runArbitrage() {
  console.log('[*] Starten van de Google Shopping (EAN & Model-geoptimaliseerde) Prijs-update scan...');
  
  if (!SERPAPI_KEY) {
    console.error('[-] Kritieke fout: SERPAPI_API_KEY ontbreekt in je .env bestand!');
    return;
  }

  try {
    const products = await stripe.products.list({ active: true, limit: 100 });
    console.log(`[*] ${products.data.length} actieve producten opgehaald uit Stripe.`);

    for (const product of products.data) {
      const { ean } = product.metadata || {};
      
      // Bepaal de definitieve zoekterm:
      // 1. Als er een EAN/Model-tag in de metadata staat, gebruik die direct.
      // 2. Zo niet, gebruik dan de dynamisch opgeschoonde productnaam als fallback.
      const searchQuery = ean ? ean.trim() : cleanProductName(product.name);
      
      console.log(`\n[*] Verwerken van product: ${product.name}`);
      console.log(`    ➔ Zoek-ID via metadata/cleaner: "${searchQuery}"`);

      // 1. Zoek de laagste prijs op internet
      const competitorResult = await getLowestGoogleShoppingPrice(searchQuery);

      if (!competitorResult) {
        console.log(`[-] Kon geen betrouwbare concurrentenprijs vinden voor ${product.name}. Overslaan.`);
        continue;
      }

      console.log(`[+] Match gevonden: "${competitorResult.title}"`);
      console.log(`[+] Goedkoopste aanbieder op internet: €${competitorResult.price.toFixed(2)}`);

      // 2. Bereken de NIEUWE live Stripe prijs: competitor_price + 100
      const nieuwePrijsInEuro = competitorResult.price + 100;
      const nieuwePrijsInCenten = Math.round(nieuwePrijsInEuro * 100);
      console.log(`[+] Doelprijs voor jouw Stripe-shop (Competitor + 100): €${nieuwePrijsInEuro.toFixed(2)}`);

      // 3. Haal je HUIDIGE prijs op uit Stripe om onnodige updates te voorkomen
      let huidigeStripePrijs = 0;
      if (product.default_price) {
        const priceObject = await stripe.prices.retrieve(product.default_price);
        huidigeStripePrijs = priceObject.unit_amount / 100;
        console.log(`[*] Jouw huidige Stripe verkoopprijs: €${huidigeStripePrijs.toFixed(2)}`);
      }

      // Als de prijs al exact gelijk is aan de doelprijs, skippen we hem direct
      if (huidigeStripePrijs === nieuwePrijsInEuro) {
        console.log(`✅ Prijs is al up-to-date (€${huidigeStripePrijs.toFixed(2)}). Geen actie vereist.`);
        continue;
      }

      console.log(`[*] Prijsverschil gedetecteerd. Updaten naar €${nieuwePrijsInEuro.toFixed(2)}...`);

      // 4. Maak de NIEUWE prijs aan in Stripe
      const stripePriceObject = await stripe.prices.create({
        product: product.id,
        unit_amount: nieuwePrijsInCenten,
        currency: 'eur',
      });

      // 5. Bereken de pure arbitrage-waarde (verschil tussen jouw nieuwe prijs en internet)
      const arbitrageWaarde = nieuwePrijsInEuro - competitorResult.price;

      // 6. Update het product met de nieuwe default_price en verrijk de metadata
      const updatedMetadata = {
        ...product.metadata,
        competitor_price: competitorResult.price.toFixed(2),
        competitor_url: competitorResult.url,
        arbitrage: arbitrageWaarde.toFixed(2)
      };

      await stripe.products.update(product.id, {
        default_price: stripePriceObject.id,
        metadata: updatedMetadata
      });

      console.log(`✅ Stripe product en LIVE VERKOOPPRIJS succesvol bijgewerkt voor: ${product.name}`);
    }

  } catch (error) {
    console.error('[-] Kritieke fout tijdens de arbitrage run:', error.message);
  }
  
  console.log('\n[*] Prijs-update scan voltooid.');
}

runArbitrage();