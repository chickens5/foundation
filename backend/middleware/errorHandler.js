// Forwards rejected promises from async route handlers to the error middleware.
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Only errors flagged `expose` (httpError, body-parser 4xx) reach the client verbatim; everything else is a generic 500.
export function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    if (status >= 500) {
        console.error(`${req.method} ${req.originalUrl} failed:`, err);
    }
    res.status(status).json({ error: err.expose ? err.message : 'Internal server error' });
}
