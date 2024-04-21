import express, { Request, Response } from 'express';
import { createBook } from './bookController';

const bookRouter = express.Router();

/**
 * Method : POST
 * Route : api/books
 * Description : Create a new book
 *  */
bookRouter.post('/', createBook);

export default bookRouter;
