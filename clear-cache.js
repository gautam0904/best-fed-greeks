const fs = require('fs');
const path = require('path');

console.log('Clearing caches and forcing rebuild...');

// Clear www directory
const wwwPath = path.join(__dirname, 'www');
if (fs.existsSync(wwwPath)) {
    console.log('Removing www directory...');
    fs.rmSync(wwwPath, { recursive: true, force: true });
}

// Clear node_modules cache
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('Clearing node_modules cache...');
    // Note: We don't remove node_modules completely, just clear cache
}

// Clear package-lock.json to force fresh install
const packageLockPath = path.join(__dirname, 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
    console.log('Removing package-lock.json...');
    fs.unlinkSync(packageLockPath);
}

console.log('Cache clearing complete. Please run:');
console.log('1. npm install');
console.log('2. npm run build');
console.log('3. npx cap sync');
console.log('4. npx cap run android');
