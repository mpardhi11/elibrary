import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { User } from './userModel';

async function createUser(req: Request, res: Response, next: NextFunction) {
  const { name = '', email = '', password = '' } = req?.body;

  // Validate the user object
  if (!name || !email || !password) {
    const error = createHttpError(400, 'Name, email, and password are required');
    return next(error);
  }

  // Check if the user already exists in the database
  const user = await User.findOne({ email });

  if (user) {
    const error = createHttpError(400, `User already exists with ${email}`);
    return next(error);
  }

  // Save the user object to the database

  //Send response
  res.status(201).json({ message: 'User created successfully' });
}

export { createUser };
