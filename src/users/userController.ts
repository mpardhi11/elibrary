import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import { NextFunction, Request, Response } from 'express';
import { User } from './userModel';
import { config } from '../config/config';
import { sign } from 'jsonwebtoken';
import { User as IUser } from './userTypes';

async function createUser(req: Request, res: Response, next: NextFunction) {
  const { name = '', email = '', password = '' } = req?.body;

  // Validate the user object
  if (!name || !email || !password) {
    const error = createHttpError(400, 'Name, email, and password are required');
    return next(error);
  }

  try {
    // Check if the user already exists in the database
    const user = await User.findOne({ email });

    if (user) {
      const error = createHttpError(400, `User already exists with ${email}`);
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, 'Error while checking user in the database'));
  }

  let newUser: IUser;

  try {
    // Save the user object to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      salt,
    });
  } catch (error) {
    return next(createHttpError(500, 'Error while creating user '));
  }

  try {
    // Token generation JWT
    const token = sign({ sub: newUser?._id }, config.jwtSecret as string, { expiresIn: '7d' });

    //Send response
    res.status(201).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, 'Error while generating token'));
  }
}

export { createUser };
