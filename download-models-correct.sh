#!/bin/bash

# Correct model download script
# Downloads face-api.js models from the correct GitHub location

echo "Downloading face-api.js models..."
echo ""

MODELS_DIR="public/models"
mkdir -p $MODELS_DIR

# Use jsdelivr CDN which serves GitHub files correctly
BASE_URL="https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js-models@master"

echo "Downloading from: $BASE_URL"
echo ""

# Download each model file
download_file() {
    local file=$1
    echo -n "Downloading $file... "
    curl -L "${BASE_URL}/${file}" -o "${MODELS_DIR}/${file}" --fail --silent --show-error --progress-bar
    
    if [ $? -eq 0 ]; then
        SIZE=$(stat -f%z "${MODELS_DIR}/${file}" 2>/dev/null || stat -c%s "${MODELS_DIR}/${file}" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 1000 ]; then
            echo "✓ ($(numfmt --to=iec-i --suffix=B $SIZE 2>/dev/null || echo "${SIZE} bytes"))"
        else
            echo "⚠ (only $SIZE bytes - may be incomplete)"
        fi
    else
        echo "✗ Failed"
        return 1
    fi
}

# Download all models
download_file "tiny_face_detector_model-weights_manifest.json"
download_file "tiny_face_detector_model-shard1"
download_file "face_landmark_68_model-weights_manifest.json"
download_file "face_landmark_68_model-shard1"
download_file "face_recognition_model-weights_manifest.json"
download_file "face_recognition_model-shard1"
download_file "face_expression_model-weights_manifest.json"
download_file "face_expression_model-shard1"

echo ""
echo "Verifying downloads..."
DOWNLOADED=$(ls -1 ${MODELS_DIR}/*.json ${MODELS_DIR}/*shard* 2>/dev/null | wc -l)
echo "Found $DOWNLOADED model files"

if [ "$DOWNLOADED" -ge 8 ]; then
    echo ""
    echo "✅ Model download complete!"
    echo "Models are in: $MODELS_DIR"
    echo ""
    echo "Next: Restart dev server (npm run dev)"
else
    echo ""
    echo "⚠ Some models may be missing. Check manually."
fi
