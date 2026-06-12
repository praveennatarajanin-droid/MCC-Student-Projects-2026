const fs = require('fs');
const path = require('path');

const replacements = [
  [/\bslate-805\b/g, 'slate-800'],
  [/\bslate-880\b/g, 'slate-800'],
  [/\bslate-205\b/g, 'slate-200'],
  [/\bslate-505\b/g, 'slate-500'],
  [/\bslate-550\b/g, 'slate-500'],
  [/\bslate-655\b/g, 'slate-600'],
  [/\bslate-705\b/g, 'slate-700'],
  [/\bslate-355\b/g, 'slate-300'],
  [/\bred-605\b/g, 'red-600'],
  [/\bred-955\b/g, 'red-900'],
  [/\bgreen-655\b/g, 'green-600'],
  [/\bamber-955\b/g, 'amber-900'],
  [/\bblue-955\b/g, 'blue-900'],
  [/\bamber-808\b/g, 'amber-800']
];

const frontendDir = 'c:\\internship\\frontend\\src';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      processFile(fullPath);
    }
  }
}

walk(frontendDir);
