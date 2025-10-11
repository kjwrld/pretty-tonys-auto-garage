import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { saveCustomerData, generateRaffleTicketNumbers, type CustomerData } from "../../lib/supabase";
import { createRaffleTickets, type RaffleTicket } from "../../lib/raffle";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
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
            },
            { stripeAccount: connectAccountId }
        );

        // Extract customer data
        const customerData = {
            sessionId: expandedSession.id,
            paymentIntentId: typeof expandedSession.payment_intent === 'string' 
                ? expandedSession.payment_intent 
                : expandedSession.payment_intent?.id,
            customerId: typeof expandedSession.customer === 'string' 
                ? expandedSession.customer 
                : expandedSession.customer?.id,
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

        // Parse cart data to count items and generate raffle tickets
        let raffleTicketsCount = 0;
        let shirtsQuantity = 0;
        let polosQuantity = 0;
        let hatsQuantity = 0;

        if (customerData.cartData) {
            const cart = JSON.parse(customerData.cartData);
            
            for (const [cartKey, quantity] of Object.entries(cart)) {
                const parts = cartKey.split('-');
                const productId = parts[0];
                const qty = Number(quantity);

                if (productId === '4') { // Raffle tickets
                    if (cartKey === '4-1-ticket') raffleTicketsCount += qty;
                    else if (cartKey === '4-3-tickets') raffleTicketsCount += qty * 3;
                    else if (cartKey === '4-10-tickets') raffleTicketsCount += qty * 10;
                } else if (productId === '3') { // Shirts
                    shirtsQuantity += qty;
                } else if (productId === '1') { // Polos
                    polosQuantity += qty;
                } else if (productId === '2') { // Hats
                    hatsQuantity += qty;
                }
            }
        }

        // Generate raffle ticket numbers (old format for customer table)
        const raffleTicketNumbers = raffleTicketsCount > 0 ? generateRaffleTicketNumbers(raffleTicketsCount) : [];
        
        // Generate new raffle tickets in separate table
        let raffleTickets: RaffleTicket[] = [];
        if (raffleTicketsCount > 0) {
            raffleTickets = await createRaffleTickets(
                raffleTicketsCount,
                firstName,
                lastName || '',
                customerData.email!,
                customerData.sessionId,
                customerData.phone || undefined
            );
        }

        // Save customer data to Supabase
        const supabaseCustomerData: CustomerData = {
            first_name: firstName,
            last_name: lastName || '',
            email: customerData.email!,
            phone: customerData.phone || '',
            address_line1: customerData.shippingAddress?.line1 || '',
            address_line2: customerData.shippingAddress?.line2 || '',
            city: customerData.shippingAddress?.city || '',
            state: customerData.shippingAddress?.state || '',
            postal_code: customerData.shippingAddress?.postal_code || '',
            country: customerData.shippingAddress?.country || '',
            card_last_four: customerData.cardLast4 || '',
            card_cvc: '', // CVC not available in webhook data for security
            total_amount: customerData.amount,
            bought_raffle_tickets: raffleTicketsCount > 0,
            raffle_tickets_count: raffleTicketsCount,
            raffle_ticket_numbers: raffleTicketNumbers,
            shirts_quantity: shirtsQuantity,
            polos_quantity: polosQuantity,
            hats_quantity: hatsQuantity,
            items_shipped: false,
            items_received: false,
            stripe_session_id: customerData.sessionId,
        };

        await saveCustomerData(supabaseCustomerData);

        // Send separate raffle tickets email if tickets were purchased
        if (raffleTickets.length > 0) {
            await sendRaffleTicketsEmail({
                email: customerData.email!,
                firstName,
                lastName: lastName || '',
                tickets: raffleTickets
            });
        }

        console.log("✅ Successfully processed checkout session:", session.id);
        if (raffleTickets.length > 0) {
            console.log(`🎫 Generated ${raffleTickets.length} raffle tickets: ${raffleTickets.map(t => t.ticket_code).join(', ')}`);
        }
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

async function sendRaffleTicketsEmail(data: {
    email: string;
    firstName: string;
    lastName: string;
    tickets: RaffleTicket[];
}) {
    try {
        const response = await fetch(`${process.env.VITE_APP_URL || 'http://localhost:3001'}/api/raffle/send-tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Raffle tickets email API error: ${response.status}`);
        }

        console.log("🎫 Raffle tickets email sent successfully");
    } catch (error) {
        console.error("❌ Failed to send raffle tickets email:", error);
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