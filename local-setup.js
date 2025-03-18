#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up local development environment for markdown-to-pdf-action...');

// Check if highlight.js styles directory exists
const highlightJsPath = path.join(__dirname, 'node_modules/highlight.js/styles');
if (!fs.existsSync(highlightJsPath)) {
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  console.log('Creating output directory...');
  fs.mkdirSync(outputDir);
}

console.log('\nSetup complete!');
console.log('\nTo convert markdown files locally, run:');
console.log('node convert.js ./ your-markdown-file.md ./output\n');
console.log('For more options, see the README.md file.');