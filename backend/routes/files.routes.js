import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import File from '../models/File.js';
import { cosineSimilarity } from '../utils/vectorSearch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '..', process.env.STORAGE_PATH || 'uploads');

/**
 * GET /api/files
 * Get all files with pagination
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;

    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }

    const total = await File.countDocuments(filter);
    const files = await File.find(filter)
      .sort({ uploadDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-chunks -text'); // Exclude large fields

    res.json({
      files,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/files/:id
 * Get file by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id).select('-chunks.embedding');
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/files/:id/preview
 * Get file preview data
 */
router.get('/:id/preview', async (req, res) => {
  try {
    const file = await File.findById(req.params.id).select('-chunks');
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      id: file._id,
      title: file.title,
      originalName: file.originalName,
      size: file.size,
      uploadDate: file.uploadDate,
      category: file.category,
      tags: file.tags,
      summary: file.summary,
      text: file.text.substring(0, 2000), // First 2000 characters
      processingStatus: file.processingStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/files/:id/similar
 * Get similar documents
 */
router.get('/:id/similar', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.chunks || file.chunks.length === 0 || !file.chunks[0].embedding) {
      return res.json({ similar: [] });
    }

    // Get file's average embedding
    const fileEmbedding = file.chunks[0].embedding;

    // Find all other complete files
    const otherFiles = await File.find({
      _id: { $ne: file._id },
      processingStatus: 'complete'
    });

    // Calculate similarity scores
    const similarities = otherFiles
      .filter(f => f.chunks && f.chunks.length > 0 && f.chunks[0].embedding)
      .map(f => ({
        file: f,
        score: cosineSimilarity(fileEmbedding, f.chunks[0].embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const similar = similarities.map(s => ({
      id: s.file._id,
      title: s.file.title,
      category: s.file.category,
      tags: s.file.tags,
      summary: s.file.summary,
      uploadDate: s.file.uploadDate,
      score: s.score
    }));

    res.json({ similar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/files/:id/download
 * Download file
 */
router.get('/:id/download', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(UPLOADS_DIR, file.filename);
    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/files/:id
 * Update file metadata (category, tags, etc.)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { category, tags, title } = req.body;
    const updateData = {};

    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (title) updateData.title = title;

    const file = await File.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-chunks -text');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/files/:id
 * Delete file
 */
router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // TODO: Delete physical file from disk
    // fs.unlinkSync(path.join(UPLOADS_DIR, file.filename));

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

