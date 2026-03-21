const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/modules/tasks/tasks.repository.ts',
  'src/modules/service-logs/service-log.repository.ts',
  'src/modules/schedules/schedules.repository.ts',
  'src/modules/customer-products/customer-product.repository.ts'
];

for (const relPath of filesToUpdate) {
  const fullPath = path.join(__dirname, '../..', relPath);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace installation_address:addresses
  content = content.replace(/installation_address\s*:\s*addresses\s*\(/g, 'installation_address:addresses!customer_products_installation_address_id_fkey(');
  
  // Replace plain addresses(cust_address) under customers:
  content = content.replace(/addresses\s*\(\s*cust_address\s*\)/g, 'addresses!addresses_customer_id_fkey(cust_address)');

  fs.writeFileSync(fullPath, content);
  console.log('Updated', relPath);
}
