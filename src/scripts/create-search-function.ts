import { supabaseAdmin } from "../db/supabase";

async function createSearchFunction() {
  const sql = `
    CREATE OR REPLACE FUNCTION search_customer_ids(search_text text)
    RETURNS TABLE (id uuid)
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT DISTINCT c.id
      FROM customers c
      JOIN profiles p ON c.id = p.id
      WHERE
        search_text IS NULL OR search_text = '' OR
        c.phone ILIKE '%' || search_text || '%' OR
        p.name ILIKE '%' || search_text || '%' OR
        p.email ILIKE '%' || search_text || '%';
    $$;
  `;

  const { error } = await supabaseAdmin.rpc("", {} as any);
  // Use raw SQL via the admin client
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/`, {
    method: "POST",
  });
  
  // Actually use the pg connection string approach
  const { data, error: err } = await (supabaseAdmin as any).from("_sql").select(sql);
  
  console.log("Result:", data, err);
}

createSearchFunction().catch(console.error);
