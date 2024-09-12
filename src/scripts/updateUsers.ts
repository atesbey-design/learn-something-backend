import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string);

async function updateUsers() {
  try {
    const result = await User.updateMany(
      { readTopics: { $exists: false } },
      { $set: { readTopics: [] } }
    );
    console.log(`Updated ${result.modifiedCount} users`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    mongoose.disconnect();
  }
}

updateUsers();