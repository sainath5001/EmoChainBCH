#!/bin/bash
echo "=== Model Files Check ==="
echo ""
VALID=0
TOTAL=0
for f in public/models/*.json public/models/*shard*; do
    if [ -f "$f" ]; then
        TOTAL=$((TOTAL + 1))
        SIZE=$(stat -c%s "$f" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 1000 ]; then
            VALID=$((VALID + 1))
            echo "✅ $(basename $f): ${SIZE} bytes"
        else
            echo "❌ $(basename $f): $SIZE bytes (PLACEHOLDER)"
        fi
    fi
done
echo ""
echo "Status: $VALID/$TOTAL valid model files"
if [ "$VALID" -lt 8 ]; then
    echo "⚠️  Need to download real model files!"
    echo "See: BROWSER_DOWNLOAD_STEPS.md"
fi
