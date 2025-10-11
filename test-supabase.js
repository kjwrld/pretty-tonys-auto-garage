require('dotenv').config();

async function testSupabaseConnection() {
    const testCustomerData = {
        first_name: 'Test',
        last_name: 'Customer', 
        email: 'test@example.com',
        phone: '555-123-4567',
        address_line1: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        postal_code: '90210',
        country: 'US',
        card_last_four: '4242',
        card_cvc: '',
        total_amount: 45.00,
        bought_raffle_tickets: true,
        raffle_tickets_count: 2,
        raffle_ticket_numbers: ['PT1234', 'PT5678'],
        shirts_quantity: 0,
        polos_quantity: 1,
        hats_quantity: 0,
        items_shipped: false,
        items_received: false,
        stripe_session_id: 'cs_test_' + Math.random().toString(36).substr(2, 9)
    };

    try {
        const response = await fetch('https://pretty-tonys.vercel.app/api/test-supabase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testCustomerData),
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Supabase test successful!');
            console.log('Customer ID:', result.data?.id);
            console.log('Saved data:', result.data);
        } else {
            console.log('❌ Supabase test failed');
            console.log('Error:', result);
        }
    } catch (error) {
        console.error('❌ Test request failed:', error);
    }
}

testSupabaseConnection();