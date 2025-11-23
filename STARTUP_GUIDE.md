# EmoChain Startup Guide

Complete guide to getting EmoChain up and running from scratch.

## Prerequisites

1. **Node.js 18+** (but not Node.js 22+ for cashc compatibility - see issue below)
2. **npm** or **yarn**
3. **Paytaca Wallet** browser extension
4. **Git** (for cloning)

## ⚠️ Known Issue: Node.js Version Compatibility

If you're using Node.js 22+, you may encounter compilation errors with `cashc`. 
**Workaround:** Use Node.js 18 or 20. You can use `nvm` to switch versions:

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 18
nvm install 18
nvm use 18

# Or use Node.js 20
nvm install 20
nvm use 20
```

---

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Clone the repository (if not already done)
cd EmoChain

# Install npm packages
npm install
```

### Step 2: Download AI Models

The face-api.js models are required for emotion detection. You have two options:

#### Option A: Automatic Download Script (Recommended)

```bash
# Try the download script
chmod +x scripts/download-models.sh
./scripts/download-models.sh
```

#### Option B: Manual Download

1. Visit: https://github.com/justadudewhohacks/face-api.js-models/tree/master
2. Download these 8 files to `public/models/`:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_expression_model-weights_manifest.json`
   - `face_expression_model-shard1`

3. Place all files in `/public/models/` directory

**Verify models are downloaded:**
```bash
ls -lh public/models/
# Should show 8 files
```

### Step 3: Compile Smart Contract

**Important:** Use Node.js 18 or 20 for this step.

```bash
# Compile the CashScript contract
npm run compile-contract
```

**Expected Output:**
- Artifact file created: `src/contracts/emotion-reward-artifact.json`

**If compilation fails:**
- Check Node.js version: `node --version` (should be 18.x or 20.x)
- Try using nvm to switch versions (see Known Issue above)
- Verify cashc is installed: `npm list cashc`

### Step 4: Deploy Contract to Chipnet

#### 4.1 Get Contract Address

After compilation, get the contract address:

```bash
node -e "const artifact = require('./src/contracts/emotion-reward-artifact.json'); console.log('Contract Address:', artifact.address);"
```

Copy the contract address (it should look like: `bchtest:...`)

#### 4.2 Fund the Contract

1. **Install Paytaca Wallet** (if not already installed):
   - Chrome: https://chrome.google.com/webstore (search "Paytaca")
   - Firefox: https://addons.mozilla.org (search "Paytaca")

2. **Switch to Chipnet Network**:
   - Open Paytaca Wallet extension
   - Switch network to "Chipnet" (testnet)

3. **Get Chipnet BCH** (if needed):
   - Visit: https://chipnet.imaginary.cash/faucet
   - Or use another Chipnet faucet
   - Request test BCH to your Paytaca wallet address

4. **Fund the Contract**:
   - Send BCH to the contract address you got in step 4.1
   - **Recommended amount:** 100,000+ satoshis (for multiple rewards)
   - **Minimum:** 5,000 satoshis (for one score-5 reward)
   - Make a note of the transaction hash

5. **Verify Deployment**:
   - Check contract address on explorer: 
     - https://chipnet.imaginary.cash/address/<CONTRACT_ADDRESS>
   - You should see a UTXO locked to the contract

### Step 5: Start Frontend

```bash
# Start development server
npm run dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled successfully
```

### Step 6: Open Application

1. Open browser: http://localhost:3000
2. Ensure Paytaca Wallet is:
   - Installed
   - Unlocked
   - On Chipnet network

---

## Using the Application

### 1. Connect Wallet

- Click "Connect Wallet" button
- Approve connection in Paytaca wallet popup
- Verify address is displayed (should start with `bchtest:`)

### 2. Scan Emotion

- Click "Scan Emotion" button
- Allow camera permissions when prompted
- Look at the camera and express an emotion (happy face = higher score)
- Wait for AI to analyze (few seconds)
- See your emotion score (1-5) appear

### 3. Claim Reward

- Review the reward amount (based on your emotion score)
- Click "Claim Reward" button
- Approve transaction in Paytaca wallet
- Wait for transaction confirmation
- See transaction hash displayed

**Reward Calculation:**
- Score 1 = 1,000 satoshis
- Score 2 = 2,000 satoshis
- Score 3 = 3,000 satoshis
- Score 4 = 4,000 satoshis
- Score 5 = 5,000 satoshis

---

## Troubleshooting

### "Models not found" Error

**Solution:**
1. Check that all 8 model files are in `public/models/`
2. Restart the dev server: `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### "Contract artifact not found" Error

**Solution:**
1. Ensure contract is compiled: `npm run compile-contract`
2. Check that `src/contracts/emotion-reward-artifact.json` exists
3. If using Node.js 22+, switch to Node.js 18 or 20

### "Contract not funded" Error

**Solution:**
1. Verify contract address has BCH on Chipnet
2. Check explorer: https://chipnet.imaginary.cash/address/<CONTRACT_ADDRESS>
3. If empty, send BCH to the contract address

### "Wallet connection failed" Error

**Solution:**
1. Ensure Paytaca Wallet extension is installed
2. Unlock your wallet
3. Switch to Chipnet network in wallet settings
4. Refresh the page

### "Camera permission denied" Error

**Solution:**
1. Click the camera icon in browser address bar
2. Allow camera access
3. Refresh page and try again

### Compilation Errors

**If `cashc` compilation fails:**
1. Check Node.js version: `node --version`
2. Use Node.js 18 or 20 (not 22+)
3. Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`

---

## Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Download models (manual or script)
# See Step 2 above

# 3. Compile contract (use Node.js 18/20)
npm run compile-contract

# 4. Get contract address
node -e "const a=require('./src/contracts/emotion-reward-artifact.json'); console.log(a.address);"

# 5. Fund contract on Chipnet (use Paytaca wallet)

# 6. Start frontend
npm run dev

# 7. Open http://localhost:3000
```

---

## Production Build

To build for production:

```bash
# Build Next.js application
npm run build

# Start production server
npm start
```

---

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Check browser console for errors (`F12` → Console tab)
3. Check terminal output for compilation errors
4. Verify all prerequisites are met

---

**Happy emotion scanning! 😊**

