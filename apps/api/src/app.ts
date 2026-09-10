import express from 'express';
import dotenv from 'dotenv';
import { 
  helmetMiddleware, 
  corsMiddleware, 
  requestIdMiddleware, 
  generalRateLimiter, 
  authContextMiddleware, 
  errorHandler 
} from './middleware/security.js';
import problemsRouter from './routes/problems.js';
import attemptsRouter from './routes/attempts.js';
import dashboardRouter from './routes/dashboard.js';
import securityRouter from './routes/security.js';

dotenv.config();

const app = express();

// Security middlewares
app.use(requestIdMiddleware);
app.use(helmetMiddleware);
app.use(corsMiddleware());
app.use(generalRateLimiter);

// Parse JSON with safe payload size limit (max 1MB)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Auth & identity context
app.use(authContextMiddleware);

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'DesignForge API',
    demoMode: process.env.DEMO_MODE === 'true',
    timestamp: new Date().toISOString()
  });
});

// Mount modular routes
app.use(['/api/problems', '/problems'], problemsRouter);
app.use(['/api/attempts', '/attempts'], attemptsRouter);
app.use(['/api/dashboard', '/dashboard'], dashboardRouter);
app.use(['/api/security', '/security'], securityRouter);

// Serve static frontend in production if built
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDistPath = path.resolve(__dirname, '../../web/dist');

if (fs.existsSync(webDistPath)) {
  app.use(express.static(webDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(webDistPath, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

// Centralized sanitized error handler
app.use(errorHandler);

export default app;
