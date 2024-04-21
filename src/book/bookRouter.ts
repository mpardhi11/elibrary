import express, { Request, Response } from 'express';
import { createBook, updateBook } from './bookController';
import multer from 'multer';
import path from 'node:path';
import { authenticate } from '../middlewares/authenticate';

const bookRouter = express.Router();

// Setting up multer for file upload
const upload = multer({
    dest: path.join(__dirname, '../../public/data/uploads'), // Destination folder for uploaded files
    limits: { fileSize: 9.5e6 }, // 9.5MB limit for file size
});

// POST endpoint for creating a new book
// Path: /api/books
// Access: Private
bookRouter.post(
    '/',
    authenticate,
    upload.fields([
        { name: 'coverImage', maxCount: 1 }, // Field for cover image upload (max 1 file)
        { name: 'file', maxCount: 1 }, // Field for book file upload (max 1 file)
    ]),
    createBook,
);

bookRouter.patch(
    '/:bookId',
    authenticate,
    upload.fields([
        { name: 'coverImage', maxCount: 1 }, // Field for cover image upload (max 1 file)
        { name: 'file', maxCount: 1 }, // Field for book file upload (max 1 file)
    ]),
    updateBook,
);

export default bookRouter;
