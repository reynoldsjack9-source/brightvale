// Local test server for the game: serves this repository on http://localhost:5180 (index.html, preview/, dist/).
// Usage: node tools/serve.cjs   (the "game" entry in .claude/launch.json one folder up runs this)
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.css': 'text/css', '.svg': 'image/svg+xml'};
http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(root, u === '/' ? 'index.html' : u);
  if (!f.startsWith(root)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { r.writeHead(404); return r.end(); }
    r.writeHead(200, {'content-type': types[path.extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store'});
    r.end(d);
  });
}).listen(5180, () => console.log('Brightvale on http://localhost:5180'));
