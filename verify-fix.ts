
import { CustomerProductRepository } from './src/modules/customer-products/customer-product.repository';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function verifyFix() {
  const repo = new CustomerProductRepository();
  
  // This is the problematic URL found in diagnosis
  const publicUrl = 'https://gdfhhfcdomtpkelvmhui.supabase.co/storage/v1/object/public/customer-product/a3ec8ba7-2f97-4c60-8795-3dbfe9743ed8-product-1769450345128';
  
  console.log('Testing URL:', publicUrl);
  
  // We need to access the private method or simulate the flow. 
  // Since signPhotoUrl is private, we can't call it directly on the instance easily without @ts-ignore or reflection.
  // Alternatively, we can use a record that has this URL and call mapToDomainAsync via findById?
  // But findById fetches from DB.
  
  // Let's rely on checking a real record from DB which has this URL.
  // We know ID: 3a5ddada-3202-48f1-8086-08edfab2659a has this URL.
  
  const id = '3a5ddada-3202-48f1-8086-08edfab2659a';
  
  let resultOutput = `Testing URL: ${publicUrl}\nFetching product with ID: ${id}\n`;
  
  try {
      const product = await repo.findById(id);
      if (product) {
          resultOutput += 'Product Found\n';
          resultOutput += `Original Photo URL: ${publicUrl}\n`;
          resultOutput += `Processed Photo URL: ${product.photoUrl}\n`;
          
          if (product.photoUrl && product.photoUrl !== publicUrl && product.photoUrl.includes('token=')) {
              resultOutput += 'SUCCESS: URL is signed!\n';
          } else {
              resultOutput += 'FAILURE: URL is NOT signed or same as public.\n';
          }
      } else {
          resultOutput += 'Product not found\n';
      }
  } catch (error: any) {
      resultOutput += `Error: ${error.message}\n`;
  }
  
  const fs = require('fs');
  fs.writeFileSync('verification-check.txt', resultOutput, 'utf8');
  console.log('Results written to verification-check.txt');
}

verifyFix();
