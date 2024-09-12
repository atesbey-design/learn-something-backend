import express, { Request, Response } from 'express';
import Category from '../models/Category';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Tüm kategorileri getir
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: (error as Error).message });
  }
});

// Yeni kategori oluştur
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    // Kategori adının benzersiz olup olmadığını kontrol et
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }

    const newCategory = new Category({ name, description });
    await newCategory.save();
    
    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: (error as Error).message });
  }
});

// Çoklu kategori oluştur
router.post('/bulk', authMiddleware, async (req: Request, res: Response) => {
  try {
    const categories = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: 'Invalid input. Expected an array of categories.' });
    }

    const createdCategories = [];
    const errors = [];

    for (const category of categories) {
      const { name, description } = category;

      // Kategori adının benzersiz olup olmadığını kontrol et
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        errors.push(`A category with the name "${name}" already exists.`);
        continue;
      }

      const newCategory = new Category({ name, description });
      await newCategory.save();
      createdCategories.push(newCategory);
    }

    res.status(201).json({
      message: 'Categories created successfully',
      createdCategories,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating categories', error: (error as Error).message });
  }
});

export default router;
