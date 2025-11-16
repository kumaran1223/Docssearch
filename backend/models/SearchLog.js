import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  filters: {
    category: String,
    fileType: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for recent searches
searchLogSchema.index({ timestamp: -1 });
searchLogSchema.index({ userId: 1, timestamp: -1 });

const SearchLog = mongoose.model('SearchLog', searchLogSchema);

export default SearchLog;

