import express from 'express';
import upload from '../middleware/upload.js';
import File from '../models/File.js';
import { processFileAsync } from '../services/fileProcessor.service.js';

const router = express.Router();

/**
 * POST /api/upload
 * Upload a new file
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create file record
    const file = new File({
      title: req.body.title || req.file.originalname,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      processingStatus: 'pending'
    });

    await file.save();

    // Start processing asynchronously
    processFileAsync(file._id);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        title: file.title,
        originalName: file.originalName,
        size: file.size,
        uploadDate: file.uploadDate,
        processingStatus: file.processingStatus
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/upload/status/:id
 * Get processing status of a file
 */
router.get('/status/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id).select('processingStatus errorMessage');
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      status: file.processingStatus,
      error: file.errorMessage || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

