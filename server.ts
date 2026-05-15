import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import productsHandler from "./api/products";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe initialization
  const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16' as any,
      }) 
    : null;

  app.use(express.json());

  // API routes
  app.get("/api/products", (req, res) => productsHandler(req, res));

  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const { items } = req.body;

    try {
      const paymentMethodTypes = (process.env.STRIPE_PAYMENT_METHOD_TYPES || "card,ideal")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as any;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: paymentMethodTypes,
        line_items: (Array.isArray(items) ? items : []).map((item: any) => {
          const quantity = typeof item.quantity === "number" ? item.quantity : 1;
          const priceId = item.stripePriceId || item.priceId;
          if (priceId) {
            return { price: priceId, quantity };
          }
          return {
            price_data: {
              currency: "eur",
              product_data: {
                name: item.name,
                images: item.image ? [item.image] : [],
              },
              unit_amount: Math.round(
                (item.priceEur || parseFloat(String(item.price).replace(",", ".")) || 0) *
                  100,
              ),
            },
            quantity,
          };
        }),
        mode: "payment",
        success_url: `${process.env.APP_URL || "http://localhost:3000"}/success`,
        cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/cart`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
