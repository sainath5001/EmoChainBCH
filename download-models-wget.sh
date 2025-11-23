#!/bin/bash

# Wget-based download script (often more reliable than curl for GitHub)
# Downloads face-api.js models

echo "Downloading face-api.js models using wget..."
echo ""

MODELS_DIR="public/models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master"

mkdir -p $MODELS_DIR
cd $MODELS_DIR

# Check if wget is available
if ! command -v wget &> /dev/null; then
    echo "wget not found. Installing or using alternative method..."
    echo "Please use manual download method (see MANUAL_DOWNLOAD.md)"
    exit 1
fi

# Download each model file
MODELS=(
    "tiny_face_detector_model-weights_manifest.json"
    "tiny_face_detector_model-shard1"
    "face_landmark_68_model-weights_manifest.json"
    "face_landmark_68_model-shard1"
    "face_recognition_model-weights_manifest.json"
    "face_recognition_model-shard1"
    "face_expression_model-weights_manifest.json"
    "face_expression_model-shard1"
)

for model in "${MODELS[@]}"; do
    echo -n "Downloading $model... "
    wget -q "${BASE_URL}/${model}" -O "${model}" 2>&1
    
    if [ $? -eq 0 ] && [ -f "${model}" ]; then
        SIZE=$(stat -f%z "${model}" 2>/dev/null || stat -c%s "${model}" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 1000 ]; then
            echo "✓ ($(numfmt --to=iec-i --suffix=B $SIZE 2>/dev/null || echo "${SIZE} bytes"))"
        else
            echo "⚠ (only $SIZE bytes - may be incomplete)"
        fi
    else
        echo "✗ Failed"
    fi
done

cd - > /dev/null

echo ""
echo "Verifying downloads..."
VALID=0
for file in ${MODELS_DIR}/*.json ${MODELS_DIR}/*shard*; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 1000 ]; then
            VALID=$((VALID + 1))
        fi
    fi
done

echo "Found $VALID valid model files (need 8)"

if [ "$VALID" -ge 8 ]; then
    echo ""
    echo "✅ All models downloaded successfully!"
    echo "Restart dev server: npm run dev"
else
    echo ""
    echo "⚠ Some models failed. Try manual download (see MANUAL_DOWNLOAD.md)"
fi





