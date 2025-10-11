// Direct test of raffle functionality without server
const { createRaffleTickets } = require('./lib/raffle.ts');

async function testRaffleSystem() {
    console.log('🧪 Testing raffle system directly...');
    
    try {
        // Test 1 ticket
        console.log('\n📧 Testing 1 ticket...');
        const oneTicket = await createRaffleTickets(
            1,
            'Test',
            'User',
            'cagemachinist@gmail.com',
            'test-session-1',
            '555-123-4567'
        );
        console.log('✅ Created 1 ticket:', oneTicket.map(t => t.ticket_code));

        // Test 3 tickets
        console.log('\n📧 Testing 3 tickets...');
        const threeTickets = await createRaffleTickets(
            3,
            'Test',
            'User',
            'cagemachinist@gmail.com',
            'test-session-3',
            '555-123-4567'
        );
        console.log('✅ Created 3 tickets:', threeTickets.map(t => t.ticket_code));

        // Test 10 tickets
        console.log('\n📧 Testing 10 tickets...');
        const tenTickets = await createRaffleTickets(
            10,
            'Test',
            'User',
            'cagemachinist@gmail.com',
            'test-session-10',
            '555-123-4567'
        );
        console.log('✅ Created 10 tickets:', tenTickets.map(t => t.ticket_code));

        console.log('\n🎉 All tests completed successfully!');
        console.log(`Total tickets created: ${oneTicket.length + threeTickets.length + tenTickets.length}`);
        
        return {
            oneTicket,
            threeTickets,
            tenTickets
        };
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

testRaffleSystem()
    .then((results) => {
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });