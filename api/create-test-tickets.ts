import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createRaffleTickets } from "../lib/raffle";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { count = 1 } = req.body;

        console.log(`🧪 Creating ${count} test tickets in Supabase...`);

        // Create test tickets
        const tickets = await createRaffleTickets(
            count,
            "Test",
            "User", 
            "cagemachinist@gmail.com",
            `test-${Date.now()}`,
            "555-123-4567"
        );

        console.log(`✅ Created ${tickets.length} tickets:`, tickets.map(t => t.ticket_code));

        // Now send them via email
        const emailResult = await fetch(`${req.headers.origin}/api/raffle/send-tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "cagemachinist@gmail.com",
                firstName: "Test",
                lastName: "User",
                tickets
            })
        });

        const emailData = await emailResult.json();

        res.json({
            success: true,
            ticketsCreated: tickets.map(t => t.ticket_code),
            emailSent: emailResult.ok,
            emailResponse: emailData
        });

    } catch (error: any) {
        console.error("❌ Test error:", error);
        res.status(500).json({ error: error.message });
    }
}