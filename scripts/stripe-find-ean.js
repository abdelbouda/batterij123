import Stripe from 'stripe';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

// 1. De enige leveranciers waar we puur en alleen binnen scrapen
const TARGET_DOMAINS = [
  'thuisbatterij.nl',
  'thuisbatterij.io',
  'solar-bouwmarkt.nl',
  'winkelman-zonnepanelen.nl',
  'coolblue.nl'
];

// 2. HANDMATIGE INSCHATTING VOOR DE 25% BESCHERMING
// Vul hier per product de normale marktwaarde in. 
// Vindt het script een prijs die >25% lager is dan dit bedrag? Dan wordt het geweigerd (bescherming tegen accessoires).
const MARKET_ESTIMATES = {
  'HomeWizard Wi-Fi P1 Meter': 30,
  'Lunergy Hub 2400 AC': 1000,
  'Sessy 5 kWh': 2200,
  'ZinVolt Power': 800,
  'EcoFlow STREAM AC Pro': 1200,
  'Anker SOLIX Solarbank 3 E2700 Pro': 1100,
  'Zendure SolarFlow 2400 AC+': 1300,
  'HomeWizard Plug-In Battery 2,7 kWh': 900,
  'EcoFlow STREAM Ultra': 2500,
  'Indevolt SolidFlex 2000': 1800,
  'Marstek Venus E 3.0': 1500
};

// Woorden die we direct uitsluiten in de paginatitels van concurrenten
const VERBODEN_WORDS = ['kabel', 'cable', 'beugel', 'bracket', 'tas', 'bag', 'splitter', 'cover', 'hoes', 'verlengsnoer', 'plug', 'stekker', 'montage', 'ordner', 'map'];

// Haal marketing-romptekst weg om puur op Merk + Model te zoeken
function cleanProductName(name) {
  let clean = name.split('—')[0].split('-')[0];
  return clean.trim();
}

// Haal de schatting op (of geef een veilige fallback als de naam net afwijkt)
function getMarketEstimate(productName) {
  for (const [key, value] of Object.entries(MARKET_ESTIMATES)) {
    if (productName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return 1000; // Algemene fallback mocht een productnaam niet matchen
}

// Puur organisch zoeken op de specifieke sites
async function getLowestPriceFromTopSuppliers(productName, marketEstimate) {
  try {
    const cleanName = cleanProductName(productName);
    
    // Bouw de pure site: query (bijv: "Sessy 5 kWh (site:thuisbatterij.nl OR site:coolblue.nl)")
    const siteQuery = TARGET_DOMAINS.map(domain => `site:${domain}`).join(' OR ');
    const finalSearchQuery = `"${cleanName}" (${siteQuery})`;
    
    console.log(`[*] Organisch scrapen op sites voor: "${cleanName}"...`);
    
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google', // Pure Google web-search, GEEN Shopping!
        q: finalSearchQuery,
        hl: 'nl',
        gl: 'nl',
        api_key: SERPAPI_KEY
      }
    });

    const organicResults = response.data.organic_results;

    if (!organicResults || organicResults.length === 0) {
      console.log(`[-] Geen organische resultaten gevonden op de leverancierssites.`);
      return null;
    }

    let lowestPrice = Infinity;
    let lowestPriceUrl = '';
    let itemTitle = '';

    for (const result of organicResults) {
      const titleLower = result.title.toLowerCase();
      const snippetToScan = `${result.title} ${result.snippet}`;

      // 1. Controle op verboden accessoire-woorden
      const bevatVerbodenWoord = VERBODEN_WORDS.some(woord => titleLower.includes(woord));
      if (bevatVerbodenWoord) continue;

      // 2. Extraheer de euro-bedragen uit de tekst
      const priceRegex = /(?:€|EUR)\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/gi;
      let match;
      
      while ((match = priceRegex.exec(snippetToScan)) !== null) {
        let rawPrice = match[1];
        let cleanPriceStr = rawPrice.replace(/\./g, '').replace(',', '.');
        let price = parseFloat(cleanPriceStr);

        if (!price || isNaN(price)) continue;

        // 3. DE VERGEZOCHTE BEVEILIGING: 25% marge op basis van jouw handmatige schatting
        const minimaleGestaafdePrijs = marketEstimate * 0.75;
        if (price < minimaleGestaafdePrijs) {
          console.log(`    [Beveiliging] Prijs €${price} geweigerd! Wijkt meer dan 25% af van de geschatte marktprijs (€${marketEstimate}) op site: ${result.source}`);
          continue;
        }

        if (price < lowestPrice) {
          lowestPrice = price;
          lowestPriceUrl = result.link;
          itemTitle = result.title;
        }
      }
    }

    if (lowestPrice === Infinity) return null;

    return {
      price: lowestPrice,
      url: lowestPriceUrl,
      title: itemTitle
    };

  } catch (error) {
    console.error(`[-] Fout tijdens leveranciers-scan:`, error.message);
    return null;
  }
}

async function runArbitrage() {
  console.log('[*] Starten van de Pure Leveranciers Website Scraping (Zonder Google Shopping & Zonder Stripe-veld checks)...');
  
  if (!SERPAPI_KEY) {
    console.error('[-] Kritieke fout: SERPAPI_API_KEY ontbreekt!');
    return;
  }

  try {
    const products = await stripe.products.list({ active: true, limit: 100 });
    console.log(`[*] ${products.data.length} actieve producten opgehaald uit Stripe.`);

    for (const product of products.data) {
      console.log(`\n[*] Verwerken van product: ${product.name}`);

      const marketEstimate = getMarketEstimate(product.name);
      
      // 1. Zoek de echte laagste prijs puur op de websites van de leveranciers
      const competitorResult = await getLowestPriceFromTopSuppliers(product.name, marketEstimate);

      if (!competitorResult) {
        console.log(`[-] Geen bruikbare prijs gevonden op de doelsites voor ${product.name}. Overslaan.`);
        continue;
      }

      console.log(`[+] Match gevonden op website: "${competitorResult.title}"`);
      console.log(`[+] Laagste gecontroleerde prijs: €${competitorResult.price.toFixed(2)}`);

      // 2. Bereken de NIEUWE live Stripe prijs: competitor_price + 100
      const nieuwePrijsInEuro = competitorResult.price + 100;
      const nieuwePrijsInCenten = Math.round(nieuwePrijsInEuro * 100);
      console.log(`[+] Doelprijs voor je shop (Competitor + 100): €${nieuwePrijsInEuro.toFixed(2)}`);

      // 3. Maak direct de nieuwe prijs aan en activeer deze live
      console.log(`[*] Live prijs overschrijven naar €${nieuwePrijsInEuro.toFixed(2)}...`);

      const stripePriceObject = await stripe.prices.create({
        product: product.id,
        unit_amount: nieuwePrijsInCenten,
        currency: 'eur',
      });

      const arbitrageWaarde = nieuwePrijsInEuro - competitorResult.price;

      // 4. Update de metadata in Stripe met de schone, betrouwbare waarden
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

      console.log(`✅ Live verkoopprijs succesvol gecorrigeerd in Stripe!`);
    }

  } catch (error) {
    console.error('[-] Kritieke fout tijdens de run:', error.message);
  }
  
  console.log('\n[*] Gerichte website-scraperscan voltooid.');
}

runArbitrage();