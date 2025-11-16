# Netlify Deployment Guide - DocsSearch

## 🚀 Quick Start

Your DocsSearch app is configured for Netlify deployment!

---

## 📋 Current Status

✅ **Netlify Configuration:** `netlify.toml` is ready
✅ **Build Settings:** Configured for frontend deployment
✅ **SPA Routing:** Redirects configured
✅ **Error Handling:** ErrorBoundary added for better UX

---

## 🔧 Netlify Configuration

The `netlify.toml` file is already configured:

```toml
[build]
  base = "frontend"
  command = "npm install && npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🎯 Deployment Steps

### Step 1: Deploy Frontend on Netlify

1. **Go to Netlify Dashboard:** https://app.netlify.com
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to GitHub** and select `kumaran1223/Docssearch`
4. **Build settings** (should auto-detect from netlify.toml):
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/dist`
5. **Click "Deploy site"**

### Step 2: Deploy Backend on Railway

1. **Go to Railway:** https://railway.app
2. **Click "New Project" → "Deploy from GitHub repo"**
3. **Select** `kumaran1223/Docssearch`
4. **Add environment variables:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docssearch
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_secret_key_min_32_chars
   NODE_ENV=production
   PORT=5000
   ```
5. **Deploy!**
6. **Copy the Railway URL** (e.g., `https://docssearch-production.up.railway.app`)

### Step 3: Connect Frontend to Backend

1. **Go to Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**
2. **Add variable:**
   ```
   Key: VITE_API_URL
   Value: https://your-backend-url.railway.app/api
   ```
3. **Save**
4. **Trigger redeploy:**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## ✅ Verification Checklist

### Frontend (Netlify)
- [ ] Visit your Netlify URL (e.g., `https://docssearch.netlify.app`)
- [ ] Homepage loads without blank page
- [ ] Can navigate to different pages (Dashboard, Search, Categories)
- [ ] No console errors in browser DevTools (F12)

### Backend (Railway)
- [ ] Visit `https://your-backend-url.railway.app/api/health`
- [ ] Should return: `{"status": "ok", "database": "connected"}`

### Integration
- [ ] Frontend shows "System Online" (green indicator in top right)
- [ ] Can upload documents
- [ ] Can search documents
- [ ] Can create and manage categories

---

## 🐛 Troubleshooting

### Issue: Blank page on Netlify

**Check browser console (F12 → Console tab):**

1. **If you see "Failed to fetch" or network errors:**
   - ✅ This is normal if backend isn't deployed yet
   - The page should still show the UI with "System Offline" indicator
   - If completely blank, check next steps

2. **If you see "Uncaught SyntaxError" or asset loading errors:**
   - Clear Netlify build cache and redeploy
   - Check build logs for errors

3. **If you see React errors:**
   - Check the error message in console
   - Share it for specific help

**Solution:**
1. Go to Netlify Dashboard → Deploys
2. Click "Trigger deploy" → "Clear cache and deploy site"
3. Wait for deployment to complete
4. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

### Issue: "System Offline" indicator

**This is NORMAL if backend isn't deployed yet!**

**Solution:**
1. Deploy backend on Railway (see Step 2 above)
2. Add `VITE_API_URL` environment variable in Netlify (see Step 3 above)
3. Redeploy frontend

### Issue: CORS errors

**Solution:**
1. Add frontend URL to backend environment variables:
   ```
   FRONTEND_URL=https://your-site.netlify.app
   ```
2. Or set `FRONTEND_URL=*` (development only)
3. Redeploy backend on Railway

### Issue: Build fails on Netlify

**Check build logs:**
1. Netlify Dashboard → Deploys → Click on failed deployment
2. Look for error messages

**Common fixes:**
- Ensure `frontend/package.json` has all dependencies
- Check Node.js version (should be 18.x or higher)
- Clear cache and redeploy

---

## 📊 Environment Variables

### Netlify (Frontend)
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

### Railway (Backend)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docssearch
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key_min_32_chars
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-site.netlify.app
```

---

## 🎯 Summary

1. ✅ **Netlify** hosts the frontend (React app)
2. ✅ **Railway** hosts the backend (Node.js API)
3. ✅ **MongoDB Atlas** hosts the database
4. ✅ **Google Gemini** provides AI capabilities

**All components work together via environment variables!**

---

## 📞 Quick Commands

### Test build locally:
```bash
cd frontend
npm install
npm run build
```

### Preview build locally:
```bash
cd frontend
npm run preview
```

### Check if dist folder was created:
```bash
ls frontend/dist
```

Should show:
- `index.html`
- `assets/` folder with CSS and JS files

---

## 🚀 Next Steps After Deployment

1. **Test all features** on the live site
2. **Set up custom domain** (optional) in Netlify settings
3. **Enable HTTPS** (automatic on Netlify)
4. **Monitor logs** in Netlify and Railway dashboards
5. **Set up MongoDB Atlas IP whitelist** to allow Railway connections

---

**Your app is ready for Netlify! 🎉**

