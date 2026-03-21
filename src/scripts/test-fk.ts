import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

async function test() {
  const { data, error } = await supabase.from('customer_products').select(`
    id,
    addresses!customer_products_installation_address_id_fkey ( id )
  `).limit(1);

  if (error) {
    console.error("Error with fkey:", error.message);
    const { data: d2, error: e2 } = await supabase.from('customer_products').select(`
      id,
      addresses!installation_address_id ( id )
    `).limit(1);
    if (e2) {
      console.error("Error with colname:", e2.message);
    } else {
      console.log("Success with colname");
    }
  } else {
    console.log("Success with fkey");
  }
}

test();
