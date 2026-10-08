import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Ensure upload & invoice dirs exist
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(env.INVOICE_DIR)) {
  fs.mkdirSync(env.INVOICE_DIR, { recursive: true });
}

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Assets
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));
app.use('/invoices', express.static(path.resolve(env.INVOICE_DIR)));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Krilea Ecommerce API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api', apiRouter);

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
async function startServer() {
  try {
    const dbOk = await testConnection();
    if (!dbOk) {
      console.error('Failed to connect to PostgreSQL database. Exiting.');
      process.exit(1);
    }

    app.listen(env.PORT, () => {
      console.log(`=============================================`);
      console.log(` ✨ Kriléa Backend API Server Running ✨`);
      console.log(` URL: http://localhost:${env.PORT}`);
      console.log(` Health: http://localhost:${env.PORT}/api/health`);
      console.log(` Environment: ${env.NODE_ENV}`);
      console.log(`=============================================`);
    });
  } catch (error) {
    console.error('Fatal server startup error:', error);
    process.exit(1);
  }
}

startServer();
