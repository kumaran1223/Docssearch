import express from 'express';
import File from '../models/File.js';

const router = express.Router();

/**
 * GET /api/categories
 * Get all unique categories with counts
 */
router.get('/', async (req, res) => {
  try {
    const categories = await File.aggregate([
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
      },
      {
        $sort: { category: 1 }
      }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/categories
 * Create a new category (by updating a file's category)
 */
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await File.findOne({ category: name.trim() });
    
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Return success - category will be created when a file is assigned to it
    res.json({ 
      message: 'Category ready to use',
      category: name.trim()
    });
  } catch (error) {
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

    // Update all files in this category to 'Uncategorized'
    const result = await File.updateMany(
      { category: categoryName },
      { $set: { category: 'Uncategorized' } }
    );

    res.json({ 
      message: 'Category deleted successfully',
      filesUpdated: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

