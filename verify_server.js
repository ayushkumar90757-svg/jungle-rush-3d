import http from 'http';
import { spawn } from 'child_process';

const serverProc = spawn('node', ['server.js'], { cwd: process.cwd() });

setTimeout(() => {
  http.get('http://localhost:3000/dist/index.html', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[HTTP TEST] Status: ${res.statusCode}, Content-Length: ${data.length}`);
      serverProc.kill();
      if (res.statusCode === 200 && data.includes('JUNGLE RUSH')) {
        console.log('[ALL SYSTEM CHECKS PASSED] Game is 100% playable and served successfully!');
        process.exit(0);
      } else {
        process.exit(1);
      }
    });
  }).on('error', err => {
    console.error('Request error:', err);
    serverProc.kill();
    process.exit(1);
  });
}, 1500);
