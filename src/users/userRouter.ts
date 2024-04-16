import express, { Request, Response } from 'express';
import { createUser } from './userController';

const userRouter = express.Router();

// POST /register
userRouter.post('/register', createUser);

export default userRouter;
