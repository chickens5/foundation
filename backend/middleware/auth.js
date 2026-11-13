import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../services/jwtSecret.js';
import { httpError } from '../services/httpError.js';

// Verifies the bearer token and exposes its payload as req.user ({ user_id, username }).
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return next(httpError(401, 'Missing authentication token'));
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
        next();
    } catch {
        next(httpError(401, 'Invalid or expired token'));
    }
}

// Requires the authenticated user to be the :id in the route (IDOR prevention).
export const requireOwnAccount = [
    requireAuth,
    (req, res, next) => {
        if (String(req.user.user_id) !== String(req.params.id)) {
            return next(httpError(403, 'You do not have access to this account'));
        }
        next();
    },
];
