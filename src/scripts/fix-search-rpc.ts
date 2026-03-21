/**
 * Script to fix the search_customers RPC function in Supabase.
 * Run with: npx ts-node -P tsconfig.json src/scripts/fix-search-rpc.ts
 */
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env["SUPABASE_URL"]!;
const SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;

// Extract project ref from URL: https://{ref}.supabase.co
const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];

const sql = `
CREATE OR REPLACE FUNCTION search_customers(search_text text)
RETURNS TABLE (
  id uuid,
  phone text,
  address_id uuid,
  address text,
  address_type text,
  status text,
  created_at timestamptz,
  profiles json
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.phone,
    c.address_id,
    a.cust_address AS address,
    a.address_type::text,
    c.status::text,
    c.created_at,
    json_build_object('name', p.name, 'email', p.email) AS profiles
  FROM customers c
  JOIN profiles p ON c.id = p.id
  LEFT JOIN addresses a ON c.address_id = a.id
  WHERE
    search_text IS NULL OR search_text = '' OR
    c.phone ILIKE '%' || search_text || '%' OR
    p.name ILIKE '%' || search_text || '%' OR
    p.email ILIKE '%' || search_text || '%' OR
    a.cust_address ILIKE '%' || search_text || '%';
$$;
`;

async function run() {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  
  console.log(`Applying fix to project: ${projectRef}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const result = await res.json();
  
  if (!res.ok) {
    console.error("Failed:", result);
    process.exit(1);
  }

  console.log("Success! RPC function updated.");
  console.log(result);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
