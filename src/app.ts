import express, { Request, Response } from 'express';
import { errorHandler } from './middlewares/globalErrorHandler';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, Express!' });
});

app.use(errorHandler);
export default app;
