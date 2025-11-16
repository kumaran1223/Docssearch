# DocsSearch - AI-Powered Marketing Knowledge Discovery Platform

> A complete, production-ready, full-stack web application for internal marketing document search and knowledge management using AI-powered semantic search.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini_AI-orange.svg)](https://ai.google.dev/)

---

## 📋 Table of Contents

- [Summary](#-summary)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Sample cURL Commands](#-sample-curl-commands)
- [Acceptance Criteria](#-acceptance-criteria)
- [Troubleshooting](#-troubleshooting)

---

## 📝 Summary

**DocsSearch** is an AI-powered document search and knowledge management platform designed for marketing teams. It combines semantic search using Google Gemini AI embeddings with traditional keyword search (BM25) to provide highly relevant search results across multiple document formats.

### Key Capabilities:
- **Intelligent Search**: Hybrid semantic + keyword search with 70/30 weighting
- **Multi-Format Support**: PDF, DOCX, PPTX, TXT, JPG, PNG (with OCR)
- **AI Processing**: Automatic summarization, categorization, and tagging
- **Dynamic Categories**: Create custom categories and organize documents
- **Real-time Analytics**: Dashboard with stats, recent uploads, and searches
- **Modern UI**: Professional admin interface with smooth animations

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Axios** - Promise-based HTTP client
- **React Router 6** - Client-side routing
- **date-fns** - Modern date utility library

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Fast, minimalist web framework
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Mongoose** - MongoDB object modeling (ODM)
- **Google Gemini AI** - Text embeddings and summarization
  - `text-embedding-004` - 768-dimensional embeddings
  - `gemini-pro` - Text generation and summarization
- **Multer** - Multipart/form-data file upload handling
- **pdf-parse** - PDF text extraction
- **mammoth** - DOCX text extraction
- **tesseract.js** - OCR for images

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Concurrently** - Run multiple npm scripts simultaneously

---

## ✨ Features

### Core Functionality
✅ **AI-Powered Semantic Search** - Hybrid search combining Gemini embeddings with BM25 keyword matching
✅ **Multi-Format Document Support** - PDF, DOCX, PPTX, TXT, JPG, PNG with OCR
✅ **Intelligent Processing Pipeline** - 5-stage async processing (Upload → Extract → Embed → Summarize → Tag)
✅ **Dynamic Category Management** - Create, delete, and organize custom categories
✅ **File Management** - Move files between categories, delete files
✅ **Analytics Dashboard** - Real-time stats, recent uploads, searches, category breakdown
✅ **File Preview Modal** - View AI summaries and similar documents

### UI/UX Enhancements
✅ **Smooth Animations** - Fade-in, slide-up, scale-in effects throughout
✅ **Modern Design** - Professional admin dashboard aesthetic
✅ **Responsive Layout** - Works on desktop, tablet, and mobile
✅ **Real-time System Status** - Health monitoring with live updates
✅ **Interactive Elements** - Hover effects, transitions, visual feedback
✅ **Icon-Rich Interface** - Heroicons throughout for better UX

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and **npm 9+** - [Download here](https://nodejs.org/)
- **MongoDB Atlas Account** (Free tier) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Google Gemini API Key** (Free) - [Get API key here](https://makersuite.google.com/app/apikey)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/kumaran1223/Docssearch.git
cd Docssearch
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install

# Or install separately:
cd backend && npm install
cd ../frontend && npm install
```

### Step 3: MongoDB Atlas Setup

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up
2. **Create Cluster**: Create a free M0 cluster (512MB storage)
3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `docssearch` (or your choice)
   - Password: Generate a secure password
   - User Privileges: "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>` and `<password>` with your credentials
   - Add database name: `docssearch`



### Step 4: Google Gemini API Setup

1. **Get API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key (starts with `AIza...`)

2. **API Key Location**: You'll paste this in the `.env` file in the next step

### Step 5: Configure Environment Variables

Create a file named `.env` in the `backend/` directory:

```bash
cd backend
# On Windows PowerShell:
New-Item -ItemType File -Path .env

# On Mac/Linux:
touch .env
```

**Open `backend/.env` and paste the following:**

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# MongoDB Atlas connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?options
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/docssearch?retryWrites=true&w=majority

# ============================================
# GOOGLE GEMINI AI CONFIGURATION
# ============================================
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# AUTHENTICATION (Optional - for future use)
# ============================================
JWT_SECRET=your-secret-key-change-in-production-use-random-string

# ============================================
# FILE STORAGE CONFIGURATION
# ============================================
STORAGE_PATH=./uploads
MAX_FILE_SIZE=104857600

# ============================================
# DEMO USER (Optional - for future use)
# ============================================
DEMO_USERNAME=admin
DEMO_PASSWORD=demo123
```

**⚠️ Important**: Replace the following values:
- `your_username` - Your MongoDB Atlas username
- `your_password` - Your MongoDB Atlas password
- `cluster0.xxxxx.mongodb.net` - Your actual cluster URL from MongoDB Atlas
- `your_gemini_api_key_here` - Your Google Gemini API key (starts with `AIza...`)

---

## 🏃 Running the Application

### Option 1: Run Both Services Together (Recommended)

From the root directory:

```bash
npm run dev
```

This starts:
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:5173`

### Option 2: Run Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see:
- ✅ System Online indicator (top-right corner)
- ✅ Dashboard with stats
- ✅ Navigation sidebar

### Optional: Seed Sample Data

To populate the database with 5 sample marketing documents:

```bash
cd backend
npm run seed
```

---

## 🔧 Environment Variables

### Complete Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ Yes | - | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | ✅ Yes | - | Google Gemini API key for AI features |
| `GEMINI_ENDPOINT` | No | `https://generativelanguage.googleapis.com/v1beta` | Gemini API endpoint |
| `PORT` | No | `5000` | Backend server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `JWT_SECRET` | No | - | Secret key for JWT tokens (future use) |
| `STORAGE_PATH` | No | `./uploads` | File upload directory |
| `MAX_FILE_SIZE` | No | `104857600` | Max file size in bytes (100MB) |
| `DEMO_USERNAME` | No | `admin` | Demo user username (future use) |
| `DEMO_PASSWORD` | No | `demo123` | Demo user password (future use) |

---

## 📚 API Endpoints

Base URL: `http://localhost:5000/api`

### Upload Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a new document |

### Search Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search` | Search documents with query and filters |
| GET | `/api/search/recent` | Get recent searches |

### File Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | Get all files |
| GET | `/api/files/:id` | Get file by ID |
| GET | `/api/files/:id/preview` | Get file preview with summary |
| GET | `/api/files/:id/similar` | Get similar documents |
| GET | `/api/files/:id/download` | Download file |
| PATCH | `/api/files/:id` | Update file metadata (category, tags, title) |
| DELETE | `/api/files/:id` | Delete file |

### Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories with document counts |
| POST | `/api/categories` | Create new category |
| DELETE | `/api/categories/:name` | Delete category (moves files to "Uncategorized") |


### Stats Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get dashboard statistics |
| GET | `/api/stats/categories` | Get category breakdown |
| GET | `/api/stats/recent-uploads` | Get recent uploads |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| GET | `/api/health` | Health check endpoint (alternative) |

---

## 🧪 Sample cURL Commands

### 1. Upload a Document

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@/path/to/document.pdf"
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "673d8e1a2f4b5c6d7e8f9a0b",
    "title": "document.pdf",
    "originalName": "document.pdf",
    "size": 245678,
    "mimeType": "application/pdf",
    "processingStatus": "pending",
    "uploadDate": "2024-11-16T10:30:00.000Z"
  }
}
```

### 2. Search Documents

```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Q4 holiday campaign strategy",
    "category": "Campaigns",
    "page": 1
  }'
```

**Response:**
```json
{
  "results": [
    {
      "id": "673d8e1a2f4b5c6d7e8f9a0b",
      "title": "Q4 Holiday Campaign Brief",
      "snippet": "Our <mark>Q4 holiday campaign</mark> focuses on...",
      "summary": {
        "short": "Campaign overview for Q4 holiday season targeting millennial shoppers.",
        "bullets": [
          "Multi-channel approach across social media and email",
          "Budget allocation of $500K",
          "Expected ROI of 250%"
        ]
      },
      "tags": ["campaign", "holiday", "Q4", "strategy", "marketing"],
      "category": "Campaigns",
      "score": 0.89,
      "uploadDate": "2024-11-15T10:30:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 2
}
```

### 3. Get File Preview

```bash
curl http://localhost:5000/api/files/673d8e1a2f4b5c6d7e8f9a0b/preview
```

**Response:**
```json
{
  "id": "673d8e1a2f4b5c6d7e8f9a0b",
  "title": "Q4 Holiday Campaign Brief",
  "summary": {
    "short": "Campaign overview for Q4 holiday season.",
    "bullets": ["Point 1", "Point 2", "Point 3"]
  },
  "tags": ["campaign", "holiday", "Q4"],
  "category": "Campaigns",
  "uploadDate": "2024-11-15T10:30:00.000Z",
  "size": 245678,
  "mimeType": "application/pdf"
}
```

### 4. Get Similar Documents

```bash
curl http://localhost:5000/api/files/673d8e1a2f4b5c6d7e8f9a0b/similar?limit=5
```

**Response:**
```json
{
  "similar": [
    {
      "id": "673d8e1a2f4b5c6d7e8f9a0c",
      "title": "Q3 Campaign Results",
      "category": "Reports",
      "score": 0.85,
      "uploadDate": "2024-10-01T10:30:00.000Z"
    }
  ]
}
```

### 5. Get Dashboard Statistics

```bash
curl http://localhost:5000/api/stats
```

**Response:**
```json
{
  "totalFiles": 42,
  "totalSearches": 156,
  "storageUsed": 15728640,
  "categoriesCount": 8,
  "recentUploads": 5,
  "avgProcessingTime": 12.5
}
```

### 6. Get All Categories

```bash
curl http://localhost:5000/api/categories
```

**Response:**
```json
[
  { "category": "Campaigns", "count": 12 },
  { "category": "Reports", "count": 8 },
  { "category": "Research", "count": 15 },
  { "category": "Strategy", "count": 7 }
]
```

### 7. Create New Category

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Product Launches"}'
```

**Response:**
```json
{
  "message": "Category ready to use",
  "category": "Product Launches"
}
```

### 8. Update File Category

```bash
curl -X PATCH http://localhost:5000/api/files/673d8e1a2f4b5c6d7e8f9a0b \
  -H "Content-Type: application/json" \
  -d '{"category": "Strategy"}'
```

**Response:**
```json
{
  "id": "673d8e1a2f4b5c6d7e8f9a0b",
  "title": "Q4 Holiday Campaign Brief",
  "category": "Strategy",
  "tags": ["campaign", "holiday", "Q4"],
  "uploadDate": "2024-11-15T10:30:00.000Z"
}
```

### 9. Delete File

```bash
curl -X DELETE http://localhost:5000/api/files/673d8e1a2f4b5c6d7e8f9a0b
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

### 10. Health Check

```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-16T10:30:00.000Z",
  "uptime": 3600.5
}
```


---

## ✅ Acceptance Criteria

### Core Features
- [x] **Document Upload** - Upload PDF, DOCX, PPTX, TXT, JPG, PNG files with progress tracking
- [x] **AI Processing** - Automatic text extraction, summarization, categorization, and tagging via Google Gemini
- [x] **Hybrid Search** - Semantic search (Gemini embeddings) + keyword search (BM25) with 70/30 weighting
- [x] **Search Filters** - Filter by category, sort by relevance/date
- [x] **File Preview** - Modal with AI summary, tags, category, and similar documents
- [x] **Similar Documents** - Find related content based on semantic similarity

### Category Management
- [x] **View Categories** - Display all categories with document counts
- [x] **Create Categories** - Create custom categories dynamically
- [x] **Delete Categories** - Remove categories (files move to "Uncategorized")
- [x] **Move Files** - Change file category from Categories page
- [x] **Delete Files** - Remove files from categories
- [x] **Dynamic Sync** - Categories auto-update in Search filters and Dashboard

### Dashboard & Analytics
- [x] **Statistics** - Total files, searches, storage used, categories count
- [x] **Category Breakdown** - Visual breakdown of documents by category
- [x] **Recent Uploads** - List of recently uploaded documents
- [x] **Recent Searches** - Track search queries
- [x] **Real-time Updates** - Stats update automatically

### UI/UX
- [x] **Professional Design** - Modern admin dashboard aesthetic with Tailwind CSS
- [x] **Smooth Animations** - Fade-in, slide-up, scale-in effects throughout
- [x] **Responsive Layout** - Works on desktop, tablet, and mobile devices
- [x] **Icon-Rich Interface** - Heroicons throughout for better visual communication
- [x] **Interactive Elements** - Hover effects, transitions, visual feedback
- [x] **System Status** - Real-time health monitoring with live indicator
- [x] **Loading States** - Spinners and progress indicators for async operations
- [x] **Error Handling** - User-friendly error messages

### Technical Requirements
- [x] **One-Command Startup** - `npm run dev` starts both frontend and backend
- [x] **Environment Configuration** - `.env` file for sensitive credentials
- [x] **MongoDB Atlas** - Cloud database (no local installation required)
- [x] **Google Gemini AI** - Free API for embeddings and summarization
- [x] **RESTful API** - Clean, documented API endpoints
- [x] **Error Handling** - Comprehensive error handling and logging
- [x] **Production Ready** - Security headers, rate limiting, CORS configured
- [x] **Docker Support** - Docker Compose for containerized deployment

---

## 🆘 Troubleshooting

### Issue: "System Offline" indicator shows in top-right corner

**Solution:**
1. Make sure the backend server is running:
   ```bash
   cd backend
   npm run dev
   ```
2. Check that backend is accessible at `http://localhost:5000`
3. Verify the health endpoint:
   ```bash
   curl http://localhost:5000/health
   ```
4. If backend is running but still shows offline, restart both services

---

### Issue: MongoDB connection fails

**Symptoms:**
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster
```

**Solutions:**
1. **Check Connection String**: Verify `MONGODB_URI` in `backend/.env`
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/docssearch?retryWrites=true&w=majority`
   - Replace `username` and `password` with actual credentials
   - Ensure database name is `docssearch`

2. **Whitelist IP Address**:
   - Go to MongoDB Atlas → Network Access
   - Add IP Address: `0.0.0.0/0` (allow from anywhere)
   - Wait 1-2 minutes for changes to propagate

3. **Check Database User**:
   - Go to MongoDB Atlas → Database Access
   - Ensure user has "Read and write to any database" privileges
   - Verify username and password are correct

4. **Use MongoDB Atlas (Recommended)**:
   - Free tier (M0) provides 512MB storage
   - No local MongoDB installation required
   - Automatic backups and monitoring

---

### Issue: Gemini API errors

**Symptoms:**
```
Error: GEMINI_API_KEY is not configured
Background processing failed: API key not valid
```

**Solutions:**
1. **Get API Key**:
   - Visit https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key (starts with `AIza...`)

2. **Add to .env**:
   - Open `backend/.env`
   - Set `GEMINI_API_KEY=your_actual_api_key_here`
   - **Restart backend server** (important!)

3. **Check API Quota**:
   - Free tier: 60 requests/minute
   - If exceeded, wait 1 minute and try again
   - Check quota at https://makersuite.google.com/app/apikey

4. **Verify API Key**:
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
   ```

---

### Issue: Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. **Change Backend Port**:
   - Edit `backend/.env`
   - Set `PORT=5001` (or any available port)
   - Update frontend proxy in `frontend/vite.config.js`:
     ```javascript
     proxy: {
       '/api': {
         target: 'http://localhost:5001',  // Update port
         changeOrigin: true
       }
     }
     ```

2. **Kill Process Using Port**:
   ```bash
   # Windows PowerShell:
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

   # Mac/Linux:
   lsof -ti:5000 | xargs kill -9
   ```

---

### Issue: File upload fails

**Symptoms:**
```
Error: File too large
Error: Unsupported file type
```

**Solutions:**
1. **Check File Size**:
   - Max size: 100MB (default)
   - Change in `backend/.env`: `MAX_FILE_SIZE=209715200` (200MB)

2. **Supported Formats**:
   - Documents: PDF, DOCX, PPTX, TXT
   - Images: JPG, PNG (with OCR)
   - Ensure file extension matches content type

3. **Check Storage Path**:
   - Verify `backend/uploads/` directory exists
   - Check write permissions

---

### Issue: Search returns no results

**Solutions:**
1. **Upload Documents First**:
   ```bash
   cd backend
   npm run seed  # Add 5 sample documents
   ```

2. **Wait for Processing**:
   - Files go through 5 stages: Upload → Extract → Embed → Summarize → Tag
   - Check processing status in Dashboard
   - Processing takes 10-30 seconds per file

3. **Check Gemini API**:
   - Embeddings require valid Gemini API key
   - Verify API key is set in `backend/.env`

4. **Try Different Queries**:
   - Use natural language: "Q4 campaign strategy"
   - Try category filters
   - Check if files have `processingStatus: "complete"`

---

### Issue: Frontend shows blank page

**Solutions:**
1. **Check Console Errors**:
   - Open browser DevTools (F12)
   - Look for errors in Console tab

2. **Verify Backend is Running**:
   - Backend must be running at `http://localhost:5000`
   - Check terminal for backend logs

3. **Clear Browser Cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear cache and reload

4. **Reinstall Dependencies**:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

---

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful embeddings and text generation
- **MongoDB Atlas** - For reliable cloud database hosting
- **React & Vite** - For modern frontend development
- **Tailwind CSS** - For beautiful, utility-first styling

---

## 📧 Support

For issues, questions, or contributions:
- **GitHub Issues**: https://github.com/kumaran1223/Docssearch/issues
- **Repository**: https://github.com/kumaran1223/Docssearch

---

**Built with ❤️ for marketing teams who need intelligent document search**
