# Vercel Redeploy Guide - Update to Latest Changes

## 🔄 How to Update Your Vercel Deployment

Your Vercel deployment is showing the old project because it needs to be redeployed with the latest changes from GitHub.

---

## ✅ **What's Been Updated**

The following changes have been pushed to GitHub and need to be deployed:

1. ✅ **Category Creation Bug Fix** - Categories now persist and appear immediately
2. ✅ **Category Model** - New standalone model for dynamic categories
3. ✅ **Improved CORS** - Better production CORS configuration
4. ✅ **Deployment Configs** - Platform-specific deployment files
5. ✅ **Build Scripts** - Fixed build commands for all platforms

**Latest Commit:** `0ff04df` - "fix: Add deployment configurations for multiple platforms"

---

## 🚀 **Method 1: Automatic Redeploy (Recommended)**

Vercel automatically redeploys when you push to GitHub. Since the changes are already pushed, you just need to trigger a redeploy:

### **Option A: Trigger from Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **DocsSearch** project
3. Go to the **"Deployments"** tab
4. Click the **"Redeploy"** button on the latest deployment
5. Select **"Use existing Build Cache"** → **NO** (uncheck it)
6. Click **"Redeploy"**

### **Option B: Trigger from GitHub**

1. Make a small change (e.g., add a space to README.md)
2. Commit and push:
   ```bash
   git add .
   git commit -m "trigger redeploy"
   git push origin main
   ```
3. Vercel will automatically detect the push and redeploy

### **Option C: Use Vercel CLI**

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to your project
cd c:\Users\kumar\DocsSearch

# Deploy to production
vercel --prod
```

---

## 🚀 **Method 2: Fresh Deployment**

If automatic redeploy doesn't work, create a fresh deployment:

### **Step 1: Remove Old Deployment (Optional)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **DocsSearch** project
3. Go to **Settings** → **General**
4. Scroll to **"Delete Project"**
5. Delete the old project

### **Step 2: Create New Deployment**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select **`kumaran1223/Docssearch`** from GitHub
5. Configure the project:

**Framework Preset:** `Vite`

**Root Directory:** `./` (leave as root)

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Output Directory:**
```
frontend/dist
```

**Install Command:**
```bash
npm install && cd backend && npm install && cd ../frontend && npm install
```

### **Step 3: Add Environment Variables**

Click **"Environment Variables"** and add:

```
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_random_secret_key_min_32_chars
NODE_ENV=production
FRONTEND_URL=*
```

### **Step 4: Deploy**

1. Click **"Deploy"**
2. Wait for the build to complete (2-5 minutes)
3. Vercel will provide a URL like: `https://docssearch-xyz.vercel.app`

---

## 🔧 **Vercel Configuration Files**

The following files have been added to optimize Vercel deployment:

### **`vercel.json`** (Updated)
```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install && cd backend && npm install && cd ../frontend && npm install",
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "backend/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### **`.vercelignore`** (New)
Excludes unnecessary files from deployment to speed up builds.

### **`frontend/package.json`** (Updated)
Added `vercel-build` script for Vercel-specific builds.

---

## ⚠️ **Important Notes**

### **Vercel Limitations for Full-Stack Apps**

Vercel is primarily designed for **frontend** deployments. For full-stack apps with backend:

1. **Backend as Serverless Functions**: Vercel can run the backend as serverless functions, but:
   - Cold starts may cause delays
   - Limited execution time (10s on free tier, 60s on pro)
   - Not ideal for long-running processes like document processing

2. **Recommended Approach**: Deploy frontend and backend separately:
   - **Frontend on Vercel**: Fast, optimized for static sites
   - **Backend on Railway/Render**: Better for Node.js servers with MongoDB

### **Alternative: Split Deployment**

**Frontend on Vercel:**
```bash
# Deploy only frontend
cd frontend
vercel --prod
```

**Backend on Railway/Render:**
- Use Railway or Render for the backend (see DEPLOYMENT_GUIDE.md)
- Update frontend environment variable:
  ```
  VITE_API_URL=https://your-backend-url.onrender.com
  ```

---

## 🧪 **Verify Deployment**

After redeployment, verify:

1. **Frontend Loads**: Visit your Vercel URL
   - Should show the DocsSearch homepage
   - Check for "System Online" in top right

2. **Categories Work**: Go to Categories page
   - Click "Create Category"
   - Enter a name and create
   - Should appear immediately in the list

3. **Search Works**: Try searching for documents
   - Should return results

4. **Check Console**: Open browser DevTools
   - Should have no errors
   - API calls should succeed

---

## 🐛 **Troubleshooting**

### **Issue: Still showing old version**

**Solution:**
1. Clear Vercel build cache:
   - Dashboard → Deployments → Redeploy → Uncheck "Use existing Build Cache"
2. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Clear browser cache

### **Issue: Build fails with "vite: command not found"**

**Solution:**
- Ensure build command includes: `cd frontend && npm install && npm run build`
- Check that `vercel.json` is in the repository root

### **Issue: API calls fail (CORS errors)**

**Solution:**
1. Add your Vercel frontend URL to backend CORS:
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   ```
2. Or set `FRONTEND_URL=*` to allow all origins (development only)

### **Issue: Environment variables not working**

**Solution:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure all variables are set for **Production** environment
3. Redeploy after adding variables

---

## 📞 **Quick Commands**

```bash
# Check current deployment status
vercel ls

# View deployment logs
vercel logs

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Remove deployment
vercel remove docssearch
```

---

## ✅ **Summary**

1. **Latest changes are already on GitHub** ✅
2. **Vercel config files are ready** ✅
3. **Just trigger a redeploy** from Vercel Dashboard
4. **Or use Vercel CLI**: `vercel --prod`
5. **Verify the deployment** works correctly

The easiest way is to go to your Vercel Dashboard, find the DocsSearch project, and click **"Redeploy"** with build cache disabled. This will pull the latest code from GitHub and deploy it! 🚀

