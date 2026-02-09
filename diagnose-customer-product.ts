
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnosis() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets) return;

  const target = buckets.find(b => b.name === 'customer-product');
  if (target) {
    fs.writeFileSync('bucket-status.txt', `Bucket: ${target.name}, Public: ${target.public}`, 'utf8');
    console.log(`Bucket: ${target.name}, Public: ${target.public}`);
  } else {
    fs.writeFileSync('bucket-status.txt', 'Bucket not found', 'utf8');
  }
}

runDiagnosis();
