/**
 * Lightweight Local Development Server
 * Serves static portfolio files and local /api/leetcode serverless route.
 * Zero external dependencies (uses standard Node.js libraries).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const leetcodeApiHandler = require('./api/leetcode.js');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Delegate /api/leetcode requests to the serverless function handler
  if (pathname === '/api/leetcode') {
    req.query = Object.fromEntries(parsedUrl.searchParams);
    leetcodeApiHandler(req, res);
    return;
  }

  // Safe static file serving
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.statusCode = 500;
      res.end('500 Internal Server Error');
    });
    stream.pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Portfolio dev server running at http://localhost:${PORT}`);
    console.log(`Live LeetCode endpoint: http://localhost:${PORT}/api/leetcode?username=abhaysingh79`);
  });
}

module.exports = server;
