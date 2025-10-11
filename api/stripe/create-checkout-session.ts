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

        // Product mapping for analytics and pricing
        const PRODUCTS = {
            // Raffle Tickets
            "4-1-ticket": {
                name: "10 Piece Lucky Raffle Ticket",
                description: "Single raffle ticket for 10 Piece Tone merch giveaway",
                price: 10.00,
                productId: process.env.STRIPE_RAFFLE_1_PRODUCT_ID,
            },
            "4-3-tickets": {
                name: "10 Piece Lucky Raffle Tickets (3)",
                description: "3 raffle tickets for 10 Piece Tone merch giveaway",
                price: 25.00,
                productId: process.env.STRIPE_RAFFLE_3_PRODUCT_ID,
            },
            "4-10-tickets": {
                name: "10 Piece Lucky Raffle Tickets (10)",
                description: "10 raffle tickets for 10 Piece Tone merch giveaway",
                price: 75.00,
                productId: process.env.STRIPE_RAFFLE_10_PRODUCT_ID,
            },
            // Apparel
            "3": {
                name: "Auto Garage Tee",
                description: "Premium white graphic tee",
                price: 25.00,
                productId: process.env.STRIPE_TEE_PRODUCT_ID,
            },
            "2": {
                name: "Tony's Race Cap",
                description: "Red racing cap with Pretty Tony's logo",
                price: 20.00,
                productId: process.env.STRIPE_CAP_PRODUCT_ID,
            },
            "1": {
                name: "Tony's Classic Polo Shirt",
                description: "Classic polo shirt with embroidered logo",
                price: 35.00,
                productId: process.env.STRIPE_POLO_PRODUCT_ID,
            },
        };

        // Build line items from cart using Stripe prices
        const lineItems = [];

        let subtotal = 0;

        for (const [cartKey, quantity] of Object.entries(cart)) {
            console.log(`Processing cart item: ${cartKey}`);

            // Parse cart key to get product ID and variant/size
            const parts = cartKey.split("-");
            const productId = parts[0];
            const variantOrSize =
                parts.length > 1 ? parts.slice(1).join("-") : undefined;

            let productMapping;

            // For raffle tickets, use the full cart key (e.g., "4-1-ticket")
            if (productId === "4") {
                productMapping = PRODUCTS[cartKey];
            } else {
                // For apparel items, use just the product ID (e.g., "1", "2", "3")
                productMapping = PRODUCTS[productId];
            }

            if (!productMapping) {
                console.warn(
                    `No product mapping found for cart item: ${cartKey} (productId: ${productId})`
                );
                continue;
            }

            const itemTotal = productMapping.price * Number(quantity);
            subtotal += itemTotal;

            const lineItem = {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: productMapping.name,
                        description: productMapping.description,
                        metadata: {
                            platform_product_id: productMapping.productId,
                            cart_key: cartKey,
                            size: variantOrSize || '',
                        },
                    },
                    unit_amount: Math.round(productMapping.price * 100),
                },
                quantity: Number(quantity),
            };

            lineItems.push(lineItem);
        }

        // Add shipping as a separate line item
        const shippingAmount = 10.0;
        subtotal += shippingAmount;
        
        lineItems.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Shipping",
                    description: "Standard shipping for your Pretty Tony's order",
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

        // Calculate 5% application fee on total (including shipping)
        const applicationFee = Math.round(subtotal * 0.05 * 100); // 5% in cents

        console.log(`🛒 Creating checkout session for ${lineItems.length - 1} products + shipping`);
        console.log(`Subtotal: $${subtotal.toFixed(2)}`);
        console.log(`Application fee (5%): $${(applicationFee / 100).toFixed(2)}`);
        console.log(`Using Connect account: ${connectAccountId}`);
        console.log(`Line items:`, JSON.stringify(lineItems, null, 2));

        // Create checkout session with Connect account and application fee
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
                payment_intent_data: {
                    application_fee_amount: applicationFee,
                },
                metadata: {
                    source: "pretty-tonys-autoshop",
                    cart_data: JSON.stringify(cart),
                    platform_fee: (applicationFee / 100).toFixed(2),
                },
                shipping_address_collection: {
                    allowed_countries: ["US", "CA"],
                },
            },
            {
                stripeAccount: connectAccountId, // Direct charge to Connect account
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
