import Stripe from 'stripe';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

// Initialiseer Stripe met je geheime sleutel uit je .env bestand
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function scrapePrice(url) {
  try {
    if (!url) return null;
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    let priceText = '';
    
    // Selectors voor de specifieke platformen
    if (url.includes('thuisbatterij.io')) {
      priceText = $('.price .amount, .woocommerce-Price-amount').first().text(); 
    } else if (url.includes('thuisbatterij.nl')) {
      priceText = $('.woocommerce-Price-amount, .price').first().text();
    }

    if (!priceText) return null;

    // Maak de tekst schoon: filter alles behalve cijfers, komma's en punten
    let cleanPrice = priceText.replace(/[^\d,.-]/g, '').replace(',', '.');
    let price = parseFloat(cleanPrice);
    
    return isNaN(price) ? null : price;
  } catch (error) {
    console.error(`[-] Scrape-fout voor ${url}:`, error.message);
    return null;
  }
}

async function runArbitrage() {
  console.log('[*] Starten van de Stripe Arbitrage scan...');
  
  try {
    // 1. Haal alle actieve producten op uit je Stripe account
    const products = await stripe.products.list({ active: true, limit: 100 });
    console.log(`[*] ${products.data.length} actieve producten opgehaald uit Stripe.`);

    for (const product of products.data) {
      const { competitor_url1, competitor_url2 } = product.metadata || {};

      // Alleen verwerken als er minimaal één concurrenten-url in de Stripe metadata staat
      if (!competitor_url1 && !competitor_url2) {
        continue;
      }

      console.log(`\n[*] Verwerken van product: ${product.name}`);

      // 2. Haal de prijzen op van de concurrenten
      const price1 = await scrapePrice(competitor_url1);
      const price2 = await scrapePrice(competitor_url2);

      const validPrices = [price1, price2].filter(p => p !== null);
      if (validPrices.length === 0) {
        console.log(`[-] Geen prijzen kunnen vinden op de concurrenten-URL's voor ${product.name}.`);
        continue;
      }

      const lowestCompetitorPrice = Math.min(...validPrices);
      const lowestCompetitorUrl = lowestCompetitorPrice === price1 ? competitor_url1 : competitor_url2;
      console.log(`[+] Laagste concurrentenprijs gevonden: €${lowestCompetitorPrice} via ${lowestCompetitorUrl}`);

      // 3. Haal je eigen standaard verkoopprijs op uit Stripe
      if (!product.default_price) {
        console.log(`[-] Product ${product.name} heeft geen default_price ingesteld in Stripe. Overslaan.`);
        continue;
      }

      const priceObject = await stripe.prices.retrieve(product.default_price);
      const huidigeStripePrijs = priceObject.unit_amount / 100; // Stripe rekent in centen
      console.log(`[*] Jouw huidige Stripe verkoopprijs: €${huidigeStripePrijs}`);

      // 4. Bereken de arbitrage: huidige verkoopprijs - competitor_price + 100
      const arbitrageWaarde = huidigeStripePrijs - lowestCompetitorPrice + 100;
      console.log(`[+] Berekende arbitrage: €${arbitrageWaarde.toFixed(2)}`);

      // 5. Update de metadata in Stripe direct
      await stripe.products.update(product.id, {
        metadata: {
          competitor_price: lowestCompetitorPrice.toFixed(2),
          competitor_url: lowestCompetitorUrl,
          arbitrage: arbitrageWaarde.toFixed(2)
        }
      });
      console.log(`✅ Stripe metadata succesvol bijgewerkt voor: ${product.name}`);
    }

  } catch (error) {
    console.error('[-] Kritieke fout tijdens de arbitrage run:', error.message);
  }
  
  console.log('\n[*] Arbitrage scan voltooid.');
}

runArbitrage();
