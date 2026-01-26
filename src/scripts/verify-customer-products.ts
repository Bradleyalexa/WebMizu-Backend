import "dotenv/config"; // Ensure env vars are loaded
import { CustomerProductService } from "../modules/customer-products/customer-product.service";
import { supabaseAdmin } from "../db/supabase";

async function main() {
  const service = new CustomerProductService();

  console.log("1. Fetching a customer and product...");
  const { data: customer } = await supabaseAdmin.from('customers').select('id').limit(1).single();
  const { data: product } = await supabaseAdmin.from('product_catalog').select('id').limit(1).single();

  if (!customer) {
    console.error("No customer found. Please create a customer first.");
    return;
  }
  if (!product) {
    console.error("No product found. Please create a product first.");
    return;
  }

  console.log(`   Customer ID: ${customer.id}`);
  console.log(`   Product ID: ${product.id}`);

  console.log("\n2. Creating Customer Product...");
  try {
    const created = await service.createCustomerProduct({
      customer_id: customer.id,
      product_catalog_id: product.id,
      installation_date: '2023-01-01',
      installation_location: 'Test Location',
      cust_product_price: 1500000,
      quantity_owned: 1,
      status: 'active',
      notes: 'Initial Note'
    });
    console.log("   ✅ Created successfully:");
    console.log(`      ID: ${created.id}`);
    console.log(`      Price: ${created.cust_product_price}`);

    console.log("\n3. Fetching by Customer...");
    const list = await service.getCustomerProducts(customer.id);
    console.log(`   ✅ Fetched ${list.length} item(s) for customer.`);
    const found = list.find(i => i.id === created.id);
    if (found) {
        console.log("      Found created item in list.");
    } else {
        console.error("      ❌ Created item NOT found in list!");
    }

    console.log("\n4. Updating Customer Product...");
    const updated = await service.updateCustomerProduct(created.id, {
      notes: "Updated via verification script",
      cust_product_price: 2000000
    });
    console.log("   ✅ Updated successfully:");
    console.log(`      Notes: ${updated.notes}`);
    console.log(`      Price: ${updated.cust_product_price}`);

    // Optional: Cleanup
    // console.log("\n5. Cleaning up (Deleting)...");
    // await supabaseAdmin.from('customer_products').delete().eq('id', created.id);
    // console.log("   ✅ Deleted.");

  } catch (error) {
    console.error("❌ Error during verification:", error);
  }
}

main().catch(console.error);
