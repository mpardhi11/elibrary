import { NextFunction, Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import createHttpError from 'http-errors';
import fs from 'node:fs/promises';
import bookModel from './bookModel';
import { IBook } from './bookTypes';
import { UploadApiResponse } from 'cloudinary';
import { _Request } from '../middlewares/authenticate';

/**
 * Creates a new book.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export async function createBook(req: _Request, res: Response, next: NextFunction) {
    // Extracting necessary data from the request
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { title, genre } = req.body;
    let coverImageFilepath: string;
    let coverImageFormat: string;
    let originalCoverImageName: string;
    let pdfPath: string;
    let pdfOriginalName: string;
    const userId = req.userId as string;

    try {
        // Extracting information about the uploaded files
        const coverImageMimeType = files?.coverImage[0].mimetype;
        coverImageFormat = coverImageMimeType?.split('/')[1];
        coverImageFilepath = files?.coverImage[0].path;
        originalCoverImageName = files?.coverImage[0].originalname;

        pdfPath = files?.file[0].path;
        pdfOriginalName = files?.file[0].originalname;
    } catch (error) {
        console.error('createBook ~ error: ', error);
        return next(createHttpError(400, 'Error while uploading files'));
    }

    let uploadedCoverImage: UploadApiResponse;
    let uploadedPdf: UploadApiResponse;
    try {
        // Uploading cover image to Cloudinary
        uploadedCoverImage = await cloudinary.uploader.upload(coverImageFilepath, {
            filename_override: originalCoverImageName, // Use original name for Cloudinary file name
            folder: 'book-covers',
            format: coverImageFormat,
            public_id: originalCoverImageName.split('.').slice(0, -1).join('.'), // Remove file extension from original name
        });

        // Uploading PDF file to Cloudinary
        uploadedPdf = await cloudinary.uploader.upload(pdfPath, {
            resource_type: 'raw',
            filename_override: pdfOriginalName, // Use original name for Cloudinary file name
            folder: 'books-pdf',
            format: 'pdf',
            public_id: pdfOriginalName.split('.').slice(0, -1).join('.'), // Remove file extension from original name
        });
    } catch (error) {
        console.error(error);
        return next(createHttpError(400, 'Error occurred while uploading files'));
    }

    try {
        // Deleting uploaded files from the server after Cloudinary upload
        const coverImage = coverImageFilepath;
        await fs.unlink(coverImage);
        await fs.unlink(pdfPath);
    } catch (error) {
        console.error('createBook ~ error: ', error);
        return next(createHttpError(400, 'Error while deleting files'));
    }

    let newBook: IBook;
    try {
        // Creating a new book in the database
        newBook = (await bookModel.create({
            title,
            author: userId,
            genre,
            coverImage: uploadedCoverImage.secure_url,
            file: uploadedPdf.secure_url,
        })) as IBook;
    } catch (error: any) {
        console.error('createBook ~ error: ', error);
        if (error.name === 'ValidationError') return next(createHttpError(400, error.message));
        return next(createHttpError(400, 'Error while saving book to database'));
    }

    // Sending a successful response with the ID of the created book
    res.status(201).json({ id: newBook._id });
}

export async function updateBook(req: _Request, res: Response, next: NextFunction) {
    const { title = '', genre = '' } = req.body;
    const bookId = req.params.bookId as string;

    let book: IBook | null;

    try {
        book = await bookModel.findById({ _id: bookId });
        if (!book) return next(createHttpError(404, 'Book not found'));
    } catch (error) {
        console.error('updateBook ~ error: ', error);
        return next(createHttpError(400, 'Error while fetching book'));
    }

    if (book.author.toString() !== req.userId) {
        return next(createHttpError(403, 'Unauthorized, You are not the author of this book'));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    let coverImageFilepath: string = "";
    let coverImageFormat: string = "";
    let originalCoverImageName: string = ""
    let pdfPath: string = "";
    let pdfOriginalName: string = "";

    try {
        if (files && files.coverImage && files.coverImage[0]) {
            const coverImageMimeType = files.coverImage[0].mimetype;
            coverImageFormat = coverImageMimeType.split('/')[1];
            coverImageFilepath = files.coverImage[0].path;
            originalCoverImageName = files.coverImage[0].originalname;
        }

        if (files && files.file && files.file[0]) {
            pdfPath = files.file[0].path;
            pdfOriginalName = files.file[0].originalname;
        }
    } catch (error) {
        console.error('updateBook ~ error: ', error);
        return next(createHttpError(400, 'Error while uploading files'));
    }

    try {
        if (coverImageFilepath) {
            const uploadedCoverImage = await cloudinary.uploader.upload(coverImageFilepath, {
                filename_override: originalCoverImageName,
                folder: 'book-covers',
                format: coverImageFormat,
                public_id: originalCoverImageName.split('.').slice(0, -1).join('.'),
            });

            book.coverImage = uploadedCoverImage.secure_url;
        }

        if (pdfPath) {
            const uploadedPdf = await cloudinary.uploader.upload(pdfPath, {
                resource_type: 'raw',
                filename_override: pdfOriginalName,
                folder: 'books-pdf',
                format: 'pdf',
                public_id: pdfOriginalName.split('.').slice(0, -1).join('.'),
            });

            book.file = uploadedPdf.secure_url;
        }
    } catch (error) {
        console.error('updateBook ~ error: ', error);
        return next(createHttpError(400, 'Error while uploading files'));
    }

    try {
        if (coverImageFilepath) await fs.unlink(coverImageFilepath);
        if (pdfPath) await fs.unlink(pdfPath);
    } catch (error) {
        console.error('updateBook ~ error: ', error);
        return next(createHttpError(400, 'Error while deleting files'));
    }
    try {
        if (title) book.title = title;
        if (genre) book.genre = genre;

        await book.save();
    } catch (error) {
        console.error('updateBook ~ error: ', error);
        return next(createHttpError(400, 'Error while updating book'));
    }

    return res.json({ book });
}

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 * @returns list of books with author details
 */
export async function getBooks(req: Request, res: Response, next: NextFunction) {
    let books: IBook[];

    try {
        books = await bookModel.find().populate('author', 'name email -_id');
    } catch (error) {
        console.error('getBooks ~ error: ', error);
        return next(createHttpError(400, 'Error while fetching books'));
    }

    res.json({ books });
}


/**
    * 
    * @param req with bookId 
    * @param res 
    * @param next 
    * 
    * @returns book with author details
    */
export async function getBook(req: Request, res: Response, next: NextFunction) {
    const bookId = req.params.bookId as string;
    let book: IBook | null;

    try {
        book = await bookModel.findById(bookId).populate('author', 'name email -_id');

        if (!book) return next(createHttpError(404, 'Book not found'));
    } catch (error) {
        console.error('getBook ~ error: ', error);
        return next(createHttpError(400, 'Error while fetching book'));
    }

    res.json({ book });
}

/**
    * 
    * @param req 
    * @param res 
    * @param next 
    * 
    * @returns success message
    */
export async function deleteBook(req: _Request, res: Response, next: NextFunction) {
    const bookId = req.params.bookId as string;
    let book: IBook | null;

    try {
        book = await bookModel.findById(bookId);
        if (!book) return next(createHttpError(404, 'Book not found'));
    } catch (error) {
        console.error('deleteBook ~ error: ', error);
        return next(createHttpError(400, 'Error while fetching book'));
    }

    if (book.author.toString() !== req.userId) {
        return next(createHttpError(403, 'Unauthorized, You are not the author of this book'));
    }

    try {
        await book.deleteOne();
    } catch (error) {
        console.error('deleteBook ~ error: ', error);
        return next(createHttpError(400, 'Error while deleting book'));
    }

    res.status(200).json({ message: 'Book deleted successfully' });
}