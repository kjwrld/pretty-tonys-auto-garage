import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const connectAccountId = process.env.STRIPE_CONNECT_ACCOUNT_ID!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err);
        return res
            .status(400)
            .json({ error: "Webhook signature verification failed" });
    }

    // Handle the event
    try {
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;

            case "payment_intent.succeeded":
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentSucceeded(paymentIntent);
                break;

            case "invoice.payment_succeeded":
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentSucceeded(invoice);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("❌ Error processing webhook:", error);
        res.status(500).json({ error: "Webhook processing failed" });
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log("🛒 Processing completed checkout session:", session.id);

    try {
        // Get expanded session data from Connect account
        const expandedSession = await stripe.checkout.sessions.retrieve(
            session.id,
            {
                expand: ["customer", "payment_intent.payment_method", "line_items"],
                stripeAccount: connectAccountId,
            }
        );

        // Extract customer data
        const customerData = {
            sessionId: expandedSession.id,
            paymentIntentId: expandedSession.payment_intent?.id,
            customerId: expandedSession.customer?.id || expandedSession.customer,
            email: expandedSession.customer_details?.email,
            name: expandedSession.customer_details?.name,
            phone: expandedSession.customer_details?.phone,
            address: expandedSession.customer_details?.address,
            shippingAddress: expandedSession.shipping_details?.address,
            amount: expandedSession.amount_total! / 100,
            currency: expandedSession.currency?.toUpperCase(),
            paymentStatus: expandedSession.payment_status,
            cartData: expandedSession.metadata?.cart_data,
            cardLast4: (expandedSession.payment_intent as any)?.payment_method?.card?.last4,
            cardBrand: (expandedSession.payment_intent as any)?.payment_method?.card?.brand,
        };

        // Parse name
        const nameParts = customerData.name?.split(" ") || [];
        const firstName = nameParts[0] || "Customer";
        const lastName = nameParts.slice(1).join(" ") || undefined;

        console.log(`💳 Order completed: ${firstName} - $${customerData.amount}`);

        // Get line items for order details
        const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id,
            { limit: 100 },
            { stripeAccount: connectAccountId }
        );

        const cartItems = lineItems.data.map(item => ({
            name: item.description,
            quantity: item.quantity,
            price: (item.amount_total! / 100).toFixed(2),
        }));

        // Send purchase notification to MailChimp
        await sendPurchaseNotificationToMailchimp({
            email: customerData.email!,
            firstName,
            lastName,
            amount: customerData.amount,
            cartItems,
            sessionId: customerData.sessionId,
            shippingAddress: customerData.shippingAddress,
        });

        console.log("✅ Successfully processed checkout session:", session.id);
    } catch (error) {
        console.error("❌ Error processing checkout session:", error);
        throw error;
    }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log("💳 Payment succeeded:", paymentIntent.id);
    // Additional processing if needed for standalone payment intents
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log("📄 Invoice payment succeeded:", invoice.id);
    // Handle recurring subscription payments if you add subscriptions later
}

async function sendPurchaseNotificationToMailchimp(orderData: any) {
    try {
        const response = await fetch(`${process.env.VITE_APP_URL || 'http://localhost:3001'}/api/mailchimp/purchase-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error(`MailChimp API error: ${response.status}`);
        }

        console.log("📧 Purchase notification sent to MailChimp");
    } catch (error) {
        console.error("❌ Failed to send purchase notification:", error);
        // Don't throw - webhook should still succeed even if email fails
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "1mb",
        },
    },
};