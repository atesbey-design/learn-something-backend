import mongoose from 'mongoose';
import Topic from '../models/Topic';
import Category from '../models/Category';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string);

async function cleanInvalidCategories() {
  try {
    const topics = await Topic.find().lean();

    for (const topic of topics) {
      if (!topic.category || !mongoose.Types.ObjectId.isValid(topic.category.toString())) {
        console.log(`Fixing invalid category for topic: ${topic._id}`);
        
        // Geçici olarak bir "Uncategorized" kategori oluştur veya mevcut olanı kullan
        let uncategorized = await Category.findOne({ name: 'Uncategorized' });
        if (!uncategorized) {
          uncategorized = new Category({ name: 'Uncategorized', description: 'Default category for topics with invalid categories' });
          await uncategorized.save();
        }

        // Topic'i güncelle
        await Topic.findByIdAndUpdate(topic._id, { category: uncategorized._id });
      }
    }

    console.log('Finished cleaning invalid categories');
  } catch (error) {
    console.error('Error cleaning invalid categories:', error);
  } finally {
    mongoose.disconnect();
  }
}

cleanInvalidCategories();
