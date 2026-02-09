const fs = require('fs');
const path = require('path');

// Source: repo_root/packages/types
// Destination: apps/backend/src/types

const sourceDir = path.resolve(__dirname, '../../../../packages/types');
const destDir = path.resolve(__dirname, '../src/types');

console.log(`Copying types from ${sourceDir} to ${destDir}...`);

if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Source directory ${sourceDir} does not exist!`);
  // If we are in a deployment environment where root is apps/backend, 
  // we might need to adjust strategy or fail.
  // But Railway clones full repo, so this MUST exist if paths are correct.
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir);

files.forEach(file => {
  const srcFile = path.join(sourceDir, file);
  const destFile = path.join(destDir, file);
  
  if (fs.statSync(srcFile).isFile()) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${file}`);
  }
});

console.log('Types copied successfully.');
