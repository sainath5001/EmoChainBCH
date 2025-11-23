#!/bin/bash

# Manual download script with multiple fallback methods
# Downloads face-api.js models

echo "Downloading face-api.js models..."
echo ""

MODELS_DIR="public/models"
mkdir -p $MODELS_DIR

# Try different CDN sources
download_with_fallback() {
    local file=$1
    local success=0
    
    echo -n "Downloading $file... "
    
    # Try method 1: unpkg CDN
    curl -L "https://unpkg.com/face-api.js@0.22.2/weights/${file}" -o "${MODELS_DIR}/${file}" --fail --silent --show-error 2>/dev/null
    if [ $? -eq 0 ] && [ -f "${MODELS_DIR}/${file}" ]; then
        SIZE=$(stat -f%z "${MODELS_DIR}/${file}" 2>/dev/null || stat -c%s "${MODELS_DIR}/${file}" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 1000 ]; then
            echo "✓ ($(numfmt --to=iec-i --suffix=B $SIZE 2>/dev/null || echo "${SIZE} bytes"))"
            success=1
        fi
    fi
    
    # If failed, try method 2: GitHub raw (with different path)
    if [ $success -eq 0 ]; then
        curl -L "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/${file}" -o "${MODELS_DIR}/${file}" --fail --silent --show-error 2>/dev/null
        if [ $? -eq 0 ] && [ -f "${MODELS_DIR}/${file}" ]; then
            SIZE=$(stat -f%z "${MODELS_DIR}/${file}" 2>/dev/null || stat -c%s "${MODELS_DIR}/${file}" 2>/dev/null || echo "0")
            if [ "$SIZE" -gt 1000 ]; then
                echo "✓ ($(numfmt --to=iec-i --suffix=B $SIZE 2>/dev/null || echo "${SIZE} bytes"))"
                success=1
            fi
        fi
    fi
    
    if [ $success -eq 0 ]; then
        echo "✗ Failed - will need manual download"
        return 1
    fi
    return 0
}

# Download all models
download_with_fallback "tiny_face_detector_model-weights_manifest.json"
download_with_fallback "tiny_face_detector_model-shard1"
download_with_fallback "face_landmark_68_model-weights_manifest.json"
download_with_fallback "face_landmark_68_model-shard1"
download_with_fallback "face_recognition_model-weights_manifest.json"
download_with_fallback "face_recognition_model-shard1"
download_with_fallback "face_expression_model-weights_manifest.json"
download_with_fallback "face_expression_model-shard1"

echo ""
echo "Checking downloaded files..."
DOWNLOADED=0
for file in ${MODELS_DIR}/*.json ${MODELS_DIR}/*shard*; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 1000 ]; then
            DOWNLOADED=$((DOWNLOADED + 1))
        fi
    fi
done

echo "Found $DOWNLOADED valid model files (need 8)"

if [ "$DOWNLOADED" -ge 8 ]; then
    echo ""
    echo "✅ All models downloaded successfully!"
    echo "Restart dev server: npm run dev"
else
    echo ""
    echo "⚠ Some models failed to download automatically."
    echo "Please download manually from:"
    echo "https://github.com/justadudewhohacks/face-api.js-models"
    echo ""
    echo "Or use the browser-based download method (see MANUAL_DOWNLOAD.md)"
fi
