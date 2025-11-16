import express from 'express';
import File from '../models/File.js';
import Category from '../models/Category.js';

const router = express.Router();

/**
 * GET /api/categories
 * Get all categories (both from Category model and files) with counts
 */
router.get('/', async (req, res) => {
  try {
    // Get categories from files
    const fileCategories = await File.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      }
    ]);

    // Get all categories from Category model
    const allCategories = await Category.find().sort({ name: 1 });

    // Merge categories: include all from Category model, update counts from files
    const categoryMap = new Map();

    // Add all defined categories with count 0
    allCategories.forEach(cat => {
      categoryMap.set(cat.name, { category: cat.name, count: 0 });
    });

    // Update counts from files
    fileCategories.forEach(cat => {
      if (categoryMap.has(cat.category)) {
        categoryMap.get(cat.category).count = cat.count;
      } else {
        // Category exists in files but not in Category model (legacy data)
        categoryMap.set(cat.category, cat);
      }
    });

    // Convert map to array and sort
    const categories = Array.from(categoryMap.values()).sort((a, b) =>
      a.category.localeCompare(b.category)
    );

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/categories
 * Create a new category
 */
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.trim() });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Create the category
    const category = new Category({
      name: name.trim(),
      description: description || ''
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category: {
        name: category.name,
        description: category.description,
        count: 0
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/categories/:name
 * Delete a category (moves all files to 'Uncategorized')
 */
router.delete('/:name', async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.name);

    // Prevent deletion of Uncategorized
    if (categoryName === 'Uncategorized') {
      return res.status(400).json({ error: 'Cannot delete Uncategorized category' });
    }

    // Update all files in this category to 'Uncategorized'
    const result = await File.updateMany(
      { category: categoryName },
      { $set: { category: 'Uncategorized' } }
    );

    // Delete the category from Category model
    await Category.deleteOne({ name: categoryName });

    res.json({
      message: 'Category deleted successfully',
      filesUpdated: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

