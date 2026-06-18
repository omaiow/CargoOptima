const fs = require('fs');
const file = 'src/app/results/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/â”€â”€/g, '——');
content = content.replace(/Dâ º/g, 'D+');
content = content.replace(/Dâ »/g, 'D-');
content = content.replace(/â€”/g, '—');
content = content.replace(/â€¦/g, '...');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed mojibake in results page');
