import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '../config/config';
import createHttpError from 'http-errors';

// Define a custom Request interface extending the express Request interface
export interface _Request extends Request {
    userId?: string;
}

/**
 * Middleware function to authenticate users based on JWT token.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization');
    if (!token) {
        return next(createHttpError(401, 'Access denied. No token provided'));
    }

    try {
        const decoded = verify(token, config.jwtSecret as string);
        // Extract user ID from the decoded token and attach it to the request object
        const _req = req as _Request;
        _req.userId = decoded.sub as string;

        // Call the next middleware function
        next();
    } catch (error) {
        // Return 400 error if token is invalid
        return next(createHttpError(400, 'Invalid token. Please provide a valid token.'));
    }
}
