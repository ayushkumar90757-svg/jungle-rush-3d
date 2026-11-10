import http from 'http';
import fs from 'fs';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read built index.html from dist
const distIndex = path.join(__dirname, 'dist', 'index.html');
if (!fs.existsSync(distIndex)) {
  console.error('dist/index.html does not exist! Please run npm run build first.');
  process.exit(1);
}

const html = fs.readFileSync(distIndex, 'utf-8');
console.log('Dist index.html length:', html.length);

if (html.includes('JUNGLE RUSH') && html.includes('canvas-container') && html.includes('virtual-controls')) {
  console.log('[VERIFIED] Built index.html contains all essential game containers and screens!');
} else {
  console.error('[FAILED] Built index.html is missing components!');
  process.exit(1);
}
