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

  // This script is for manual execution only
  // Execute the SQL directly in your Supabase SQL editor
  console.log("SQL to execute:");
  console.log(sql);
}

createSearchFunction().catch(console.error);
