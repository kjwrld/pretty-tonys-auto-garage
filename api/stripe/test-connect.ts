import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { supabaseAdmin } from "../../lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        const connectAccountId = process.env.STRIPE_CONNECT_ACCOUNT_ID;

        if (!stripeSecretKey || !connectAccountId) {
            return res.status(500).json({
                error: "Stripe credentials not configured",
            });
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: "2024-12-18.acacia",
        });

        console.log(`🔍 Testing Connect account: ${connectAccountId}`);

        // Test 1: Get account info
        const account = await stripe.accounts.retrieve(connectAccountId);
        console.log("✅ Account retrieved:", account.id, account.business_profile?.name || "No business name");

        // Test 2: Get products from Connect account
        const products = await stripe.products.list(
            { limit: 10 },
            { stripeAccount: connectAccountId }
        );
        console.log(`📦 Found ${products.data.length} products in Connect account`);

        // Test 3: Get our specific product IDs
        const productIds = [
            process.env.STRIPE_RAFFLE_1_PRODUCT_ID,
            process.env.STRIPE_RAFFLE_3_PRODUCT_ID,
            process.env.STRIPE_RAFFLE_10_PRODUCT_ID,
            process.env.STRIPE_TEE_PRODUCT_ID,
            process.env.STRIPE_CAP_PRODUCT_ID,
            process.env.STRIPE_POLO_PRODUCT_ID,
        ].filter(Boolean);

        const productsWithPrices = await Promise.all(
            productIds.map(async (productId) => {
                try {
                    const product = await stripe.products.retrieve(productId!, {
                        stripeAccount: connectAccountId,
                    });
                    const prices = await stripe.prices.list(
                        { product: productId!, limit: 5 },
                        { stripeAccount: connectAccountId }
                    );
                    return {
                        ...product,
                        prices: prices.data,
                    };
                } catch (error) {
                    console.error(`❌ Error fetching product ${productId}:`, error);
                    return null;
                }
            })
        );

        res.json({
            success: true,
            account: {
                id: account.id,
                name: account.business_profile?.name || "No business name",
                email: account.email,
                country: account.country,
            },
            allProducts: products.data.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
                active: p.active,
            })),
            ourProducts: productsWithPrices.filter(Boolean).map((p) => ({
                id: p!.id,
                name: p!.name,
                description: p!.description,
                active: p!.active,
                prices: p!.prices.map((price) => ({
                    id: price.id,
                    amount: price.unit_amount,
                    currency: price.currency,
                    type: price.type,
                })),
            })),
        });

        // Test Supabase if requested
        if (req.query.testSupabase === 'true') {
            try {
                const { data: customers, error: queryError } = await supabaseAdmin
                    .from('customers')
                    .select('id')
                    .limit(1);
                
                return res.json({
                    success: true,
                    supabase: {
                        success: !queryError,
                        error: queryError?.message || null,
                        details: queryError || "Connected successfully"
                    }
                });
            } catch (supabaseError: any) {
                return res.json({
                    success: true,
                    supabase: {
                        success: false,
                        error: supabaseError.message,
                        details: supabaseError
                    }
                });
            }
        }

    } catch (error: any) {
        console.error("❌ Connect test failed:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            type: error.type,
            code: error.code,
        });
    }
}