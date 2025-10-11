import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service client for backend operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface CustomerData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code: string;
  country?: string;
  card_last_four?: string;
  card_cvc?: string;
  total_amount: number;
  bought_raffle_tickets: boolean;
  raffle_tickets_count: number;
  raffle_ticket_numbers: string[]; // Array of generated ticket numbers
  shirts_quantity: number;
  polos_quantity: number;
  hats_quantity: number;
  items_shipped: boolean;
  items_received: boolean;
  stripe_session_id: string;
  created_at?: string;
}

export async function saveCustomerData(customerData: CustomerData) {
  try {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('✅ Customer data saved to Supabase:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to save customer data:', error);
    throw error;
  }
}

export function generateRaffleTicketNumbers(count: number): string[] {
  const tickets: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 6-digit ticket number: PT + 4 random digits
    const ticketNumber = 'PT' + Math.floor(1000 + Math.random() * 9000).toString();
    tickets.push(ticketNumber);
  }
  return tickets;
}