import mongoose from 'mongoose';
import { config } from './config';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log('Connected to the database'));

    mongoose.connection.on('error', (error) => {
      console.error('Error while connecting to the database');
      console.error(error);
    });

    await mongoose.connect(`${config.db.url}/${config.db.name}`);
  } catch (error) {
    console.error('Error connecting to the database');
    console.error(error);
    // Exit the process if the connection fails with an error
    process.exit(1);
  }
};

export { connectDB };
