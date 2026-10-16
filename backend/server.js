const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const authRoutes = require('./src/routes/authRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const branchRoutes = require('./src/routes/branchRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const rentalRoutes = require('./src/routes/rentalRoutes');
const maintenanceRoutes = require('./src/routes/maintenanceRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const dsaRoutes = require('./src/routes/dsaRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

const app = express();

// Permissive CORS to support both standalone Vite dev (:5173) and single-link unified (:5000)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile, curl, or same-origin)
      if (!origin) return callback(null, true);
      // In local development, allow any localhost/127.0.0.1 port
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Vektor Rentals API',
    unified_mode: true,
    timestamp: new Date().toISOString(),
  });
});

// Mount all API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/notifications', notificationRoutes);

// Explicit 404 for unhandled API calls
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Single-Link Serving: Serve Frontend Production Build from Express
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  // Serve static assets (JS, CSS, SVGs, images)
  app.use(express.static(frontendDistPath));

  // SPA fallback for all frontend client-side routes (Home, Booking, DSA Lab, Admin, etc.)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Fallback 404 if frontend hasn't been compiled
  app.use(notFoundHandler);
}

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 VEKTOR RENTALS UNIFIED FULL-STACK APPLICATION`);
  console.log(`======================================================`);
  console.log(`📌 One Link To Access Everything: http://localhost:${PORT}`);
  console.log(`📌 Health Check Endpoint:        http://localhost:${PORT}/api/health`);
  console.log(`📌 Database Connection:          ${process.env.DB_NAME || 'vektor_rentals'} on port ${process.env.DB_PORT || 3306}`);
  console.log(`======================================================\n`);
});

module.exports = app;
