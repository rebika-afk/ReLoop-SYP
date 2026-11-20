import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';

const app = express();

// Requirement 6: Configurable trust proxy
app.set('trust proxy', env.TRUST_PROXY);

// Security headers
app.use(helmet());

// CORS configuration with credentials support
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing with safe size limits (10kb) - Requirement 6: express.urlencoded removed
app.use(express.json({ limit: '10kb' }));

// Cookie parsing
app.use(cookieParser());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ReLoop API',
  });
});

// Mount API v1 routes
app.use('/api/v1', apiRoutes);

// Catch-all 404 for unhandled routes
app.use((req, res, next) => {
  next(new NotFoundError(`Resource not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
