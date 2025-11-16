# DocsSearch Deployment Guide

## 🚨 Fix for Current Deployment Error

The error `sh: line 1: vite: command not found` and `Command 'npm run build' exited with 127` occurs because the deployment platform is trying to run the build command from the wrong directory.

### Quick Fix

The root `package.json` has been updated with the correct build command:

```json
"build": "cd frontend && npm install && npm run build"
```

This ensures that:
1. The build command changes to the frontend directory
2. Installs frontend dependencies
3. Runs the Vite build

---

## 🚀 Deployment Options

### Option 1: Railway (Recommended for Full-Stack)

**Configuration File:** `railway.json` (already created)

**Steps:**
1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `Docssearch` repository
4. Railway will auto-detect the configuration from `railway.json`

**Environment Variables to Set:**
```
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_random_secret_key
NODE_ENV=production
PORT=5000
```

**Build Command:** `npm install && cd frontend && npm install && npm run build`
**Start Command:** `cd backend && npm start`

---

### Option 2: Render (Free Tier Available)

**Configuration File:** `render.yaml` (already created)

**Steps:**
1. Go to [Render.com](https://render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create 2 services:
   - Backend API (Node.js)
   - Frontend Static Site

**Environment Variables (Backend Service):**
```
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_random_secret_key
NODE_ENV=production
PORT=5000
```

**Environment Variables (Frontend Service):**
```
VITE_API_URL=https://your-backend-url.onrender.com
```

---

### Option 3: Vercel (Best for Frontend)

**Configuration File:** `vercel.json` (already created)

**Steps:**
1. Go to [Vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will auto-detect the configuration

**Note:** Vercel is primarily for frontend. You'll need to deploy the backend separately (Railway, Render, or Heroku).

**Environment Variables:**
```
VITE_API_URL=https://your-backend-url.com
```

---

### Option 4: Netlify (Frontend Only)

**Configuration File:** `netlify.toml` (already created)

**Steps:**
1. Go to [Netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select your GitHub repository
4. Build settings will be auto-detected from `netlify.toml`

**Build Command:** `npm install && npm run build`
**Publish Directory:** `dist`
**Base Directory:** `frontend`

**Environment Variables:**
```
VITE_API_URL=https://your-backend-url.com
```

---

## 🔧 Manual Deployment Configuration

If your platform doesn't support config files, use these settings:

### Root Directory Build
**Build Command:**
```bash
npm install && cd frontend && npm install && npm run build
```

**Start Command:**
```bash
cd backend && npm install && npm start
```

### Frontend Only Build
**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Output Directory:** `frontend/dist`

### Backend Only Build
**Build Command:**
```bash
cd backend && npm install
```

**Start Command:**
```bash
cd backend && npm start
```

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas database created and connection string obtained
- [ ] Google Gemini API key obtained
- [ ] Environment variables configured on deployment platform
- [ ] `.gitignore` includes `.env` files (already configured)
- [ ] Build scripts tested locally
- [ ] Health check endpoint working (`/api/health`)

---

## 🧪 Test Build Locally

Before deploying, test the build process locally:

```bash
# Test frontend build
cd frontend
npm install
npm run build
# Should create frontend/dist directory

# Test backend
cd ../backend
npm install
npm start
# Should start server on port 5000
```

---

## 🌐 Environment Variables Reference

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docssearch

# AI Service
GEMINI_API_KEY=your_gemini_api_key_here

# Authentication
JWT_SECRET=your_random_secret_key_minimum_32_characters

# Server
NODE_ENV=production
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
```

---

## 🐛 Common Deployment Issues

### Issue 1: "vite: command not found"
**Solution:** Build command must include `cd frontend && npm install` before `npm run build`

### Issue 2: "Cannot find module 'express'"
**Solution:** Build command must include `cd backend && npm install`

### Issue 3: "CORS Error"
**Solution:** Update `backend/server.js` CORS configuration to include your frontend URL

### Issue 4: "MongoDB connection failed"
**Solution:** Check `MONGODB_URI` environment variable is set correctly

### Issue 5: "Gemini API Error"
**Solution:** Verify `GEMINI_API_KEY` is set and valid

---

## ✅ Post-Deployment Verification

After deployment, verify:

1. **Health Check:** `https://your-backend-url.com/api/health`
   - Should return: `{"status": "ok", "database": "connected"}`

2. **Frontend Loads:** `https://your-frontend-url.com`
   - Should show the DocsSearch homepage

3. **API Connection:** Check browser console for errors
   - Should show "System Online" in top right

4. **Upload Test:** Try uploading a document
   - Should process and appear in files list

5. **Search Test:** Try searching for content
   - Should return relevant results

---

## 📞 Support

If you encounter issues:
1. Check deployment logs for specific error messages
2. Verify all environment variables are set
3. Test the build locally first
4. Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)


