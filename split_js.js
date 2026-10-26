const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, 'public/payroll/payroll.js');
const jsDir = path.join(__dirname, 'public/payroll/js');
const htmlPath = path.join(__dirname, 'public/payroll/index.html');

if (!fs.existsSync(jsDir)) {
  fs.mkdirSync(jsDir, { recursive: true });
}

const jsContent = fs.readFileSync(jsPath, 'utf8');
const lines = jsContent.split('\n');

let currentSection = '00-globals';
let sections = {};
sections[currentSection] = [];

const sectionRegex = /^\/\/ (\d+)\.\s+(.*)$/;

for (let line of lines) {
  const match = line.match(sectionRegex);
  if (match) {
    const num = match[1].padStart(2, '0');
    let name = match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    currentSection = `${num}-${name}`;
    sections[currentSection] = [line];
  } else {
    sections[currentSection].push(line);
  }
}

// Generate the script tags
const scriptTags = [];

for (const [sectionName, sectionLines] of Object.entries(sections)) {
  const filename = `${sectionName}.js`;
  const filepath = path.join(jsDir, filename);
  fs.writeFileSync(filepath, sectionLines.join('\n'));
  console.log(`Created ${filename}`);
  scriptTags.push(`<script src="js/${filename}"></script>`);
}

// Rename the original file for backup
fs.renameSync(jsPath, jsPath + '.backup');

// Update index.html
let htmlContent = fs.readFileSync(htmlPath, 'utf8');
// Find where payroll.js is included and replace it
const payrollScriptRegex = /<script src="payroll\.js".*?><\/script>/i;
if (payrollScriptRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(payrollScriptRegex, scriptTags.join('\n  '));
  fs.writeFileSync(htmlPath, htmlContent);
  console.log('Updated index.html to include all new JS files.');
} else {
  console.log('Could not find payroll.js script tag in index.html. You may need to add the script tags manually.');
  console.log(scriptTags.join('\n'));
}

console.log('Refactoring complete!');
