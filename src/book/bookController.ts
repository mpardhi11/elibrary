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
