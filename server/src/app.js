import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsMiddleware } from './config/cors.js';
import { asyncHandler, HttpError } from './lib/errors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestId } from './middleware/requestId.js';
import apiRoutes from './routes/index.js';
import { pool } from './db/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the built React app directory (client/dist)
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');

export const app = express();

app.disable('x-powered-by');
app.use(helmet({
  // Allow Vite-built assets (inline scripts & styles via CSP)
  contentSecurityPolicy: false,
}));
app.use(corsMiddleware);
app.use(requestId);
app.use(express.json({ limit: '1mb' }));

app.get('/health', asyncHandler(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
}));

// API routes — unknown API paths return JSON 404
app.use('/api/v1', apiRoutes, notFound);

// Serve the React production build (static assets)
app.use(express.static(CLIENT_DIST));

// Catch-all: send index.html so React Router handles navigation
app.get('*', (_req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return next(new HttpError(400, 'INVALID_JSON', 'Request body must contain valid JSON.'));
  }
  next(error);
});
app.use(errorHandler);