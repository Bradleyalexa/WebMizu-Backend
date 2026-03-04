import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testClaimFlow() {
  console.log("==================================================");
  console.log("🧪 SECURE ACCOUNT CLAIM TEST STARTED");
  console.log("==================================================");

  // 1. Create a dummy customer
  const dummyEmail = `customer_${Date.now()}@webmizu.local`;
  console.log(`\n[1/4] 🧍 ADMIN ACTION: Creating dummy customer...`);
  console.log(`      Generating backend placeholder email: ${dummyEmail}`);

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: dummyEmail,
    password: "temporary_password_123",
    email_confirm: true,
    user_metadata: { name: "Test Magic Link User" },
  });

  if (authError || !authData.user) {
    console.error("❌ Failed to create user:", authError);
    return;
  }

  const userId = authData.user.id;
  console.log(`      ✅ Success! Dummy user created with ID: ${userId}`);

  // 2. Generate Magic Link
  console.log(`\n[2/4] 🔗 ADMIN ACTION: Generating magic link for the dummy account...`);
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: dummyEmail,
    options: {
      redirectTo: "http://localhost:3000/welcome",
    },
  });

  if (linkError) {
    console.error("❌ Failed to generate link:", linkError);
    return;
  }

  console.log(`      ✅ Success! Magic Link generated:`);
  console.log(`      👉 ${linkData.properties?.action_link}`);
  console.log(`      (The customer clicks this link on Whatsapp/Email to log in securely)`);

  // 3. Claim the account (Change email)
  const realEmail = `real_email_${Date.now()}@gmail.com`;
  console.log(`\n[3/4] 👤 CUSTOMER ACTION: Customer logs in and provides real email: ${realEmail}`);
  console.log(`      Admin API swaps out the dummy email for the real one without losing data...`);
  
  const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email: realEmail,
    password: "xyanzinsicJSOINoa9182393",
    email_confirm: true,
  });

  if (updateError) {
    console.error("❌ Failed to update user:", updateError);
    return;
  }

  console.log(`      ✅ Success! Email overwritten.`);

  // 4. Verify in Database
  console.log(`\n[4/4] 🔍 VERIFICATION: Fetching the user from Supabase using same ID...`);
  const { data: verifyData } = await supabaseAdmin.auth.admin.getUserById(userId);
  
  console.log(`      Original ID:  ${userId}`);
  console.log(`      Current Mail: ${verifyData.user?.email}`);
  
  if (verifyData.user?.email === realEmail) {
    console.log(`\n🎉 TEST PASSED: The email was successfully changed to the real email! All invoices & contracts tied to ${userId} stay intact.`);
  }

  // Cleanup to keep db clean
  console.log(`\n🧹 Cleaning up test user...`);
  await supabaseAdmin.auth.admin.deleteUser(userId);
  console.log(`      ✅ Done.`);
}

testClaimFlow().catch(console.error);
