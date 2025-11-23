# EmoChain - Proof-of-Emotion Reward System

A Bitcoin Cash Chipnet hackathon project for Blaze2025 that rewards users with BCH based on their detected emotions using AI-powered face scanning.

## 🎯 Project Overview

EmoChain is a browser-based Proof-of-Emotion (POE) reward system that:
- Uses AI to detect emotions from facial expressions (1-5 score)
- Generates cryptographic proof hashes for verification
- Deploys smart contracts on Bitcoin Cash Chipnet using Layla Upgrade CHIPs
- Rewards users with BCH based on their emotion scores

## 🚀 Features

### Layla Upgrade CHIPs Implementation
- ✅ **CHIP Functions**: Modular script organization
- ✅ **CHIP Bitwise Operations**: Efficient hash verification using XOR
- ✅ **CHIP Loops**: Iterative reward calculation
- ✅ **P2S (Pay-to-Script)**: Advanced locking mechanisms

### Technology Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **AI**: face-api.js (100% browser-based, no backend)
- **Blockchain**: Bitcoin Cash Chipnet
- **Smart Contracts**: CashScript with Layla CHIPs
- **Wallet**: Paytaca Wallet integration
- **Animations**: Framer Motion

## 📁 Project Structure

```
EmoChain/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── WalletConnect.tsx   # Paytaca wallet integration
│   │   ├── EmotionScanner.tsx  # AI emotion detection
│   │   └── RewardClaim.tsx     # Contract interaction
│   ├── contracts/
│   │   ├── emotion-reward.cash # CashScript contract (Layla CHIPs)
│   │   └── emotion-reward.pact # Alternative contract spec
│   └── utils/
│       ├── emotionDetection.ts # Face-api.js integration
│       ├── proofGenerator.ts   # SHA-256 proof generation
│       ├── wallet.ts           # Paytaca wallet utilities
│       └── contract.ts         # Contract interaction
├── public/
│   └── models/                 # face-api.js model files
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Setup Instructions

> **📖 For detailed step-by-step instructions, see [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)**

### Prerequisites
- **Node.js 18 or 20** (⚠️ Node.js 22+ has compatibility issues with `cashc`)
- npm or yarn
- Paytaca Wallet browser extension (for Chipnet)
- Git

### Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Download face-api.js models** (8 files required):
   - See [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) for detailed instructions
   - Or use: `./scripts/download-models.sh` (if available)
   - Place in `/public/models/` directory

3. **Compile CashScript contract:**
```bash
# ⚠️ Use Node.js 18 or 20 for this step (not 22+)
npm run compile-contract
```

4. **Deploy contract to Chipnet:**
```bash
# Get contract address
npm run get-contract-address

# Fund the contract address with BCH on Chipnet
# - Use Paytaca Wallet (switch to Chipnet network)
# - Send BCH to the contract address (recommended: 100,000+ satoshis)
# - Verify on: https://chipnet.imaginary.cash
```

5. **Start frontend:**
```bash
npm run dev
```

6. **Open browser:**
   - Navigate to `http://localhost:3000`
   - Connect Paytaca Wallet (ensure it's on Chipnet network)
   - Start scanning emotions!

## 💻 Usage Flow

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve connection in Paytaca wallet
   - Ensure you're on Chipnet network

2. **Scan Emotion**
   - Click "Scan Emotion" button
   - Allow camera permissions
   - AI will analyze your facial expression
   - Receive emotion score (1-5) and proof hash

3. **Claim Reward**
   - Review estimated reward amount (based on emotion score)
   - Click "Claim Reward"
   - Sign transaction in Paytaca wallet
   - Receive BCH reward on Chipnet
   - View transaction hash and link to explorer

## 🔐 Smart Contract Details

### Contract Parameters
- `emotionScore`: Integer (1-5)
- `timestamp`: Unix timestamp
- `proofHash`: SHA-256 hash of (score:timestamp:address:sessionId)
- `userAddress`: Bitcoin Cash address
- `sessionId`: Unique session identifier

### Validation Logic
1. **Score Validation**: Must be between 1-5
2. **Timestamp Freshness**: Must be within last 5 minutes
3. **Hash Verification**: Proof hash must match computed hash
4. **Reward Calculation**: Uses CHIP loops (baseReward × score)

### CHIP Features Used

#### CHIP Loops
```cashscript
loop (i <= score) {
    multiplier = multiplier + 1;
    i = i + 1;
}
```

#### CHIP Bitwise Operations
```cashscript
int diff = byte1 ^ byte2;  // XOR
int byte = (data >> shift) & mask;  // Shift and mask
```

#### CHIP Functions
- `calculateReward()`: Loop-based reward calculation
- `verifyHash()`: Bitwise hash comparison
- `isTimestampFresh()`: Time validation

## 🧪 Testing

### Manual Testing
1. Test wallet connection with Paytaca
2. Test emotion detection with different expressions
3. Test proof hash generation
4. Test contract parameter validation
5. Test transaction building (on Chipnet)

### Contract Testing
```bash
# Compile contract
cashc src/contracts/emotion-reward.cash

# Test with CashScript SDK
# (See contract.ts for integration examples)
```

## 📝 Development Notes

### Browser-Only Architecture
- No backend server required
- All AI processing in browser
- Direct blockchain interaction via wallet
- Proof generation client-side

### Security Considerations
- Proof hashes prevent replay attacks
- Timestamp freshness prevents stale proofs
- Wallet signature required for transactions
- Contract validates all parameters on-chain

### Future Enhancements
- [ ] Support for multiple emotion types
- [ ] Leaderboard system
- [ ] NFT rewards for high scores
- [ ] Social sharing features
- [ ] Mobile app version

## 🏆 Hackathon Submission

### Judging Criteria Compliance
- ✅ **Clean Code**: Well-organized, commented, modular
- ✅ **Easy to Read**: Clear structure, TypeScript types
- ✅ **Efficient**: Browser-based, no backend overhead
- ✅ **Real Purpose**: Emotion-based reward system
- ✅ **BCH Features**: Uses Layla CHIPs extensively

### CHIPnet Track Requirements
- ✅ Uses new Layla upgrade CHIPs
- ✅ Implements loops, functions, bitwise operations
- ✅ Uses P2S (Pay-to-Script) locking
- ✅ Deployed on Chipnet testnet

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Bitcoin Cash community
- DoraHacks for hosting Blaze2025
- face-api.js for browser-based AI
- CashScript team for smart contract tools
- Paytaca for wallet integration

## 📧 Contact

For questions or issues, please open a GitHub issue or contact the team.

---

**Built with ❤️ for Bitcoin Cash Chipnet and Blaze2025 Hackathon**




