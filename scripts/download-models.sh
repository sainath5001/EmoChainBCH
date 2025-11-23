#!/bin/bash

# Script to download face-api.js models
# Run this script to automatically download required model files

echo "Downloading face-api.js models..."

MODELS_DIR="public/models"
MODELS_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master"

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
    curl -L "$MODELS_URL/$model" -o "$MODELS_DIR/$model"
    if [ $? -eq 0 ]; then
        echo "✓ Downloaded $model"
    else
        echo "✗ Failed to download $model"
    fi
done

echo ""
echo "Model download complete!"
echo "Models are located in: $MODELS_DIR"






