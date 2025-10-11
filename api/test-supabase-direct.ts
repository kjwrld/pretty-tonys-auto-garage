import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        console.log("🧪 Testing direct Supabase HTTP connection...");
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        console.log("Environment check:", {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!serviceKey,
            urlPreview: supabaseUrl?.substring(0, 50) + "..."
        });

        if (!supabaseUrl || !serviceKey) {
            throw new Error("Missing environment variables");
        }

        // Test with direct HTTP request to Supabase REST API
        const testData = {
            first_name: 'Direct',
            last_name: 'Test',
            email: 'direct-test@example.com',
            postal_code: '12345',
            total_amount: 99.99,
            bought_raffle_tickets: false,
            raffle_tickets_count: 0,
            raffle_ticket_numbers: [],
            shirts_quantity: 1,
            polos_quantity: 0,
            hats_quantity: 0,
            items_shipped: false,
            items_received: false,
            stripe_session_id: 'direct_test_' + Date.now()
        };

        const response = await fetch(`${supabaseUrl}/rest/v1/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(testData)
        });

        const responseText = await response.text();
        let responseData;
        
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }

        console.log("Direct HTTP response:", {
            status: response.status,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData
        });

        if (!response.ok) {
            return res.status(500).json({
                success: false,
                error: "Direct HTTP request failed",
                status: response.status,
                response: responseData,
                url: `${supabaseUrl}/rest/v1/customers`
            });
        }

        // Clean up test data if successful
        if (Array.isArray(responseData) && responseData[0]?.id) {
            await fetch(`${supabaseUrl}/rest/v1/customers?id=eq.${responseData[0].id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceKey}`,
                    'apikey': serviceKey
                }
            });
        }

        res.status(200).json({
            success: true,
            message: "Direct HTTP test successful!",
            insertedData: responseData
        });

    } catch (error: any) {
        console.error("❌ Direct test error:", error);
        
        res.status(500).json({
            success: false,
            error: "Direct HTTP test failed",
            message: error.message,
            details: error
        });
    }
}