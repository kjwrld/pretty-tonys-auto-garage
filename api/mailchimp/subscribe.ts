import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { email, firstName, lastName } = req.body;

        if (!email) {
            return res.status(400).json({
                error: "Email is required",
            });
        }

        const apiKey = process.env.MAILCHIMP_API_KEY;
        const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

        if (!apiKey || !audienceId) {
            console.error("❌ Missing Mailchimp credentials");
            return res.status(500).json({
                error: "Newsletter service not configured",
            });
        }

        // Extract datacenter from API key (e.g., "us6" from key ending in "-us6")
        const datacenter = apiKey.split("-")[1];

        console.log('📧 Adding subscriber to Mailchimp:', { email, firstName });

        // Add subscriber to Mailchimp audience
        const mailchimpUrl = `https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

        const subscriberData = {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName || "",
                LNAME: lastName || "",
            },
            tags: ["storefront-subscriber"],
        };

        const mailchimpResponse = await fetch(mailchimpUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(subscriberData),
        });

        const mailchimpResult = await mailchimpResponse.json();

        if (!mailchimpResponse.ok) {
            // Check if user already exists (400 error with title "Member Exists")
            if (
                mailchimpResponse.status === 400 &&
                mailchimpResult.title === "Member Exists"
            ) {
                console.log("📧 Subscriber already in audience, updating...");

                // Update existing member
                const updateUrl = `https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}/members/${email}`;
                const updateResponse = await fetch(updateUrl, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        merge_fields: {
                            FNAME: firstName || "",
                            LNAME: lastName || "",
                        },
                        tags: ["storefront-subscriber"],
                    }),
                });

                if (updateResponse.ok) {
                    console.log("✅ Updated existing subscriber in Mailchimp");
                } else {
                    console.error("❌ Failed to update existing subscriber");
                }
            } else {
                console.error("❌ Mailchimp API error:", mailchimpResult);
                throw new Error(
                    `Mailchimp error: ${
                        mailchimpResult.detail || mailchimpResult.title
                    }`
                );
            }
        } else {
            console.log("✅ Added new subscriber to Mailchimp audience");
        }

        res.json({
            success: true,
            message: "Successfully subscribed to newsletter!",
        });

    } catch (error: any) {
        console.error("❌ Mailchimp subscription error:", error);
        res.status(500).json({
            error: "Failed to subscribe to newsletter",
            message: error.message,
        });
    }
}