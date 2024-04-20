import express, { Request, Response } from 'express';
import { createUser, loginUser } from './userController';

const userRouter = express.Router();

// POST /register
userRouter.post('/register', createUser);
userRouter.post('/login', loginUser)

export default userRouter;
