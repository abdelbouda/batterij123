import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(key, {
      apiVersion: '2023-10-16' as any,
    });
  }
  return stripeInstance;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({
      error:
        'STRIPE_SECRET_KEY is not configured. Set it in Vercel project settings.',
    });
  }

  const { items } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      automatic_payment_methods: { enabled: true },
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round((item.priceEur || parseFloat(item.price) || 0) * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/success`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/cart`,
    } as any);

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
