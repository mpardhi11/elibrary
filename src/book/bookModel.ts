import mongoose, { PopulatedDoc } from "mongoose";

import { IBook } from "./bookTypes";
import { User } from "../users/userModel";

const bookSchema = new mongoose.Schema<IBook>({
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default mongoose.model<IBook>('Book', bookSchema);

