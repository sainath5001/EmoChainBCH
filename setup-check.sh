#!/bin/bash

echo "=== EmoChain Setup Check ==="
echo ""

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✅ Node.js $(node --version) installed"
else
    echo "   ❌ Node.js not found. Install from https://nodejs.org"
fi

# Check npm
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    echo "   ✅ npm $(npm --version) installed"
else
    echo "   ❌ npm not found"
fi

# Check dependencies
echo "3. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
else
    echo "   ❌ node_modules not found. Run: npm install"
fi

# Check models
echo "4. Checking AI models..."
MODEL_COUNT=$(ls -1 public/models/*.json public/models/*shard* 2>/dev/null | wc -l)
if [ "$MODEL_COUNT" -ge 8 ]; then
    echo "   ✅ Found $MODEL_COUNT model files"
else
    echo "   ❌ Only $MODEL_COUNT model files found (need 8)"
    echo "      Run: ./scripts/download-models.sh"
fi

# Check contracts
echo "5. Checking contracts..."
if [ -f "src/contracts/emotion-reward-working.cash" ]; then
    echo "   ✅ Contract files exist"
else
    echo "   ❌ Contract files missing"
fi

echo ""
echo "=== Setup Status ==="
if [ -d "node_modules" ] && [ "$MODEL_COUNT" -ge 8 ]; then
    echo "✅ Ready to run! Execute: npm run dev"
else
    echo "❌ Setup incomplete. Follow GETTING_STARTED.md"
fi
