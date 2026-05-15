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
    const paymentMethodTypes = (process.env.STRIPE_PAYMENT_METHOD_TYPES || 'card,ideal')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean) as any;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      line_items: (Array.isArray(items) ? items : []).map((item: any) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
        const priceId = item.stripePriceId || item.priceId;
        if (priceId) {
          return { price: priceId, quantity };
        }
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(
              (item.priceEur || parseFloat(String(item.price).replace(',', '.')) || 0) *
                100,
            ),
          },
          quantity,
        };
      }),
      mode: 'payment',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/success`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/cart`,
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
