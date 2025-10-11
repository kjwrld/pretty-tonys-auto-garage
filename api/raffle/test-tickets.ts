import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createRaffleTickets } from "../../lib/raffle";

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
        const { ticketCount } = req.body;

        if (!ticketCount || ![1, 3, 10].includes(ticketCount)) {
            return res.status(400).json({
                error: "ticketCount must be 1, 3, or 10",
            });
        }

        console.log(`🧪 Creating ${ticketCount} test raffle tickets`);

        // Create test tickets in Supabase
        const testTickets = await createRaffleTickets(
            ticketCount,
            "Test", // firstName
            "User", // lastName
            "cagemachinist@gmail.com", // email
            `test-session-${Date.now()}`, // fake session ID
            "555-123-4567" // phone
        );

        console.log(`✅ Created ${testTickets.length} test tickets in Supabase`);

        // Send test email with the tickets
        const emailResponse = await fetch(`${req.headers.origin || 'http://localhost:3001'}/api/raffle/send-tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: "cagemachinist@gmail.com",
                firstName: "Test",
                lastName: "User",
                tickets: testTickets
            }),
        });

        if (!emailResponse.ok) {
            console.error("❌ Failed to send test email");
            return res.status(500).json({
                error: "Test tickets created but email failed",
                tickets: testTickets.map(t => t.ticket_code)
            });
        }

        console.log("📧 Test email sent successfully");

        res.json({
            success: true,
            message: `Test completed! Created ${ticketCount} tickets and sent email to cagemachinist@gmail.com`,
            tickets: testTickets.map(t => ({
                code: t.ticket_code,
                id: t.id
            })),
            testData: {
                customer: "Test User",
                email: "cagemachinist@gmail.com",
                ticketCount: testTickets.length,
                sessionId: testTickets[0].stripe_session_id
            }
        });
    } catch (error: any) {
        console.error("❌ Test tickets error:", error);
        res.status(500).json({
            error: "Failed to create test tickets",
            message: error.message,
        });
    }
}