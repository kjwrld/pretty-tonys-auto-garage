import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { amount, currency = "usd", cart } = req.body;

        if (!amount || amount < 50) {
            // Stripe minimum is $0.50
            return res.status(400).json({
                error: "Invalid amount. Minimum is $0.50",
            });
        }

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        const connectAccountId = process.env.STRIPE_CONNECT_ACCOUNT_ID;

        if (!stripeSecretKey || !connectAccountId) {
            console.error("❌ Missing Stripe credentials");
            return res.status(500).json({
                error: "Payment processing not configured",
            });
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: "2024-12-18.acacia",
        });

        console.log(
            `💳 Creating payment intent for $${(amount / 100).toFixed(
                2
            )} via Connect account`
        );

        // Create payment intent with Connect account
        const paymentIntent = await stripe.paymentIntents.create(
            {
                amount: Math.round(amount), // amount in cents
                currency,
                metadata: {
                    source: "pretty-tonys",
                    cart_items: cart ? JSON.stringify(cart) : "",
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            },
            {
                stripeAccount: connectAccountId, // Use Connect account
            }
        );

        console.log(
            `✅ Created payment intent ${paymentIntent.id} for $${(
                amount / 100
            ).toFixed(2)}`
        );

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error: any) {
        console.error("❌ Stripe payment intent error:", error);
        res.status(500).json({
            error: "Failed to create payment intent",
            message: error.message,
        });
    }
}
