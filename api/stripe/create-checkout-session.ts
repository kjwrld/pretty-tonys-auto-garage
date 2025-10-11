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
        const { cart, currency = "usd" } = req.body;

        if (!cart || Object.keys(cart).length === 0) {
            return res.status(400).json({
                error: "Cart is empty",
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
            apiVersion: "2025-09-30.clover",
        });

        // Stripe Product & Price ID mapping
        const STRIPE_PRODUCTS = {
            // Raffle Tickets
            "4-1-ticket": {
                priceId: process.env.STRIPE_RAFFLE_1_PRICE_ID,
                productId: process.env.STRIPE_RAFFLE_1_PRODUCT_ID,
            },
            "4-3-tickets": {
                priceId: process.env.STRIPE_RAFFLE_3_PRICE_ID,
                productId: process.env.STRIPE_RAFFLE_3_PRODUCT_ID,
            },
            "4-10-tickets": {
                priceId: process.env.STRIPE_RAFFLE_10_PRICE_ID,
                productId: process.env.STRIPE_RAFFLE_10_PRODUCT_ID,
            },
            // Apparel (sizes handled as metadata)
            "3": {
                // White Graphic Tee
                priceId: process.env.STRIPE_TEE_PRICE_ID,
                productId: process.env.STRIPE_TEE_PRODUCT_ID,
            },
            "2": {
                // Red Racing Hat
                priceId: process.env.STRIPE_CAP_PRICE_ID,
                productId: process.env.STRIPE_CAP_PRODUCT_ID,
            },
            "1": {
                // Classic Polo Shirt
                priceId: process.env.STRIPE_POLO_PRICE_ID,
                productId: process.env.STRIPE_POLO_PRODUCT_ID,
            },
        };

        // Build line items from cart using Stripe prices
        const lineItems = [];

        for (const [cartKey, quantity] of Object.entries(cart)) {
            console.log(`Processing cart item: ${cartKey}`);

            // Parse cart key to get product ID and variant/size
            const parts = cartKey.split("-");
            const productId = parts[0];
            const variantOrSize =
                parts.length > 1 ? parts.slice(1).join("-") : undefined;

            let stripeMapping;

            // For raffle tickets, use the full cart key (e.g., "4-1-ticket")
            if (productId === "4") {
                stripeMapping = STRIPE_PRODUCTS[cartKey];
            } else {
                // For apparel items, use just the product ID (e.g., "1", "2", "3")
                stripeMapping = STRIPE_PRODUCTS[productId];
            }

            if (!stripeMapping || !stripeMapping.priceId) {
                console.warn(
                    `No Stripe price found for cart item: ${cartKey} (productId: ${productId})`
                );
                continue;
            }

            const lineItem = {
                price: stripeMapping.priceId,
                quantity: Number(quantity),
            };

            console.log(
                `Added line item for ${cartKey}: price ${stripeMapping.priceId}, quantity ${quantity}`
            );
            lineItems.push(lineItem);
        }

        // Add shipping as a separate line item
        const shippingAmount = 10.0;
        lineItems.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Shipping",
                    description:
                        "Standard shipping for your Pretty Tony's order",
                },
                unit_amount: Math.round(shippingAmount * 100),
            },
            quantity: 1,
        });

        if (lineItems.length === 1) {
            // Only shipping
            console.error("❌ No valid products found in cart");
            return res.status(400).json({
                error: "No valid products found in cart",
            });
        }

        console.log(
            `🛒 Creating checkout session for ${
                lineItems.length - 1
            } products + shipping using Stripe product IDs`
        );
        console.log(`Using Connect account: ${connectAccountId}`);
        console.log(
            `STRIPE_POLO_PRICE_ID: ${process.env.STRIPE_POLO_PRICE_ID}`
        );
        console.log(
            `STRIPE_RAFFLE_1_PRICE_ID: ${process.env.STRIPE_RAFFLE_1_PRICE_ID}`
        );
        console.log(`Line items:`, JSON.stringify(lineItems, null, 2));

        // Create checkout session with Connect account
        const session = await stripe.checkout.sessions.create(
            {
                payment_method_types: ["card"],
                mode: "payment",
                line_items: lineItems,
                success_url: `${
                    req.headers.origin || "http://localhost:3001"
                }/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${
                    req.headers.origin || "http://localhost:3001"
                }/?canceled=true`,
                metadata: {
                    source: "pretty-tonys",
                    cart_data: JSON.stringify(cart),
                },
                shipping_address_collection: {
                    allowed_countries: ["US", "CA"],
                },
            },
            {
                stripeAccount: connectAccountId, // Use Connect account
            }
        );

        console.log(`✅ Created checkout session ${session.id}`);

        res.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error: any) {
        console.error("❌ Stripe checkout session error:", error);
        res.status(500).json({
            error: "Failed to create checkout session",
            message: error.message,
        });
    }
}
