/**
 * @fileoverview Express.js server entry point.
 *
 * Bootstraps the Express application with:
 * - Security middleware (helmet, cors, rate limiting)
 * - Cookie parsing and JSON body parsing
 * - All API routes mounted under /api/v1
 * - Socket.io attached to the HTTP server
 * - Global error handler
 */

import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { initSocket } from './src/config/socket.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { ApiError } from './src/utils/apiError.js';

// ─── Route Imports ────────────────────────────────────────────────────────────
import authRoutes from './src/modules/auth/auth.routes.js';
import userRoutes from './src/modules/users/users.routes.js';
import workspaceRoutes from './src/modules/workspaces/workspaces.routes.js';
import goalRoutes from './src/modules/goals/goals.routes.js';
import milestoneRoutes from './src/modules/milestones/milestones.routes.js';
import announcementRoutes from './src/modules/announcements/announcements.routes.js';
import actionItemRoutes from './src/modules/action-items/actionItems.routes.js';
import commentRoutes from './src/modules/comments/comments.routes.js';
import notificationRoutes from './src/modules/notifications/notifications.routes.js';
import analyticsRoutes from './src/modules/analytics/analytics.routes.js';
import auditRoutes from './src/modules/audit/audit.routes.js';

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Required for httpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── General Rate Limiting ────────────────────────────────────────────────────

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter limit for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(limiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/milestones', milestoneRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/action-items', actionItemRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/audit', auditRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Socket.io ────────────────────────────────────────────────────────────────

initSocket(server);

// ─── Start Server ─────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`📡 Socket.io attached`);
  console.log(`🔗 API: http://localhost:${PORT}/api/v1\n`);
});

export default app;
