# ⚡ SIMPLE SOLUTION - Download Models

CDN isn't working, so you need to download models manually. It's quick!

## Quick Steps (5 minutes)

1. **Open**: https://github.com/justadudewhohacks/face-api.js-models/tree/master

2. **For each file** (8 files):
   - Click filename
   - Click "Raw" button  
   - Right-click → Save As
   - Save to: `/home/hp/EmoChain/public/models/`

3. **Files**:
   - tiny_face_detector_model-weights_manifest.json
   - tiny_face_detector_model-shard1
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1
   - face_recognition_model-weights_manifest.json
   - face_recognition_model-shard1
   - face_expression_model-weights_manifest.json
   - face_expression_model-shard1

4. **Verify**: `./check-models.sh` (should show ✅)

5. **Restart**: `npm run dev`

That's it! Models will load and everything works.
