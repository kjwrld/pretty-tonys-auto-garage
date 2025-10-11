import type { VercelRequest, VercelResponse } from "@vercel/node";
import { RaffleTicket } from "../../lib/raffle";

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
        const {
            email,
            firstName,
            lastName,
            tickets
        }: {
            email: string;
            firstName: string;
            lastName: string;
            tickets: RaffleTicket[];
        } = req.body;

        if (!email || !firstName || !tickets || tickets.length === 0) {
            return res.status(400).json({
                error: "Missing required fields: email, firstName, tickets",
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

        console.log("🎫 Sending raffle tickets email:", {
            email,
            firstName,
            ticketCount: tickets.length,
        });

        // Create raffle tickets email HTML
        const raffleEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Raffle Tickets - Pretty Tony's Auto Garage</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9f9f9;">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border: 1px solid #e0e0e0;">
                            
                            <!-- Header with Logo -->
                            <tr>
                                <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 2px solid #000000;">
                                    <img src="https://www.prettytony.world/assets/e87a4c46c166dd312d5bfa2d78a27dff2ae256ba.webp" 
                                         alt="Pretty Tony's Auto Garage" 
                                         style="max-width: 120px; height: auto; display: block;">
                                    <h1 style="margin: 15px 0 0 0; font-size: 24px; color: #000000; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">
                                        Pretty Tony's Auto Garage
                                    </h1>
                                </td>
                            </tr>
                            
                            <!-- Title -->
                            <tr>
                                <td style="padding: 30px 20px 20px 20px;">
                                    <h2 style="margin: 0; font-size: 20px; color: #000000; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Your Raffle Tickets
                                    </h2>
                                    <p style="margin: 15px 0 0 0; font-size: 16px; color: #333333; text-align: center; line-height: 1.5;">
                                        Hey ${firstName}! Here are your raffle ticket codes:
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Ticket Codes -->
                            <tr>
                                <td style="padding: 0 20px 20px 20px;">
                                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e0e0e0;">
                                        <tr>
                                            <td style="padding: 15px; background-color: #f8f8f8; border-bottom: 1px solid #e0e0e0;">
                                                <h3 style="margin: 0; font-size: 14px; color: #000000; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    Raffle Ticket Codes (${tickets.length} ${tickets.length === 1 ? 'Ticket' : 'Tickets'})
                                                </h3>
                                            </td>
                                        </tr>
                                        ${tickets.map(ticket => `
                                            <tr>
                                                <td style="padding: 15px; border-bottom: 1px solid #f0f0f0; text-align: center;">
                                                    <div style="font-size: 18px; font-weight: bold; color: #000000; letter-spacing: 1px; font-family: monospace;">
                                                        ${ticket.ticket_code}
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer Message -->
                            <tr>
                                <td style="padding: 20px;">
                                    <p style="margin: 0; font-size: 14px; color: #666666; text-align: center; line-height: 1.6;">
                                        Good luck! Keep these codes safe - you'll need them if you win.
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        // Create and send raffle tickets campaign
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
                subject_line: `Your Raffle Tickets - Pretty Tony's Auto Garage (${tickets.length} ${tickets.length === 1 ? 'Ticket' : 'Tickets'})`,
                title: `Raffle Tickets - ${firstName}`,
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
                    html: raffleEmailHTML,
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
                console.log("✅ Raffle tickets email sent successfully");
            } else {
                console.error("❌ Failed to send raffle tickets email");
                throw new Error("Failed to send email campaign");
            }
        } else {
            console.error("❌ Failed to create raffle tickets campaign");
            throw new Error("Failed to create email campaign");
        }

        res.json({
            success: true,
            message: "Raffle tickets email sent successfully!",
            ticketCount: tickets.length,
        });
    } catch (error: any) {
        console.error("❌ Raffle tickets email error:", error);
        res.status(500).json({
            error: "Failed to send raffle tickets email",
            message: error.message,
        });
    }
}