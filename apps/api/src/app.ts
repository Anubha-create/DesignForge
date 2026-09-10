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
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'DesignForge API',
    demoMode: process.env.DEMO_MODE === 'true',
    timestamp: new Date().toISOString()
  });
});

// Mount modular routes
app.use('/api/problems', problemsRouter);
app.use('/api/attempts', attemptsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/security', securityRouter);

// Centralized sanitized error handler
app.use(errorHandler);

export default app;
