/**
 * @desc Global error handling middleware.
 * It catches errors from async handlers and sends a structured JSON response.
 */
const errorHandler = (err, req, res, next) => {
    // Determine the status code. If a status code was already set on the response (e.g., res.status(404)), use it.
    // Otherwise, default to 500 (Internal Server Error).
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

    res.status(statusCode);

    // Send back a JSON response with the error message.
    // SECURITY: In a production environment, we don't want to leak implementation details, so we hide the stack trace.
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};

module.exports = {
    errorHandler,
};