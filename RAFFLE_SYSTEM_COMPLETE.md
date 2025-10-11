# ✅ Complete Raffle Backend System

## Features Implemented:

1. **Supabase Raffle Tickets Table** - Stores tickets with customer info
2. **6-Character Ticket Codes** - Format: `PT-X4K2` (unique, collision-resistant)
3. **Automatic Ticket Generation** - Hooks into Stripe webhook after purchase
4. **Separate Email System** - Sends raffle codes via dedicated email (not in order confirmation)
5. **Admin Winner Selection** - Random winner picker with customer details

## API Endpoints Created:

- **`/api/raffle/send-tickets`** - Emails raffle codes to customers
- **`/api/raffle/draw-winner`** - Admin endpoint for winner selection

## How It Works:

1. **Purchase Flow**: Customer buys raffle tickets → Stripe processes → Webhook triggers
2. **Ticket Generation**: Creates unique codes in `raffle_tickets` table
3. **Email Delivery**: Sends separate email with all ticket codes
4. **Admin Draw**: Call endpoint to randomly select winner from all active tickets

## Admin Usage:

```bash
# View all active tickets and customer stats
GET /api/raffle/draw-winner
Headers: Authorization: Bearer YOUR_ADMIN_SECRET_KEY

# Draw a random winner
POST /api/raffle/draw-winner  
Headers: Authorization: Bearer YOUR_ADMIN_SECRET_KEY
```

## Environment Variables Needed:
- `ADMIN_SECRET_KEY` - For admin endpoint protection

The system is ready to go! When someone buys raffle tickets, they'll get their codes emailed automatically, and you can draw winners whenever you want using the admin endpoint.