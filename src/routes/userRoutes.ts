import express, { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Topic from '../models/Topic';
import { generateToken } from '../config/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Tüm kullanıcıları getir
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: (error as Error).message });
  }
});

// Belirli bir kullanıcıyı getir
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Sadece ihtiyacımız olan alanları seçiyoruz
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        favoriteTopics: user.favoriteTopics,
        lastReadDate: user.lastReadDate,
        dailyReadCount: user.dailyReadCount
      };
      res.json(userResponse);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error:any) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Kullanıcı kaydı
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new User({ name, email });
    const savedUser = await newUser.save() as any;
    const token = generateToken(savedUser._id);
    res.status(201).json({ user: savedUser, token });
  } catch (error:any) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Kullanıcı girişi
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user._id as string);
    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Kullanıcı güncelleme
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: (error as Error).message });
  }
});

// Kullanıcı silme
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (deletedUser) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: (error as Error).message });
  }
});

// Favori topic ekleme
router.post('/:id/favorites/:topicId', async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { favoriteTopics: req.params.topicId } },
      { new: true }
    );
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User or topic not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding favorite topic', error: (error as Error).message });
  }
});

// Favori topic çıkarma
router.delete('/:userId/favorites/:topicId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, topicId } = req.params ;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const index = user.favoriteTopics.findIndex(topic => topic.equals(topicId));
    if (index > -1) {
      user.favoriteTopics.splice(index, 1);
      await user.save();

      topic.favoriteCount = Math.max(0, topic.favoriteCount - 1);
      await topic.save();
    }

    // MongoDB dökümanını düz bir JavaScript nesnesine dönüştür
    const userObject = user.toObject();
    
    // Hassas bilgileri kaldır
    delete userObject.password;

    res.json({ 
      message: 'Favorite topic removed successfully', 
      favoriteTopics: userObject.favoriteTopics 
    });
  } catch (error) {
    console.error('Error removing favorite topic:', error);
    res.status(500).json({ message: 'Error removing favorite topic', error: (error as Error).message });
  }
});

// Günlük topic okuma
router.post('/:userId/read-topic', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastReadDate < today || user.dailyReadCount === 0) {
      // Yeni gün başlamış veya hiç okuma yapılmamış
      user.lastReadDate = new Date();
      user.dailyReadCount = 1;

      // Rastgele bir topic seç
      const count = await Topic.countDocuments();
      const random = Math.floor(Math.random() * count);
      const topic = await Topic.findOne().skip(random);

      await user.save();

      res.json({ message: 'Daily topic retrieved successfully', topic });
    } else if (user.dailyReadCount >= 1) {
      // Kullanıcı zaten bugün bir topic okumuş
      res.json({ message: 'You have reached your daily limit. Come back tomorrow for more!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error: (error as Error).message });
  }
});

// Favori topic ekleme
router.post('/:userId/favorites', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { topicId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (!user.favoriteTopics.includes(topicId)) {
      await User.findByIdAndUpdate(userId, {
        $push: { favoriteTopics: topicId },
        $set: { lastFavoriteAdded: new Date() }
      }, { new: true, runValidators: false });

      await Topic.findByIdAndUpdate(topicId, {
        $inc: { favoriteCount: 1 }
      }, { new: true, runValidators: false });
    }

    res.json({ message: 'Favorite topic added successfully' });
  } catch (error) {
    console.error('Error adding favorite topic:', error);
    res.status(500).json({ message: 'Error adding favorite topic', error: (error as Error).message });
  }
});

// Kullanıcının favori topiclerini getir
router.get('/:userId/favorites', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favoriteTopics = await Topic.find({ _id: { $in: user.favoriteTopics } }).lean();

    res.json(favoriteTopics);
  } catch (error) {
    console.error('Error fetching favorite topics:', error);
    res.status(500).json({ message: 'Error fetching favorite topics', error: (error as Error).message });
  }
});

export default router;
