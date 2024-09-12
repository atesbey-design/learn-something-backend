import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
