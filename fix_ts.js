const fs = require('fs');
const glob = require('glob'); // Note: we can just use fs if we hardcode the paths

const files = [
  'src/app/map/page.tsx',
  'src/components/InteractiveRouteMap.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('await import("leaflet/dist/leaflet.css");')) {
    content = content.replace(
      'await import("leaflet/dist/leaflet.css");',
      '// @ts-ignore\n      await import("leaflet/dist/leaflet.css");'
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ' + file);
  }
}
