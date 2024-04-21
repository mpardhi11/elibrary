import express, { Request, Response } from 'express';
import { errorHandler } from './middlewares/globalErrorHandler';
import userRouter from './users/userRouter';
import bookRouter from './book/bookRouter';
import cors from 'cors';
import { config } from './config/config';

const app = express();

// Disable the default 'X-Powered-By' header
app.disable('x-powered-by');

// Set your own value for the 'X-Powered-By' header
app.use((req, res, next) => {
  res.set('X-Powered-By', config.XPoweredBy);
  next();
});

// Middleware to enable CORS
app.use(cors({ origin: config.frontDomain, credentials: true, }))
// Middleware to parse incoming requests
app.use(express.json());
// Middleware to parse incoming requests with urlencoded payloads
app.use(express.urlencoded({ extended: true }));
// Middleware to serve static files from the 'public' folder
app.use(express.static('public'));

// Route handler for the test endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, Express!' });
});

app.use('/api/users', userRouter);
app.use('/api/books', bookRouter);
app.use(errorHandler);
export default app;
