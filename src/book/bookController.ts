import { Request, Response } from "express";


/**
 * 
 * @param req 
 * @param res 
 * @returns 
 * 
 */
export function createBook(req: Request, res: Response) {
    res.send('Create book');
}