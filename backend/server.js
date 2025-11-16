import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database.js';
import uploadRoutes from './routes/upload.routes.js';
import searchRoutes from './routes/search.routes.js';
import filesRoutes from './routes/files.routes.js';
import statsRoutes from './routes/stats.routes.js';
import authRoutes from './routes/auth.routes.js';
import categoriesRoutes from './routes/categories.routes.js';

// Environment variables are loaded via the side-effect import above

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (both at root and /api for frontend compatibility)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      error: 'File too large',
      maxSize: process.env.MAX_FILE_SIZE || '100MB'
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Default error
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`✓ Server running at http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

