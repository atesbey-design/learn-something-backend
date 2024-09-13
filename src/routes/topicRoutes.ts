import express, { Request, Response } from 'express';
import Topic from '../models/Topic';
import Category from '../models/Category';
import User from '../models/User'; // Add this import
import { authMiddleware } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// Günlük topic'i getir
router.get('/daily', authMiddleware, async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findOne().sort({ createdAt: -1 });
    if (!topic) {
      return res.status(404).json({ message: 'No topic found' });
    }
    // favoriteCount'un var olduğundan emin olalım
    const topicWithFavoriteCount = {
      ...topic.toObject(),
      favoriteCount: topic.favoriteCount || 0
    };
    res.json({ topic: topicWithFavoriteCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily topic', error: (error as Error).message });
  }
});

// Mevcut tekli topic ekleme endpoint'i
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content, categoryId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const newTopic = new Topic({
      title,
      content,
      category: categoryId,
      createdBy: userId
    });

    const savedTopic = await newTopic.save();
    res.status(201).json({ message: 'Topic created successfully', topic: savedTopic });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ message: 'Error creating topic', error: (error as Error).message });
  }
});

// Yeni toplu topic ekleme endpoint'i
router.post('/bulk', authMiddleware, async (req: Request, res: Response) => {
  try {
    const topics = req.body;
    const userId = req.userId;

    if (!Array.isArray(topics)) {
      return res.status(400).json({ message: 'Input should be an array of topics' });
    }

    const topicsWithUser = topics.map(topic => ({
      ...topic,
      createdBy: userId
    }));

    const savedTopics = await Topic.insertMany(topicsWithUser);
    res.status(201).json(savedTopics);
  } catch (error) {
    res.status(400).json({ message: 'Error creating topics', error: (error as Error).message });
  }
});

// Diğer CRUD işlemleri buraya eklenebilir

// Konuyu okundu olarak işaretle
router.post('/:topicId/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const userId = req.userId; // Changed from req.user.id

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (!user.readTopics.includes(topicId)) {
      await User.findByIdAndUpdate(userId, {
        $push: { readTopics: topicId },
        $set: { lastReadDate: new Date() },
        $inc: { dailyReadCount: 1 }
      }, { new: true, runValidators: false });
    }

    res.json({ message: 'Topic marked as read successfully' });
  } catch (error) {
    console.error('Error marking topic as read:', error);
    res.status(500).json({ message: 'Error marking topic as read', error: (error as Error).message });
  }
});

// Kullanıcının oluşturduğu topicler'i getir
router.get('/user', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // Changed from req.user.id
    const topics = await Topic.find({ createdBy: userId });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user topics', error: (error as Error).message });
  }
});

// Tüm topicler'i getir (kategori bilgisiyle birlikte)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('category', 'name')
      .populate('createdBy', 'name')
      .lean();

    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Error fetching topics', error: (error as Error).message });
  }
});

export default router;
