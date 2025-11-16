import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: false
  }
}, { _id: false });

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  text: {
    type: String,
    default: ''
  },
  chunks: [chunkSchema],
  summary: {
    short: String,
    bullets: [String]
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  category: {
    type: String,
    enum: ['Campaigns', 'Research', 'Strategy', 'Budget', 'Creative', 'Analytics', 
           'Legal', 'Contracts', 'Meeting Notes', 'Reports', 'Uncategorized'],
    default: 'Uncategorized',
    index: true
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'extracting', 'embedding', 'tagging', 'complete', 'error'],
    default: 'pending',
    index: true
  },
  errorMessage: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Text index for keyword search
fileSchema.index({ text: 'text', title: 'text', tags: 'text' });

// Compound indexes for common queries
fileSchema.index({ category: 1, uploadDate: -1 });
fileSchema.index({ processingStatus: 1, uploadDate: -1 });

const File = mongoose.model('File', fileSchema);

export default File;

