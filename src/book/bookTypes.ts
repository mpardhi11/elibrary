import { Document } from "mongoose";
import { User } from "../users/userTypes";

export interface IBook extends Document {
    _id: string;
    title: string;
    author: User;
    genre: string;
    coverImage: string;
    file: string;
    createdAt: Date;
    updatedAt: Date;

}