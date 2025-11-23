#!/bin/bash

# Final attempt to download models using multiple methods
# This script tries different approaches until one works

echo "=== Downloading face-api.js Models ==="
echo ""

MODELS_DIR="public/models"
mkdir -p "$MODELS_DIR"
cd "$MODELS_DIR"

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

download_file() {
    local file=$1
    local url=""
    
    echo -n "Downloading $file... "
    
    # Try multiple URL formats
    for base_url in \
        "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/${file}" \
        "https://github.com/justadudewhohacks/face-api.js-models/raw/master/${file}" \
        "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js-models@master/${file}"
    do
        if command -v wget &> /dev/null; then
            if wget -q "$base_url" -O "$file" 2>/dev/null; then
                SIZE=$(stat -c%s "$file" 2>/dev/null || echo "0")
                if [ "$SIZE" -gt 1000 ]; then
                    echo "✓ ($SIZE bytes)"
                    return 0
                fi
            fi
        elif command -v curl &> /dev/null; then
            if curl -sL "$base_url" -o "$file" 2>/dev/null; then
                SIZE=$(stat -c%s "$file" 2>/dev/null || echo "0")
                if [ "$SIZE" -gt 1000 ]; then
                    echo "✓ ($SIZE bytes)"
                    return 0
                fi
            fi
        fi
    done
    
    echo "✗ Failed"
    return 1
}

SUCCESS=0
for model in "${MODELS[@]}"; do
    if download_file "$model"; then
        SUCCESS=$((SUCCESS + 1))
    fi
done

cd - > /dev/null

echo ""
echo "Downloaded: $SUCCESS/8 files"

if [ "$SUCCESS" -eq 8 ]; then
    echo "✅ All models downloaded successfully!"
    echo "Restart dev server: npm run dev"
else
    echo "⚠️  Some downloads failed. Please use browser download method."
    echo "See: BROWSER_DOWNLOAD_STEPS.md"
fi

