import { supabaseAdmin } from "../db/supabase";

async function setupStorage() {
  console.log("Checking storage buckets...");
  
  const bucketName = 'technician-photos';

  // Check if bucket exists
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }

  const exists = buckets.find(b => b.name === bucketName);

  if (exists) {
    console.log(`Bucket '${bucketName}' already exists.`);
    
    // Update public setting if needed (though usually immutable after create, just ensuring it's known)
    // We can't easily update 'public' flag via JS SDK for existing bucket without recreating or RLS.
    // Assuming it's set correctly or we just log it.
    console.log("Bucket details:", exists);
  } else {
    console.log(`Creating bucket '${bucketName}'...`);
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    });

    if (error) {
      console.error("Error creating bucket:", error);
    } else {
      console.log(`Bucket '${bucketName}' created successfully.`);
    }
  }
}

setupStorage().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
