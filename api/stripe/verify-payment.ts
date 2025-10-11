import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({ error: "Session ID is required" });
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

        console.log(`🔍 Verifying payment for session: ${session_id}`);

        // Retrieve the session from Connect account
        const session = await stripe.checkout.sessions.retrieve(
            session_id,
            { stripeAccount: connectAccountId }
        );

        if (session.payment_status === "paid") {
            // Get customer details if available
            let customerEmail = null;
            if (session.customer && typeof session.customer === 'string') {
                try {
                    const customer = await stripe.customers.retrieve(
                        session.customer,
                        { stripeAccount: connectAccountId }
                    );
                    if ('email' in customer) {
                        customerEmail = customer.email;
                    }
                } catch (error) {
                    console.log("Could not retrieve customer details");
                }
            }

            console.log(`✅ Payment verified: $${(session.amount_total! / 100).toFixed(2)}`);

            res.json({
                success: true,
                customer_email: customerEmail,
                customer_name: session.customer_details?.name,
                shipping_address: session.customer_details?.address,
                amount_total: session.amount_total! / 100,
                currency: session.currency,
                payment_status: session.payment_status,
                cart_data: session.metadata?.cart_data,
                session_id: session.id,
            });
        } else {
            console.log(`❌ Payment not completed: ${session.payment_status}`);
            res.json({
                success: false,
                message: "Payment not completed",
                payment_status: session.payment_status,
            });
        }
    } catch (error: any) {
        console.error("❌ Payment verification error:", error);
        res.status(500).json({
            error: "Failed to verify payment",
            message: error.message,
        });
    }
}