import { createRaffleTickets } from "./lib/raffle";

async function testTicketGeneration() {
    console.log("🧪 Testing raffle ticket generation...");
    
    try {
        // Test 1 ticket
        console.log("\n📧 Creating 1 test ticket...");
        const oneTicket = await createRaffleTickets(
            1,
            "Test",
            "User",
            "cagemachinist@gmail.com",
            "test-session-1",
            "555-123-4567"
        );
        console.log("✅ Created 1 ticket:", oneTicket[0].ticket_code);

        // Test 3 tickets
        console.log("\n📧 Creating 3 test tickets...");
        const threeTickets = await createRaffleTickets(
            3,
            "Test",
            "User",
            "cagemachinist@gmail.com",
            "test-session-3",
            "555-123-4567"
        );
        console.log("✅ Created 3 tickets:", threeTickets.map(t => t.ticket_code).join(", "));

        // Test 10 tickets
        console.log("\n📧 Creating 10 test tickets...");
        const tenTickets = await createRaffleTickets(
            10,
            "Test",
            "User",
            "cagemachinist@gmail.com",
            "test-session-10",
            "555-123-4567"
        );
        console.log("✅ Created 10 tickets:", tenTickets.map(t => t.ticket_code).join(", "));

        console.log(`\n🎉 Total tickets created: ${oneTicket.length + threeTickets.length + tenTickets.length}`);
        
        return { oneTicket, threeTickets, tenTickets };
    } catch (error) {
        console.error("❌ Test failed:", error);
        throw error;
    }
}

testTicketGeneration();