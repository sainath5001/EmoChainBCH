# 📥 Step-by-Step Model Download Guide

Since automated downloads aren't working due to network issues, here's the **exact steps** to download models manually.

## ⚡ Quick Method (5-10 minutes)

### Step 1: Open GitHub Repository
1. Open your browser
2. Go to: **https://github.com/justadudewhohacks/face-api.js-models**
3. Click on the **"master"** branch (or main branch)
4. You should see a list of files

### Step 2: Download Each File

For **EACH** of these 8 files, follow these exact steps:

#### File 1: `tiny_face_detector_model-weights_manifest.json`
1. Click on the filename
2. You'll see the file content
3. Click the **"Raw"** button (top right, next to "Blame")
4. The raw file will open in browser
5. **Right-click** anywhere on the page
6. Select **"Save As"** (or press Ctrl+S / Cmd+S)
7. Navigate to: `/home/hp/EmoChain/public/models/`
8. Click **Save**
9. **Important**: Make sure filename is exactly: `tiny_face_detector_model-weights_manifest.json`

#### File 2: `tiny_face_detector_model-shard1`
- Repeat steps above
- This file is ~200KB (will take a few seconds to download)

#### File 3: `face_landmark_68_model-weights_manifest.json`
- Repeat steps above

#### File 4: `face_landmark_68_model-shard1`
- Repeat steps above
- This file is ~1.5MB (will take longer)

#### File 5: `face_recognition_model-weights_manifest.json`
- Repeat steps above

#### File 6: `face_recognition_model-shard1`
- Repeat steps above
- **This is the largest file (~5MB)** - be patient!

#### File 7: `face_expression_model-weights_manifest.json`
- Repeat steps above

#### File 8: `face_expression_model-shard1`
- Repeat steps above
- This file is ~300KB

### Step 3: Verify Downloads

Open terminal and run:
```bash
cd /home/hp/EmoChain
./check-models.sh
```

**Expected output**: All 8 files should show ✅ with KB/MB sizes

**If any file shows ❌ or 14 bytes**: That file didn't download correctly. Re-download it.

### Step 4: Restart Server

```bash
# Stop current server (Ctrl+C in terminal)
npm run dev
```

### Step 5: Refresh Browser

Refresh your browser page. Models should load automatically!

---

## 🎯 Quick Checklist

- [ ] Opened GitHub repository
- [ ] Downloaded all 8 files
- [ ] Saved all files to `public/models/`
- [ ] Verified with `./check-models.sh` (all ✅)
- [ ] Restarted dev server
- [ ] Refreshed browser
- [ ] Models loaded successfully!

---

## 💡 Tips

- **Large files**: The shard files (especially `face_recognition_model-shard1`) are large. Be patient.
- **File names**: Keep exact filenames - don't rename them
- **Save location**: Make sure you're saving to `/home/hp/EmoChain/public/models/`
- **Check sizes**: After download, files should be KB/MB, not 14 bytes

---

## ✅ After Download

Once all files are downloaded and verified:
- ✅ Hydration error: Fixed
- ✅ Camera: Fixed
- ✅ Wallet: Improved
- ✅ Models: Will load from local files
- ✅ Everything will work!

This is the **only reliable method** when automated downloads fail. Take your time, it's worth it! 🎉

