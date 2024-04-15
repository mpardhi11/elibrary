import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { config } from '../config/config';

/**
 * Global error handling middleware.
 * This middleware function is the final step in the middleware chain.
 * It catches errors thrown in any of the preceding middleware functions.
 *
 * @param err The error object caught by the middleware.
 * @param req The HTTP request object.
 * @param res The HTTP response object.
 * @param next The callback function to pass control to the next middleware.
 */
function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  const statusCode = (err.statusCode as number) || 500;

  res.status(statusCode).json({
    message: err.message as string,
    // Conditionally include the error stack trace in the response based on the environment.
    // In a production environment, the stack trace should not be exposed for security reasons.
    errorStack: config.env === 'development' ? err.stack : null,
  });
}

export { errorHandler };
