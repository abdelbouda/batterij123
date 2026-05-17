import Stripe from 'stripe';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

// Voorkeursdomeinen voor Fase 1
const TARGET_DOMAINS = [
  'thuisbatterij.nl',
  'thuisbatterij.io',
  'solar-bouwmarkt.nl',
  'winkelman-zonnepanelen.nl',
  'coolblue.nl'
];

// Handmatige markt-nulmeting ter beveiliging tegen parsing-fouten en accessoires
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

// Harde uitsluitingen om accessoires en irrelevante rommel te filteren
const VERBODEN_WORDS = ['kabel', 'cable', 'beugel', 'bracket', 'tas', 'bag', 'splitter', 'cover', 'hoes', 'verlengsnoer', 'plug', 'stekker', 'montage', 'ordner', 'map', 'sifon', 'badsifon', 'adapter', 'schroef'];

function cleanProductName(name) {
  let clean = name.split('—')[0].split('-')[0];
  return clean.trim();
}

function getMarketEstimate(productName) {
  for (const [key, value] of Object.entries(MARKET_ESTIMATES)) {
    if (productName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return 1000; // Veilige fallback
}

// Geoptimaliseerde prijs-scrapper en parser
function extractLowestPriceFromResults(organicResults, marketEstimate) {
  let lowestPrice = Infinity;
  let lowestPriceUrl = '';
  let itemTitle = '';

  if (!organicResults || organicResults.length === 0) return null;

  for (const result of organicResults) {
    const titleLower = result.title.toLowerCase();
    const snippetToScan = `${result.title} ${result.snippet}`;

    // Filter direct op verboden accessoire-woorden
    if (VERBODEN_WORDS.some(woord => titleLower.includes(woord))) continue;

    // Verbeterde Regex: Pak bedragen inclusief optionele punten en komma's
    const priceRegex = /(?:€|EUR)\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?|\d+)/gi;
    let match;
    
    while ((match = priceRegex.exec(snippetToScan)) !== null) {
      let rawPrice = match[1].trim();
      let price = null;

      // Controleer hoe de decimalen zijn opgebouwd
      if (rawPrice.includes(',')) {
        // Formaat zoals "799,00" of "1.250,00" -> Duizendtal-punten weg, komma wordt punt
        let cleanStr = rawPrice.replace(/\./g, '').replace(',', '.');
        price = parseFloat(cleanStr);
      } else {
        // Formaat zonder komma, check op valse duizendtal-punten (bijv "1.250" ipv "1250")
        if (rawPrice.includes('.') && rawPrice.split('.').pop().length !== 3) {
          price = parseFloat(rawPrice);
        } else {
          price = parseFloat(rawPrice.replace(/\./g, ''));
        }
      }

      if (!price || isNaN(price)) continue;

      // SLIMME MARGE BEVEILIGING
      const minimaleGestaafdePrijs = marketEstimate * 0.75; // Mag niet meer dan 25% onder schatting liggen
      const maximaleGestaafdePrijs = marketEstimate * 3.0;  // Mag nooit meer dan 3x zo hoog zijn (voorkomt 8 ton fouten)

      if (price < minimaleGestaafdePrijs || price > maximaleGestaafdePrijs) {
        // Prijs valt buiten de logische realiteit voor dit product -> Overslaan
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

  return { price: lowestPrice, url: lowestPriceUrl, title: itemTitle };
}

async function getPriceScrape(productName, marketEstimate) {
  const cleanName = cleanProductName(productName);
  
  // ==========================================
  // FASE 1: SCAN BINNEN DE 5 TOP LEVERANCIERS
  // ==========================================
  try {
    const siteQuery = TARGET_DOMAINS.map(domain => `site:${domain}`).join(' OR ');
    const targetQuery = `${cleanName} (${siteQuery})`;
    
    console.log(`[*] Fase 1: Scrapen binnen top-leveranciers voor: "${cleanName}"...`);
    
    const response = await axios.get('https://serpapi.com/search.json', {
      params: { engine: 'google', q: targetQuery, hl: 'nl', gl: 'nl', api_key: SERPAPI_KEY }
    });

    const targetResult = extractLowestPriceFromResults(response.data.organic_results, marketEstimate);
    if (targetResult) {
      console.log(`    [+] Match gevonden binnen de top-leveranciers!`);
      return targetResult;
    }
  } catch (err) {
    console.error(`    [-] Fout tijdens Fase 1: ${err.message}`);
  }

  // ==========================================
  // FASE 2: ACHTERVANG - BREED ZOEKEN OP GOOGLE
  // ==========================================
  try {
    console.log(`    [-] Niets gevonden bij top-leveranciers. Fase 2 starten: Breed zoeken op internet...`);
    
    const response = await axios.get('https://serpapi.com/search.json', {
      params: { engine: 'google', q: `"${cleanName}" prijs`, hl: 'nl', gl: 'nl', api_key: SERPAPI_KEY }
    });

    const wideResult = extractLowestPriceFromResults(response.data.organic_results, marketEstimate);
    if (wideResult) {
      console.log(`    [+] Match gevonden via brede internet-scan!`);
      return wideResult;
    }
  } catch (err) {
    console.error(`    [-] Fout tijdens Fase 2: ${err.message}`);
  }

  return null;
}

async function runPureArbitrage() {
  console.log('[*] ========================================================');
  console.log('[*] STARTEN VAN DE WATERDICHTE COMPETITOR ARBITRAGE SCAN');
  console.log('[*] ========================================================');
  
  try {
    const products = await stripe.products.list({ active: true, limit: 100 });
    console.log(`[*] ${products.data.length} actieve producten opgehaald uit Stripe.`);

    for (const product of products.data) {
      console.log(`\n[*] Volledig autonome verwerking voor: ${product.name}`);
      const marketEstimate = getMarketEstimate(product.name);

      const competitorResult = await getPriceScrape(product.name, marketEstimate);

      if (!competitorResult) {
        console.log(`[-] Geen veilige, bruikbare prijs kunnen vinden (noch specifiek, noch breed). Overslaan.`);
        continue;
      }

      console.log(`[+] Geverifieerde match gevonden: "${competitorResult.title}"`);
      console.log(`[+] Realtime concurrentenprijs: €${competitorResult.price.toFixed(2)}`);

      // Bereken de nieuwe live verkoopprijs (+ €100,-)
      const nieuwePrijsInEuro = competitorResult.price + 100;
      const nieuwePrijsInCenten = Math.round(nieuwePrijsInEuro * 100);
      console.log(`[+] Nieuwe live doelprijs (Competitor + 100): €${nieuwePrijsInEuro.toFixed(2)}`);
      console.log(`[+] Bron URL: ${competitorResult.url}`);

      console.log(`[*] Live prijs overschrijven in Stripe naar €${nieuwePrijsInEuro.toFixed(2)}...`);

      // Maak direct het nieuwe prijs-object aan in Stripe
      const stripePriceObject = await stripe.prices.create({
        product: product.id,
        unit_amount: nieuwePrijsInCenten,
        currency: 'eur',
      });

      const arbitrageWaarde = nieuwePrijsInEuro - competitorResult.price;

      // Update de metadata met schone waarden
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

      console.log(`✅ Stripe live prijs succesvol gecorrigeerd!`);
    }

  } catch (error) {
    console.error('[-] Kritieke fout tijdens de run:', error.message);
  }
  console.log('\n[*] Pure website-scraperscan voltooid. Foutieve prijzen zijn rechtgetrokken!');
}

runPureArbitrage();