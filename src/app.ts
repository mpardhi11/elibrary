import express, { Request, Response } from 'express';
import { errorHandler } from './middlewares/globalErrorHandler';
import userRouter from './users/userRouter';

const app = express();

// Middleware to parse incoming requests
app.use(express.json());
// Middleware to parse incoming requests with urlencoded payloads
app.use(express.urlencoded({ extended: true }));
// Middleware to serve static files from the 'public' folder
app.use(express.static('public'));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, Express!' });
});

app.use('/api/users', userRouter);
app.use(errorHandler);
export default app;
