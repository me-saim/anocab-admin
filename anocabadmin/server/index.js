const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - allow requests from React dev server (port 3000) and production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false // In production, same origin (served from same server)
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow React dev server
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (must be before static files)
app.use('/api/admins', require('./routes/admins'));
app.use('/api/users', require('./routes/users'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/qr-codes', require('./routes/qrCodes'));
app.use('/api/qr-scans', require('./routes/qrScans'));
app.use('/api/redeem-transactions', require('./routes/redeemTransactions'));
app.use('/api/payment-transactions', require('./routes/paymentTransactions'));
app.use('/api/calculator-data', require('./routes/calculatorData'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/upload', require('./routes/upload'));

// Serve uploaded files from writable/uploads
const uploadsPath = path.join(__dirname, '../writable/uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/writable/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Serve static files from React app build directory
const buildPath = path.join(__dirname, '../build');

// Check if build directory exists
const buildExists = fs.existsSync(buildPath);

if (buildExists) {
  app.use(express.static(buildPath));
  
  // Catch all handler: send back React's index.html file for any non-API routes
  // This allows React Router to handle client-side routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // If build doesn't exist, show helpful message
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.status(503).send(`
      <html>
        <head><title>Build Required</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>Build Required</h1>
          <p>The React app has not been built yet.</p>
          <p>Please run: <code>npm run build</code> in the project root directory.</p>
          <p>Then restart the server.</p>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`🚀 API Server is running on port ${PORT}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔌 API endpoints: http://localhost:${PORT}/api`);
    console.log(`📱 React dev server should be running on http://localhost:3000`);
    console.log(`💡 Frontend will connect to API at http://localhost:${PORT}/api`);
  } else if (buildExists) {
    console.log(`📱 Frontend and API are served from the same server`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  } else {
    console.log(`⚠️  React build not found. API is running, but frontend needs to be built.`);
    console.log(`💡 Run 'npm run build' to build the React app, then restart the server.`);
    console.log(`🔌 API endpoints are available at http://localhost:${PORT}/api`);
  }
});

module.exports = app;
