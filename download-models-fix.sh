#!/bin/bash

# Fixed model download script for EmoChain
# Downloads face-api.js models to public/models/

echo "Downloading face-api.js models..."
echo ""

MODELS_DIR="public/models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master"

# Create models directory if it doesn't exist
mkdir -p $MODELS_DIR

# List of required model files
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

# Download each model file
for model in "${MODELS[@]}"; do
    echo "Downloading $model..."
    curl -L "${BASE_URL}/${model}" -o "${MODELS_DIR}/${model}" --fail --silent --show-error
    
    if [ $? -eq 0 ]; then
        # Check file size (should be more than 100 bytes for real files)
        SIZE=$(stat -f%z "${MODELS_DIR}/${model}" 2>/dev/null || stat -c%s "${MODELS_DIR}/${model}" 2>/dev/null)
        if [ "$SIZE" -gt 100 ]; then
            echo "✓ Downloaded $model ($SIZE bytes)"
        else
            echo "⚠ Warning: $model seems too small ($SIZE bytes). May need manual download."
        fi
    else
        echo "✗ Failed to download $model"
        echo "  Try manual download from: ${BASE_URL}/${model}"
    fi
done

echo ""
echo "Verifying downloads..."
DOWNLOADED=$(ls -1 ${MODELS_DIR}/*.json ${MODELS_DIR}/*shard* 2>/dev/null | wc -l)
echo "Found $DOWNLOADED model files"

if [ "$DOWNLOADED" -ge 8 ]; then
    echo "✅ Model download complete!"
    echo "Models are located in: $MODELS_DIR"
    echo ""
    echo "Next step: Restart your dev server (npm run dev)"
else
    echo "⚠ Some models may be missing. Please check manually."
fi





