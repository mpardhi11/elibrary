import { config as conf } from 'dotenv';
conf();

const _config = {
  port: process.env.PORT || 3000,
  db: {
    url: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017',
    name: process.env.DB_NAME || 'test',
  },
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || '',
};

// Freeze the config object to prevent further changes
// Creating config object as read-only
export const config = Object.freeze(_config);
