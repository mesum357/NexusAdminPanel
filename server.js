const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting Admin Panel Server...');
console.log('📊 Environment:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  PWD: process.cwd(),
  FILES: require('fs').readdirSync('.')
});

// Health check endpoint - this MUST work for Railway
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Root endpoint for basic testing
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint requested');
  res.status(200).json({ 
    message: 'Admin Panel Server Running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving index.html (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🌐 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🏠 Root endpoint available at: http://localhost:${PORT}/`);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
