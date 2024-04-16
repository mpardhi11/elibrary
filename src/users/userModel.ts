import mongoose from 'mongoose';
import { User as UserInterface } from './userTypes';

const userSchema = new mongoose.Schema<UserInterface>(
  {
    name: { type: String, required: [true, 'Name is required'] },

    email: { type: String, required: [true, 'Email is required'], unique: true },

    password: { type: String, required: [true, 'Password is required'] },

    salt: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

// Collection name is 'User'
export const User = mongoose.model('User', userSchema);
