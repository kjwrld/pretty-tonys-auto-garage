import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        console.log("🔍 Checking Supabase schema and connection...");
        console.log("Environment check:", {
            hasUrl: !!process.env.SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            urlPreview: process.env.SUPABASE_URL?.substring(0, 50) + "..."
        });

        // Test basic connection - try to query customers table
        const { data: existingCustomers, error: queryError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .limit(1);

        console.log("Query result:", { existingCustomers, queryError });

        // Try a simple insert test with minimal data
        const testData = {
            first_name: 'Schema',
            last_name: 'Test',
            email: 'schema-test@example.com',
            postal_code: '00000',
            total_amount: 0,
            bought_raffle_tickets: false,
            raffle_tickets_count: 0,
            raffle_ticket_numbers: [],
            shirts_quantity: 0,
            polos_quantity: 0,
            hats_quantity: 0,
            items_shipped: false,
            items_received: false,
            stripe_session_id: 'schema_test_' + Date.now()
        };

        const { data: insertTest, error: insertError } = await supabaseAdmin
            .from('customers')
            .insert([testData])
            .select()
            .single();

        // Clean up test data if successful
        if (insertTest) {
            await supabaseAdmin
                .from('customers')
                .delete()
                .eq('id', insertTest.id);
        }

        res.status(200).json({
            success: true,
            connection: "Connected to Supabase successfully",
            queryResult: existingCustomers || "No existing customers",
            queryError: queryError?.message || null,
            insertTest: insertTest ? "Insert test successful" : "Insert test failed",
            insertError: insertError?.message || null,
            insertErrorDetails: insertError || null
        });

    } catch (error: any) {
        console.error("❌ Schema check error:", error);
        
        res.status(500).json({
            success: false,
            error: "Failed to check Supabase schema",
            message: error.message,
            details: error
        });
    }
}