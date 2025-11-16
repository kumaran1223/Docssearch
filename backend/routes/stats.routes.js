import express from 'express';
import File from '../models/File.js';
import SearchLog from '../models/SearchLog.js';

const router = express.Router();

/**
 * GET /api/stats
 * Get dashboard statistics
 */
router.get('/', async (req, res) => {
  try {
    const totalFiles = await File.countDocuments();
    const totalSearches = await SearchLog.countDocuments();
    
    // Calculate total storage used
    const files = await File.find().select('size');
    const storageUsed = files.reduce((sum, file) => sum + file.size, 0);

    // Count unique categories
    const categories = await File.distinct('category');
    const categoriesCount = categories.filter(c => c !== 'Uncategorized').length;

    res.json({
      totalFiles,
      totalSearches,
      storageUsed,
      categoriesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats/categories
 * Get category breakdown
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await File.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const formatted = categories.map(c => ({
      category: c._id,
      count: c.count
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats/recent-uploads
 * Get recent uploads
 */
router.get('/recent-uploads', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const recentFiles = await File.find()
      .sort({ uploadDate: -1 })
      .limit(limit)
      .select('title category uploadDate processingStatus');

    res.json(recentFiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats/search-trends
 * Get search trends over time
 */
router.get('/search-trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await SearchLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const formatted = trends.map(t => ({
      date: t._id,
      searches: t.count
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

