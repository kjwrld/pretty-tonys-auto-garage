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

        // Test basic connection
        const { data: tables, error: tablesError } = await supabaseAdmin
            .rpc('get_table_info', {}, { count: 'exact' })
            .then(() => supabaseAdmin.from('information_schema.tables').select('*').limit(5))
            .catch(async () => {
                // Fallback: try to query a simple table that should exist
                return await supabaseAdmin.from('customers').select('*').limit(0);
            });

        if (tablesError) {
            console.log("Table query error:", tablesError);
        }

        // Check if customers table exists and get its structure
        const { data: customerSchema, error: schemaError } = await supabaseAdmin
            .rpc('get_column_info', { table_name: 'customers' })
            .catch(async () => {
                // Fallback: try to describe the table structure
                return await supabaseAdmin
                    .from('customers')
                    .select('*')
                    .limit(0);
            });

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
            tablesResult: tables || "Could not fetch table list",
            tablesError: tablesError?.message || null,
            customerSchema: customerSchema || "Could not fetch schema",
            schemaError: schemaError?.message || null,
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