require('dotenv').config();

async function sendTestEmail() {
    const testOrderData = {
        email: 'cagemachinist@gmail.com',
        firstName: 'Test',
        lastName: 'Customer',
        amount: 45.00,
        cartItems: [
            {
                name: "Tony's Classic Polo Shirt - Size L",
                quantity: 1,
                price: 35.00
            }
        ],
        sessionId: 'cs_test_123456789',
        shippingAddress: {
            name: 'Test Customer',
            line1: '123 Test Street',
            city: 'Test City',
            state: 'CA',
            postal_code: '90210',
            country: 'US'
        }
    };

    try {
        const response = await fetch('https://pretty-tonys.vercel.app/api/mailchimp/purchase-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testOrderData),
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Test email sent successfully to cagemachinist@gmail.com');
            console.log('Response:', result);
        } else {
            console.log('❌ Failed to send test email');
            console.log('Error:', result);
        }
    } catch (error) {
        console.error('❌ Test email error:', error);
    }
}

sendTestEmail();