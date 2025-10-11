import { supabaseAdmin } from './supabase';

export interface RaffleTicket {
  id?: string;
  first_name: string;
  last_name: string;
  customer_email: string;
  phone?: string;
  ticket_code: string;
  purchase_date?: string;
  stripe_session_id: string;
  is_winner?: boolean;
  draw_date?: string;
  created_at?: string;
}

export function generateRaffleCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PT-';
  
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

export async function generateUniqueRaffleCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateRaffleCode();
    
    const { data, error } = await supabaseAdmin
      .from('raffle_tickets')
      .select('ticket_code')
      .eq('ticket_code', code)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows found, code is unique
      isUnique = true;
      return code;
    } else if (error) {
      throw new Error(`Database error checking code uniqueness: ${error.message}`);
    }
    
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique raffle code after maximum attempts');
  }

  return code!;
}

export async function createRaffleTickets(
  count: number,
  firstName: string,
  lastName: string,
  email: string,
  sessionId: string,
  phone?: string
): Promise<RaffleTicket[]> {
  const tickets: RaffleTicket[] = [];

  for (let i = 0; i < count; i++) {
    const ticketCode = await generateUniqueRaffleCode();
    
    const ticket: RaffleTicket = {
      first_name: firstName,
      last_name: lastName,
      customer_email: email,
      phone: phone || null,
      ticket_code: ticketCode,
      stripe_session_id: sessionId,
    };

    tickets.push(ticket);
  }

  const { data, error } = await supabaseAdmin
    .from('raffle_tickets')
    .insert(tickets)
    .select();

  if (error) {
    throw new Error(`Failed to save raffle tickets: ${error.message}`);
  }

  return data as RaffleTicket[];
}