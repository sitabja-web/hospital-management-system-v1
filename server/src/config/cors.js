import { env } from './env.js';
import { HttpError } from '../lib/errors.js';

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  // Only enforce origin check for API routes.
  // Static asset requests (JS, CSS, images) are same-origin loads from the
  // HTML page and must never be blocked by CORS enforcement.
  const isApiRoute = req.path.startsWith('/api/');

  if (origin && isApiRoute && !env.corsOrigins.includes(origin)) {
    return next(new HttpError(403, 'CORS_ORIGIN_DENIED', 'Origin is not allowed.'));
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Request-Id');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}