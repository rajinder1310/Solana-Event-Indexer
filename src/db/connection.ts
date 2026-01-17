
import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('📦 Connected to MongoDB');

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error}`);
    process.exit(1);
  }
};

export const closeDatabase = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};
