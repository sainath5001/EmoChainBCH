# Download Models via Browser - Step by Step

Since automatic downloads aren't working, use your browser. This takes 5 minutes.

## Step 1: Open GitHub

Go to: **https://github.com/justadudewhohacks/face-api.js-models/tree/master**

## Step 2: Download Each File

For **each file** below, do this:

1. **Click the filename** (blue link)
2. **Click "Raw" button** (top right, next to "Blame")
3. **Right-click** on the page → **"Save As"** (or Ctrl+S)
4. **Save location**: `/home/hp/EmoChain/public/models/`
5. **Keep exact filename** (don't change it)

## Files to Download (8 total):

1. `tiny_face_detector_model-weights_manifest.json`
2. `tiny_face_detector_model-shard1` ⚠️ (This one is ~200KB)
3. `face_landmark_68_model-weights_manifest.json`
4. `face_landmark_68_model-shard1` ⚠️ (This one is ~1.5MB)
5. `face_recognition_model-weights_manifest.json`
6. `face_recognition_model-shard1` ⚠️ (This one is ~5MB - largest)
7. `face_expression_model-weights_manifest.json`
8. `face_expression_model-shard1` ⚠️ (This one is ~300KB)

## Step 3: Verify

After downloading all 8 files:

```bash
cd /home/hp/EmoChain
./check-models.sh
```

Should show ✅ for all files with KB/MB sizes.

## Step 4: Restart

```bash
npm run dev
```

Then refresh browser - models should load!

---

## Tips

- **Large files**: The shard files are big (especially face_recognition_model-shard1 at ~5MB)
- **Be patient**: Downloads may take a minute for large files
- **Check sizes**: Files should be KB/MB, not 14 bytes
- **Exact names**: Keep the exact filenames

This is the most reliable method!

