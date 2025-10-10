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
        const { 
            email, 
            firstName, 
            lastName, 
            amount, 
            cartItems, 
            sessionId,
            shippingAddress 
        } = req.body;

        if (!email || !firstName || !amount) {
            return res.status(400).json({
                error: "Missing required fields: email, firstName, amount",
            });
        }

        const apiKey = process.env.MAILCHIMP_API_KEY;
        const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

        if (!apiKey || !audienceId) {
            console.error("❌ Missing Mailchimp credentials");
            return res.status(500).json({
                error: "Email service not configured",
            });
        }

        // Extract datacenter from API key
        const datacenter = apiKey.split("-")[1];

        console.log('📧 Adding customer to Mailchimp after purchase:', { email, firstName, amount });

        // Add/update customer in Mailchimp audience
        const mailchimpUrl = `https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

        const subscriberData = {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName || "",
                PHONE: shippingAddress?.phone || "",
            },
            tags: ["customer", "purchased"],
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
            // Check if user already exists
            if (
                mailchimpResponse.status === 400 &&
                mailchimpResult.title === "Member Exists"
            ) {
                console.log("📧 Customer already in audience, updating...");

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
                            FNAME: firstName,
                            LNAME: lastName || "",
                            PHONE: shippingAddress?.phone || "",
                        },
                        tags: ["customer", "purchased"],
                    }),
                });

                if (updateResponse.ok) {
                    console.log("✅ Updated existing customer in Mailchimp");
                } else {
                    console.error("❌ Failed to update existing customer");
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
            console.log("✅ Added new customer to Mailchimp audience");
        }

        // Send order confirmation email
        const confirmationEmailHTML = `
            <h2>Thanks for your order, ${firstName}!</h2>
            <p>Your order from Pretty Tony's Autoshop has been confirmed.</p>
            <h3>Order Details:</h3>
            <ul>
                ${cartItems ? cartItems.map((item: any) => 
                    `<li>${item.name} - Quantity: ${item.quantity} - $${item.price}</li>`
                ).join('') : ''}
            </ul>
            <p><strong>Total: $${amount}</strong></p>
            <p>Order ID: ${sessionId}</p>
            <p>We'll send you tracking information once your order ships!</p>
            <p>Thanks for supporting Pretty Tony's Autoshop! 🏁</p>
        `;

        // Create and send order confirmation campaign
        const campaignData = {
            type: "regular",
            recipients: {
                list_id: audienceId,
                segment_opts: {
                    match: "all",
                    conditions: [
                        {
                            condition_type: "EmailAddress",
                            field: "EMAIL",
                            op: "is",
                            value: email,
                        },
                    ],
                },
            },
            settings: {
                subject_line: `Order Confirmation - Pretty Tony's Autoshop ($${amount})`,
                title: `Order Confirmation - ${firstName}`,
                from_name: "Pretty Tony's Autoshop",
                reply_to: "orders@prettytony.shop",
                auto_footer: false,
                inline_css: true,
            },
        };

        const campaignUrl = `https://${datacenter}.api.mailchimp.com/3.0/campaigns`;
        const campaignResponse = await fetch(campaignUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(campaignData),
        });

        if (campaignResponse.ok) {
            const campaign = await campaignResponse.json();

            // Set campaign content
            const contentUrl = `https://${datacenter}.api.mailchimp.com/3.0/campaigns/${campaign.id}/content`;
            await fetch(contentUrl, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    html: confirmationEmailHTML,
                }),
            });

            // Send campaign
            const sendUrl = `https://${datacenter}.api.mailchimp.com/3.0/campaigns/${campaign.id}/actions/send`;
            const sendResponse = await fetch(sendUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            });

            if (sendResponse.ok) {
                console.log("✅ Order confirmation email sent successfully");
            } else {
                console.error("❌ Failed to send order confirmation email");
            }
        }

        res.json({
            success: true,
            message: "Customer added to audience and order confirmation sent!",
        });

    } catch (error: any) {
        console.error("❌ Mailchimp purchase notification error:", error);
        res.status(500).json({
            error: "Failed to process purchase notification",
            message: error.message,
        });
    }
}