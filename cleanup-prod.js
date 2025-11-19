const fs = require('fs');
const path = require('path');

/**
 * Production Cleanup Script
 * Removes console.log statements and other production issues
 */

const directories = [
  'university-past-questions-frontend/src',
  'backend'
];

const patterns = {
  // Remove console.log, console.error, console.warn, console.info statements
  consoleStatements: [
    /console\.(log|error|warn|info)\([^)]*\);?/g,
    /console\.(log|error|warn|info)\s*\n/g
  ],
  // Remove debug comments
  debugComments: [
    /\/\/\s*console\.(log|error|warn|info)/g,
    /\/\*\s*console\.(log|error|warn|info)\s*\*\//g
  ]
};

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changes = [];

    // Store original content for comparison
    const originalContent = content;

    // Remove console statements
    patterns.consoleStatements.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, '');
        changes.push(`Removed ${matches.length} console statement(s)`);
        modified = true;
      }
    });

    // Remove debug comments
    patterns.debugComments.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, '');
        changes.push(`Removed ${matches.length} debug comment(s)`);
        modified = true;
      }
    });

    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned ${filePath}`);
      changes.forEach(change => console.log(`   - ${change}`));
    }

    return modified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    let totalCleaned = 0;

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          totalCleaned += scanDirectory(fullPath);
        }
      } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
        if (processFile(fullPath)) {
          totalCleaned++;
        }
      }
    });

    return totalCleaned;
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
    return 0;
  }
}

console.log('🧹 Starting production cleanup...');
console.log('Target directories:', directories);

let totalFilesCleaned = 0;
directories.forEach(dir => {
  console.log(`\n📁 Processing: ${dir}`);
  totalFilesCleaned += scanDirectory(dir);
});

console.log(`\n🎉 Cleanup complete!`);
console.log(`📊 Total files cleaned: ${totalFilesCleaned}`);
console.log('\n✅ Production cleanup successful!');