import type { VercelRequest, VercelResponse } from "@vercel/node";

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
        const { email, firstName, lastName } = req.body;

        if (!email || !firstName) {
            return res.status(400).json({
                error: "Missing required fields: email, firstName",
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

        console.log("🎵 Sending album download email to:", email);

        // Clean, modern thank you email with glass effects
        const albumEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank You - Pretty Tony's Album Download</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); color: #000000;">
            
            <!-- Main Container -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); min-height: 100vh;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        
                        <!-- Email Content Card -->
                        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.3);">
                            
                            <!-- Header -->
                            <tr>
                                <td align="center" style="padding: 40px 40px 20px 40px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0, 0, 0, 0.05);">
                                    <!-- Logo -->
                                    <img src="https://www.prettytony.world/assets/e87a4c46c166dd312d5bfa2d78a27dff2ae256ba-jrE_1sWp.webp" 
                                         alt="Pretty Tony's Auto Garage" 
                                         style="max-width: 80px; height: auto; display: block; margin-bottom: 20px;">
                                    
                                    <!-- Status Badge -->
                                    <div style="display: inline-block; padding: 8px 16px; background: rgba(0, 255, 0, 0.1); border: 1px solid rgba(0, 255, 0, 0.2); border-radius: 20px; font-size: 11px; color:rgb(0, 255, 0); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                        ● Download Ready
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Main Message -->
                            <tr>
                                <td style="padding: 40px 40px 30px 40px; text-align: center; background: rgba(255, 255, 255, 0.9);">
                                    <h1 style="margin: 0 0 20px 0; font-size: 32px; font-weight: 700; color: #000000; letter-spacing: 1px; line-height: 1.2;">
                                        Appreciate You
                                    </h1>
                                    <div style="width: 50px; height: 2px; background: #ff0000; margin: 0 auto 30px auto; border-radius: 1px;"></div>
                                    
                                    <p style="margin: 0 0 15px 0; font-size: 18px; color: #000000; font-weight: 600; line-height: 1.4;">
                                        Ay wassup ${firstName}
                                    </p>
                                    <p style="margin: 0; font-size: 16px; color: #666666; line-height: 1.6; max-width: 450px; margin: 0 auto;">
                                        Appreciate you buying the album and supporting me! Your love and support means everything.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Download Section -->
                            <tr>
                                <td style="padding: 0 40px 40px 40px; background: rgba(255, 255, 255, 0.9);">
                                    <!-- Glass Container for Download -->
                                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(15px); border-radius: 12px; border: 1px solid rgba(255, 0, 0, 0.15); overflow: hidden;">
                                        <tr>
                                            <td style="padding: 35px; text-align: center;">
                                                
                                                <!-- Download Button -->
                                                <a href="https://untitled.stream/library/project/X8TRUHuowsMwD68D3L18A" 
                                                   style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #ff0000 0%, #e60000 100%); color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px; letter-spacing: 1px; box-shadow: 0 4px 16px rgba(255, 0, 0, 0.25); transition: all 0.3s ease;">
                                                    Download Album
                                                </a>
                                                
                                                <!-- File Details -->
                                                <div style="margin-top: 25px; display: flex; justify-content: center; gap: 15px;">
                                                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                                                        <tr>
                                                            <td style="width: 10px;"></td>
                                                            <td style="padding: 6px 12px; background: rgba(0, 0, 0, 0.05); border-radius: 6px; font-size: 11px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">
                                                                High Quality
                                                            </td>
                                                            <td style="width: 10px;"></td>
                                                            <td style="padding: 6px 12px; background: rgba(255, 0, 0, 0.1); border-radius: 6px; font-size: 11px; color: #ff0000; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                                                                Instant Access
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; text-align: center; background: rgba(248, 249, 250, 0.8); backdrop-filter: blur(10px); border-top: 1px solid rgba(0, 0, 0, 0.05);">
                                    
                                    <!-- Subtle Tech Footer -->
                                    <div style="padding-top: 15px; border-top: 1px solid rgba(0, 0, 0, 0.05);">
                                        <p style="margin: 0; font-size: 10px; color: #999999; letter-spacing: 0.5px;">
                                            Pretty Tony's Auto Garage • Digital Delivery System
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

        // Create and send album download campaign
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
                subject_line: "Your Download of Pretty Tony's Album",
                title: `${firstName}'s Album Download`,
                from_name: "Pretty Tony's Auto Garage",
                reply_to: "Official10piecetone@gmail.com",
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

        if (!campaignResponse.ok) {
            const errorData = await campaignResponse.json();
            console.error("❌ Failed to create album campaign:", errorData);
            throw new Error(`Campaign creation failed: ${errorData.detail}`);
        }

        const campaign = await campaignResponse.json();

        // Set campaign content
        const contentUrl = `https://${datacenter}.api.mailchimp.com/3.0/campaigns/${campaign.id}/content`;
        const contentResponse = await fetch(contentUrl, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                html: albumEmailHTML,
            }),
        });

        if (!contentResponse.ok) {
            console.error("❌ Failed to set campaign content");
            throw new Error("Failed to set email content");
        }

        // Send campaign
        const sendUrl = `https://${datacenter}.api.mailchimp.com/3.0/campaigns/${campaign.id}/actions/send`;
        const sendResponse = await fetch(sendUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!sendResponse.ok) {
            const errorData = await sendResponse.json();
            console.error("❌ Failed to send album email:", errorData);
            throw new Error("Failed to send album email");
        }

        console.log("✅ Album download email sent successfully to:", email);

        res.json({
            success: true,
            message: "Album download email sent successfully!",
        });
    } catch (error: any) {
        console.error("❌ Album download email error:", error);
        res.status(500).json({
            error: "Failed to send album download email",
            message: error.message,
        });
    }
}
