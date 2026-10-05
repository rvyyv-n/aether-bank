const http = require('http');
const fs = require('fs');
const path = require('path');

const { collect } = require('./scripts/usage-collector.cjs');

const PORT = 3333;

// Live token usage from local harness logs, cached briefly so refreshes stay cheap.
let usageCache = null;
let usageAt = 0;
function getUsage() {
  if (!usageCache || Date.now() - usageAt > 30000) {
    usageCache = JSON.stringify(collect());
    usageAt = Date.now();
  }
  return usageCache;
}
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  if (req.url.split('?')[0] === '/usage.json') {
    try {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(getUsage());
    } catch (e) {
      res.writeHead(500);
      res.end(String(e));
    }
    return;
  }
  let safePath = path.normalize(req.url.split('?')[0]);
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';
  let filePath = path.join(DIST, safePath);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Server error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
