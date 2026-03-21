import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable(tableName: string) {
  const { data: cols, error: colError } = await supabase
    .from(tableName as any)
    .select("*")
    .limit(1);
  if (colError) console.error(`Error in ${tableName}:`, colError.message);
  else console.log(`Columns in ${tableName}: ${Object.keys(cols?.[0] || {}).join(", ")}`);
}

async function listFKs() {
  // Query information_schema for FKs
  const { data, error } = await supabase.rpc("get_foreign_keys");
  if (error) {
     // fallback if RPC doesn't exist - try simple query
     console.log("No get_foreign_keys RPC found.");
  } else {
    console.log("Foreign Keys:", JSON.stringify(data, null, 2));
  }
}

async function run() {
  await inspectTable("customers");
  await inspectTable("addresses");
  await listFKs();
}

run();
