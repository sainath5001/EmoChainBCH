#!/bin/bash

# EmoChain Contract Deployment Script for Bitcoin Cash Chipnet
# This script compiles and provides instructions for deploying the contract

set -e

echo "=========================================="
echo "EmoChain Contract Deployment Script"
echo "=========================================="
echo ""

# Check if cashc is installed
if ! command -v cashc &> /dev/null; then
    echo "❌ Error: cashc not found"
    echo "Please install it with: npm install -g cashc"
    exit 1
fi

# Check if contract file exists
CONTRACT_FILE="src/contracts/emotion-reward.cash"
if [ ! -f "$CONTRACT_FILE" ]; then
    echo "❌ Error: Contract file not found: $CONTRACT_FILE"
    exit 1
fi

echo "✅ Found contract file: $CONTRACT_FILE"
echo ""

# Compile contract
echo "📦 Compiling contract..."
ARTIFACT_FILE="src/contracts/emotion-reward-artifact.json"
cashc "$CONTRACT_FILE" --output "$ARTIFACT_FILE"

if [ ! -f "$ARTIFACT_FILE" ]; then
    echo "❌ Error: Contract compilation failed"
    exit 1
fi

echo "✅ Contract compiled successfully!"
echo "   Artifact saved to: $ARTIFACT_FILE"
echo ""

# Extract contract address from artifact (if available)
echo "📋 Contract Information:"
echo ""

# Note: To deploy the contract, you need to:
# 1. Fund the contract address with BCH on Chipnet
# 2. Create a UTXO locked to the contract address

echo "⚠️  IMPORTANT: Contract Deployment Instructions"
echo "=========================================="
echo ""
echo "1. Contract Address:"
echo "   Run this command to get the contract address:"
echo "   node -e \"const artifact = require('./$ARTIFACT_FILE'); console.log('Contract Address:', artifact.address);\""
echo ""
echo "2. Deploy to Chipnet:"
echo "   - Send BCH to the contract address on Chipnet"
echo "   - The amount should cover rewards you want to distribute"
echo "   - Use a Bitcoin Cash wallet (e.g., Paytaca) to send to the contract address"
echo ""
echo "3. Fund Contract:"
echo "   - Minimum: Fund with at least 5000 satoshis (for score 5 reward)"
echo "   - Recommended: Fund with 100,000+ satoshis for multiple rewards"
echo ""
echo "4. Verify Deployment:"
echo "   - Check the contract address on a Chipnet explorer:"
echo "     https://chipnet.imaginary.cash/address/<CONTRACT_ADDRESS>"
echo ""
echo "5. After Deployment:"
echo "   - Users can now claim rewards from the frontend"
echo "   - Each claim will spend from the contract UTXO"
echo ""

echo "✅ Setup complete! Contract is ready for deployment."
echo ""
echo "Next steps:"
echo "  1. Get contract address (see above)"
echo "  2. Fund the contract on Chipnet"
echo "  3. Start the frontend: npm run dev"
echo ""

