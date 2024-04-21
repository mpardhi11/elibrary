import express from 'express';
import { createBook, updateBook, getBooks, getBook } from './bookController';
import multer from 'multer';
import path from 'node:path';
import { authenticate } from '../middlewares/authenticate';

const bookRouter = express.Router();

/** 
 * Multer configuration for file uploads.
 * Multer is a middleware for handling multipart/form-data, which is 
*/
const upload = multer({
    dest: path.join(__dirname, '../../public/data/uploads'), // Destination folder for uploaded files
    limits: { fileSize: 9.5e6 }, // 9.5MB limit for file size
});

/**
 * POST endpoint for creating a new book.
 * Path: /api/books
 * Access: Private
 * returns {IBook} - A book object
 */
bookRouter.post(
    '/',
    authenticate,
    upload.fields([
        { name: 'coverImage', maxCount: 1 }, // Field for cover image upload (max 1 file)
        { name: 'file', maxCount: 1 }, // Field for book file upload (max 1 file)
    ]),
    createBook,
);

/**
 * PATCH endpoint for updating a book.
 * Path: /api/books/:bookId
 * Access: Private
 * returns {IBook} - A book object
 */
bookRouter.patch(
    '/:bookId',
    authenticate,
    upload.fields([
        { name: 'coverImage', maxCount: 1 }, // Field for cover image upload (max 1 file)
        { name: 'file', maxCount: 1 }, // Field for book file upload (max 1 file)
    ]),
    updateBook,
);

/**
 * GET endpoint for fetching all books.
 * Path: /api/books
 * Access: Public
 * returns {Array<IBook>} - An array of book objects
 */
bookRouter.get('/', getBooks);

/**
 * GET endpoint for fetching a single book.
 * Path: /api/books/:bookId
 * Access: Public
 * returns {IBook} - A book object
 */
bookRouter.get('/:bookId', getBook);

export default bookRouter;
