import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

// Extend Express Request type with requestId and user
declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        id: string;
        username: string;
        role: string;
      };
    }
  }
}

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
};

// Security Headers via Helmet
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // needed for Vite/React dev & inline scripts
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", 'http://localhost:5173', 'http://localhost:4000', 'https://api.openai.com']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// CORS configuration
export const corsMiddleware = () => {
  const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(s => s.trim());

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS error: Origin '${origin}' not allowed by policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
  });
};

// Rate limiter for general API requests
export const generalRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 mins
  max: Number(process.env.RATE_LIMIT_MAX) || 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  }
});

// Stricter rate limiter for AI evaluation & Break My Design to prevent cost/spam abuse
export const evaluationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // max 15 evaluations per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'EVALUATION_RATE_LIMIT_EXCEEDED',
      message: 'Evaluation rate limit exceeded. Please wait a minute before requesting another architectural assessment.'
    }
  }
});

// Authoritative server-side identity & ownership context
export const authContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In a full enterprise production system, this validates JWT / Session cookie.
  // For the hiring assignment prototype, we attach the authoritative demo identity.
  // Security principle: Client NEVER dictates its own userId or role in request bodies.
  req.user = {
    id: 'demo-user-1',
    username: 'senior_architect',
    role: 'LEARNER'
  };
  next();
};

// Centralized sanitized error handler
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.id || 'unknown-req';
  
  // Safe server-side log (no sensitive secrets printed)
  console.error(`[Error] RequestId: ${requestId} | Method: ${req.method} | Path: ${req.path} | Message: ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  // Handle Zod schema validation errors cleanly with 400 status
  if (err.name === 'ZodError' || err.issues) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload format or bounds.',
        details: err.errors || err.issues,
        requestId
      }
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR');
  
  // Mask internal error details from the client
  const clientMessage = statusCode === 500 
    ? 'An unexpected error occurred. Our engineering team has logged this incident.'
    : err.message || 'Request failed';

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: clientMessage,
      requestId
    }
  });
};
