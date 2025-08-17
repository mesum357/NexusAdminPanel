import { createServer } from 'http';
import { readFileSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;

console.log('🚀 Starting Admin Panel Server...');
console.log('📊 Environment:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  PWD: process.cwd(),
  FILES: readdirSync('.')
});

// Create HTTP server
const server = createServer((req, res) => {
  const url = req.url;
  console.log(`📥 Request: ${req.method} ${url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (url === '/health') {
    console.log('🏥 Health check requested');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    }));
    return;
  }

  // Root endpoint
  if (url === '/') {
    console.log('🏠 Root endpoint requested');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Admin Panel Server Running',
      timestamp: new Date().toISOString(),
      port: PORT
    }));
    return;
  }

  // Serve static files
  try {
    let filePath = path.join(__dirname, 'dist', url);
    
    // If it's a directory or no extension, serve index.html
    if (statSync(filePath).isDirectory() || !path.extname(filePath)) {
      filePath = path.join(__dirname, 'dist', 'index.html');
    }

    const content = readFileSync(filePath);
    const ext = path.extname(filePath);
    
    // Set content type based on file extension
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }[ext] || 'text/plain';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    // File not found, serve index.html for SPA routing
    try {
      const content = readFileSync(path.join(__dirname, 'dist', 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } catch (fallbackError) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🌐 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🏠 Root endpoint available at: http://localhost:${PORT}/`);
});

// Error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
