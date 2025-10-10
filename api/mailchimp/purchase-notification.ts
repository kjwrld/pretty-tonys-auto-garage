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

        // Send order confirmation email with minimal styling
        const confirmationEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation - Pretty Tony's Autoshop</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9f9f9;">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border: 1px solid #e0e0e0;">
                            
                            <!-- Header with Logo -->
                            <tr>
                                <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 2px solid #000000;">
                                    <img src="https://pretty-tonys-o7ckq99ts-k-os-theory.vercel.app/assets/e87a4c46c166dd312d5bfa2d78a27dff2ae256ba.png" 
                                         alt="Pretty Tony's Autoshop" 
                                         style="max-width: 120px; height: auto; display: block;">
                                    <h1 style="margin: 15px 0 0 0; font-size: 24px; color: #000000; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">
                                        Pretty Tony's Autoshop
                                    </h1>
                                </td>
                            </tr>
                            
                            <!-- Thank You Message -->
                            <tr>
                                <td style="padding: 30px 20px 20px 20px;">
                                    <h2 style="margin: 0; font-size: 20px; color: #000000; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Order Confirmed
                                    </h2>
                                    <p style="margin: 15px 0 0 0; font-size: 16px; color: #333333; text-align: center; line-height: 1.5;">
                                        Thanks for your order, ${firstName}! Your purchase has been confirmed.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Order Details -->
                            <tr>
                                <td style="padding: 0 20px 20px 20px;">
                                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e0e0e0;">
                                        <tr>
                                            <td style="padding: 15px; background-color: #f8f8f8; border-bottom: 1px solid #e0e0e0;">
                                                <h3 style="margin: 0; font-size: 14px; color: #000000; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    Order Details
                                                </h3>
                                            </td>
                                        </tr>
                                        ${cartItems ? cartItems.map((item: any) => 
                                            `<tr>
                                                <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333333;">
                                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                                        <span>${item.name} (×${item.quantity})</span>
                                                        <span style="font-weight: bold;">$${item.price}</span>
                                                    </div>
                                                </td>
                                            </tr>`
                                        ).join('') : ''}
                                        <tr>
                                            <td style="padding: 15px; background-color: #f8f8f8; font-size: 16px; color: #000000; font-weight: bold;">
                                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                                    <span>TOTAL:</span>
                                                    <span>$${amount.toFixed(2)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Order ID and Shipping Info -->
                            <tr>
                                <td style="padding: 20px;">
                                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                                        <strong>Order ID:</strong> ${sessionId.slice(-8).toUpperCase()}
                                    </p>
                                    <p style="margin: 0 0 20px 0; font-size: 14px; color: #666666; line-height: 1.6;">
                                        We'll prepare your items for shipping and send you tracking information once your order ships.
                                    </p>
                                    <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                                        <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                                            Questions? Contact us at orders@prettytony.shop
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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