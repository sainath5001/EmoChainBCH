#!/bin/bash

# Git-based download (most reliable method)
# Clones the models repo and copies files

echo "Downloading face-api.js models using git..."
echo ""

MODELS_DIR="public/models"
TEMP_DIR="/tmp/face-api-models-$$"

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ git not found. Please install git or use manual download."
    echo "See MANUAL_DOWNLOAD.md for browser-based download instructions."
    exit 1
fi

# Clone the models repository
echo "Cloning face-api.js-models repository..."
if git clone --depth 1 https://github.com/justadudewhohacks/face-api.js-models.git "$TEMP_DIR" 2>&1; then
    echo "✓ Repository cloned successfully"
else
    echo "❌ Failed to clone repository"
    echo "Please use manual download method (see MANUAL_DOWNLOAD.md)"
    exit 1
fi

# Verify clone was successful
if [ ! -d "$TEMP_DIR" ] || [ ! -f "$TEMP_DIR/tiny_face_detector_model-weights_manifest.json" ]; then
    echo "❌ Repository cloned but files not found"
    echo "Please use manual download method (see MANUAL_DOWNLOAD.md)"
    rm -rf "$TEMP_DIR" 2>/dev/null
    exit 1
fi

# Create models directory
mkdir -p "$MODELS_DIR"

# Copy model files
echo "Copying model files..."
cp "$TEMP_DIR"/tiny_face_detector_model-weights_manifest.json "$MODELS_DIR/" 2>/dev/null && echo "✓ tiny_face_detector_model-weights_manifest.json"
cp "$TEMP_DIR"/tiny_face_detector_model-shard1 "$MODELS_DIR/" 2>/dev/null && echo "✓ tiny_face_detector_model-shard1"
cp "$TEMP_DIR"/face_landmark_68_model-weights_manifest.json "$MODELS_DIR/" 2>/dev/null && echo "✓ face_landmark_68_model-weights_manifest.json"
cp "$TEMP_DIR"/face_landmark_68_model-shard1 "$MODELS_DIR/" 2>/dev/null && echo "✓ face_landmark_68_model-shard1"
cp "$TEMP_DIR"/face_recognition_model-weights_manifest.json "$MODELS_DIR/" 2>/dev/null && echo "✓ face_recognition_model-weights_manifest.json"
cp "$TEMP_DIR"/face_recognition_model-shard1 "$MODELS_DIR/" 2>/dev/null && echo "✓ face_recognition_model-shard1"
cp "$TEMP_DIR"/face_expression_model-weights_manifest.json "$MODELS_DIR/" 2>/dev/null && echo "✓ face_expression_model-weights_manifest.json"
cp "$TEMP_DIR"/face_expression_model-shard1 "$MODELS_DIR/" 2>/dev/null && echo "✓ face_expression_model-shard1"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "Verifying downloads..."
VALID=0
for file in "$MODELS_DIR"/*.json "$MODELS_DIR"/*shard*; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 1000 ]; then
            VALID=$((VALID + 1))
            echo "  ✓ $(basename "$file") - $(numfmt --to=iec-i --suffix=B $SIZE 2>/dev/null || echo "${SIZE} bytes")"
        fi
    fi
done

echo ""
if [ "$VALID" -ge 8 ]; then
    echo "✅ All $VALID models downloaded successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Restart dev server: npm run dev"
    echo "2. Refresh browser"
else
    echo "⚠ Only $VALID/8 models downloaded. Some may be missing."
    echo "Check MANUAL_DOWNLOAD.md for alternative methods."
fi
