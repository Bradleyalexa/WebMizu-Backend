/**
 * Fix existing schedules that have a service_log but aren't marked 'done'.
 * Also fix services_used on contracts.
 * 
 * Run from apps/backend: npx ts-node src/scripts/fix-schedule-status.ts
 */
import { supabaseAdmin } from "../db/supabase";

async function run() {
  console.log("\n=== Step 1: Fix schedule_expected rows that have a service_log ===");

  const { data: notDoneSchedules, error: err1 } = await supabaseAdmin
    .from("schedule_expected" as any)
    .select("id, status, contract_id")
    .neq("status", "done");

  if (err1) { console.error(err1); process.exit(1); }

  let fixed = 0;
  for (const schedule of (notDoneSchedules as any[]) || []) {
    const { data: log } = await supabaseAdmin
      .from("service_log" as any)
      .select("id")
      .eq("expected_id", schedule.id)
      .maybeSingle();

    if ((log as any)?.id) {
      const { error } = await supabaseAdmin
        .from("schedule_expected" as any)
        .update({ status: "done" } as any)
        .eq("id", schedule.id);
      if (!error) {
        console.log(`  ✓ Schedule ${schedule.id} → done (log: ${(log as any).id})`);
        fixed++;
      } else {
        console.warn(`  ✗ Failed for ${schedule.id}:`, error.message);
      }
    }
  }
  console.log(`Fixed ${fixed} schedule(s).\n`);

  console.log("=== Step 2: Recalculate services_used on all contracts ===");

  const { data: contracts, error: err2 } = await supabaseAdmin
    .from("contracts" as any)
    .select("id, services_used");

  if (err2) { console.error(err2); process.exit(1); }

  let recalcFixed = 0;
  for (const contract of (contracts as any[]) || []) {
    const { data: doneSchedules } = await supabaseAdmin
      .from("schedule_expected" as any)
      .select("id")
      .eq("contract_id", contract.id)
      .eq("status", "done");

    const actualCount = ((doneSchedules as any[]) || []).length;
    if (actualCount !== contract.services_used) {
      const { error } = await supabaseAdmin
        .from("contracts" as any)
        .update({ services_used: actualCount } as any)
        .eq("id", contract.id);
      if (!error) {
        console.log(`  ✓ Contract ${contract.id}: services_used ${contract.services_used} → ${actualCount}`);
        recalcFixed++;
      }
    }
  }
  console.log(`Recalculated ${recalcFixed} contract(s).\n`);
  console.log("Done!");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
