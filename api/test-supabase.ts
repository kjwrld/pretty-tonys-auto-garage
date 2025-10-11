import type { VercelRequest, VercelResponse } from "@vercel/node";
import { saveCustomerData, type CustomerData } from "../lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        console.log("🧪 Testing Supabase connection...");
        console.log("Environment check:", {
            hasUrl: !!process.env.SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            urlPreview: process.env.SUPABASE_URL?.substring(0, 30) + "..."
        });

        const customerData: CustomerData = req.body;
        
        console.log("📝 Attempting to save customer data:", {
            email: customerData.email,
            sessionId: customerData.stripe_session_id,
            raffleTickets: customerData.raffle_tickets_count
        });

        const result = await saveCustomerData(customerData);
        
        console.log("✅ Supabase save successful!");
        
        res.status(200).json({
            success: true,
            message: "Customer data saved to Supabase successfully!",
            data: result
        });
        
    } catch (error: any) {
        console.error("❌ Supabase test error:", error);
        
        res.status(500).json({
            success: false,
            error: "Failed to save to Supabase",
            message: error.message,
            details: error
        });
    }
}