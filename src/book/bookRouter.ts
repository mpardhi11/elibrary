import express, { Request, Response } from 'express';
import { createBook } from './bookController';
import multer from 'multer';
import path from 'node:path';

const bookRouter = express.Router();

const upload = multer({
    dest: path.join(__dirname, '../../public/data/uploads'),
    limits: { fileSize: 9.5e6 }, // 9.5MB limit
})
/**
 * Method : POST
 * Route : api/books
 * Description : Create a new book
 *  */
bookRouter.post('/', upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), createBook);

export default bookRouter;
