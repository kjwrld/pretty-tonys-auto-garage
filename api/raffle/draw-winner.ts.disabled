import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Simple admin protection - you can enhance this with proper auth later
    const adminKey = req.headers.authorization?.replace("Bearer ", "");
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(401).json({ error: "Unauthorized - Invalid admin key" });
    }

    try {
        if (req.method === "GET") {
            // Get all active tickets and their counts
            const { data: tickets, error } = await supabaseAdmin
                .from('raffle_tickets')
                .select('*')
                .eq('is_winner', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Failed to fetch tickets: ${error.message}`);
            }

            // Group tickets by customer to show admin who has how many tickets
            const customerStats = new Map();
            tickets?.forEach(ticket => {
                const key = `${ticket.first_name} ${ticket.last_name} (${ticket.customer_email})`;
                if (!customerStats.has(key)) {
                    customerStats.set(key, {
                        name: `${ticket.first_name} ${ticket.last_name}`,
                        email: ticket.customer_email,
                        ticketCount: 0,
                        tickets: []
                    });
                }
                const customer = customerStats.get(key);
                customer.ticketCount++;
                customer.tickets.push(ticket.ticket_code);
            });

            return res.json({
                totalTickets: tickets?.length || 0,
                customers: Array.from(customerStats.entries()).map(([key, data]) => ({
                    key,
                    ...data
                }))
            });
        }

        if (req.method === "POST") {
            console.log("🎰 Admin initiated raffle draw");

            // Get all active (non-winning) tickets
            const { data: activeTickets, error: fetchError } = await supabaseAdmin
                .from('raffle_tickets')
                .select('*')
                .eq('is_winner', false);

            if (fetchError) {
                throw new Error(`Failed to fetch active tickets: ${fetchError.message}`);
            }

            if (!activeTickets || activeTickets.length === 0) {
                return res.status(400).json({
                    error: "No active raffle tickets found",
                    totalTickets: 0
                });
            }

            // Randomly select a winning ticket
            const randomIndex = Math.floor(Math.random() * activeTickets.length);
            const winningTicket = activeTickets[randomIndex];

            // Mark the ticket as winner and set draw date
            const { data: updatedTicket, error: updateError } = await supabaseAdmin
                .from('raffle_tickets')
                .update({
                    is_winner: true,
                    draw_date: new Date().toISOString()
                })
                .eq('id', winningTicket.id)
                .select()
                .single();

            if (updateError) {
                throw new Error(`Failed to update winning ticket: ${updateError.message}`);
            }

            console.log(`🏆 Winner selected: ${winningTicket.first_name} ${winningTicket.last_name} with ticket ${winningTicket.ticket_code}`);

            // Count total tickets this customer had
            const customerTickets = activeTickets.filter(
                ticket => ticket.customer_email === winningTicket.customer_email
            );

            return res.json({
                success: true,
                winner: {
                    id: updatedTicket.id,
                    name: `${updatedTicket.first_name} ${updatedTicket.last_name}`,
                    email: updatedTicket.customer_email,
                    phone: updatedTicket.phone,
                    winningTicket: updatedTicket.ticket_code,
                    totalTicketsOwned: customerTickets.length,
                    drawDate: updatedTicket.draw_date
                },
                totalActiveTickets: activeTickets.length,
                message: `Winner selected! ${updatedTicket.first_name} ${updatedTicket.last_name} won with ticket ${updatedTicket.ticket_code}`
            });
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error: any) {
        console.error("❌ Raffle draw error:", error);
        res.status(500).json({
            error: "Failed to process raffle draw",
            message: error.message,
        });
    }
}