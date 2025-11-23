# EmoChain Contract Deployment Guide

Complete guide for deploying the EmoChain smart contract to Bitcoin Cash Chipnet.

## Prerequisites

1. Contract must be compiled (see [STARTUP_GUIDE.md](./STARTUP_GUIDE.md))
2. Paytaca Wallet installed and configured for Chipnet
3. Some Chipnet BCH for funding the contract

## Deployment Steps

### Step 1: Compile Contract

```bash
# Ensure you're using Node.js 18 or 20 (not 22+)
node --version

# Compile the contract
npm run compile-contract
```

**Expected Output:**
- Creates `src/contracts/emotion-reward-artifact.json`

### Step 2: Get Contract Address

```bash
npm run get-contract-address
```

**Example Output:**
```
Contract Address: bchtest:pq... (your address will be different)
```

Copy this address - you'll need it in the next step.

### Step 3: Fund the Contract

1. **Open Paytaca Wallet**
   - Ensure you're on **Chipnet** network (not mainnet)
   - If needed, get Chipnet BCH from a faucet:
     - https://chipnet.imaginary.cash/faucet

2. **Send BCH to Contract Address**
   - Open Paytaca Wallet
   - Click "Send"
   - Paste the contract address from Step 2
   - Enter amount:
     - **Minimum:** 5,000 satoshis (for one reward)
     - **Recommended:** 100,000+ satoshis (for ~20 rewards)
   - Review and confirm transaction
   - Wait for confirmation (usually < 1 minute on Chipnet)

3. **Verify Funding**
   - Visit: `https://chipnet.imaginary.cash/address/<YOUR_CONTRACT_ADDRESS>`
   - You should see:
     - At least one UTXO
     - Balance in satoshis

### Step 4: Test Contract

1. **Start Frontend**
   ```bash
   npm run dev
   ```

2. **Test in Browser**
   - Open http://localhost:3000
   - Connect wallet
   - Scan emotion
   - Claim reward
   - Verify transaction appears in explorer

## Contract Parameters

The contract expects these parameters when instantiated:

- `emotionScore`: Integer (1-5)
- `timestamp`: Unix timestamp (seconds)
- `proofHash`: SHA-256 hash (64 hex characters)
- `userAddress`: Bitcoin Cash address (bytes20/hash160)
- `sessionId`: Unique session identifier (bytes32)

## Reward Amounts

- Score 1 = **1,000 satoshis**
- Score 2 = **2,000 satoshis**
- Score 3 = **3,000 satoshis**
- Score 4 = **4,000 satoshis**
- Score 5 = **5,000 satoshis**

**Maximum reward per claim:** 5,000 satoshis

## Contract Details

### Contract Address Format
- Chipnet: `bchtest:...`
- Mainnet (if deployed): `bitcoincash:...`

### Contract Features (Layla CHIPs)
- ✅ **CHIP Functions**: Modular validation logic
- ✅ **CHIP Bitwise Operations**: Hash verification
- ✅ **CHIP Loops**: Reward calculation
- ✅ **P2S (Pay-to-Script)**: Contract locking mechanism

### Validation Rules
1. Emotion score must be between 1-5
2. Timestamp must be positive
3. Proof hash must match computed hash
4. Output amount must match calculated reward
5. Recipient must match user address

## Troubleshooting

### "Contract not funded" Error

**Problem:** Users see error when trying to claim rewards.

**Solution:**
1. Check contract address has UTXOs:
   ```bash
   # Get address
   npm run get-contract-address
   
   # Check on explorer
   # https://chipnet.imaginary.cash/address/<ADDRESS>
   ```

2. If empty, fund the contract (see Step 3)

3. If funded but still error, check:
   - Contract address is correct
   - UTXO is confirmed (wait 1 block)
   - Contract parameters are valid

### "Insufficient funds" Error

**Problem:** Contract has less BCH than requested reward.

**Solution:**
- Fund contract with more BCH
- Or limit maximum reward in frontend

### Contract Address Not Found

**Problem:** `npm run get-contract-address` fails.

**Solution:**
1. Ensure contract is compiled:
   ```bash
   npm run compile-contract
   ```

2. Check artifact file exists:
   ```bash
   ls -l src/contracts/emotion-reward-artifact.json
   ```

3. Verify artifact is valid JSON:
   ```bash
   node -e "require('./src/contracts/emotion-reward-artifact.json')"
   ```

## Monitoring Deployment

### Check Contract Balance
```bash
# Get address
npm run get-contract-address

# Check on explorer (replace <ADDRESS> with your contract address)
# https://chipnet.imaginary.cash/address/<ADDRESS>
```

### View Transaction History
- Use Chipnet explorer to view:
  - Incoming transactions (funding)
  - Outgoing transactions (reward claims)

### Expected Behavior

1. **Funding Transaction:**
   - Sends BCH to contract address
   - Creates a UTXO locked to contract
   - Shows as "Locked" on explorer

2. **Claim Transaction:**
   - Spends from contract UTXO
   - Validates all parameters
   - Sends reward to user address
   - Remaining amount goes back to contract (if any)

## Updating Contract

If you need to update the contract:

1. **Stop any running frontends**
2. **Modify contract code** in `src/contracts/emotion-reward.cash`
3. **Recompile:**
   ```bash
   npm run compile-contract
   ```
4. **Deploy new contract** (new address will be generated)
5. **Fund new contract** with BCH
6. **Update frontend** if contract address is hardcoded
7. **Restart frontend**

**Note:** Old contract will still exist. Users with old contract address won't be able to claim.

## Production Deployment (Mainnet)

For mainnet deployment:

1. **Switch network in code:**
   - Update `src/utils/contract.ts`:
     ```typescript
     provider: new ElectrumNetworkProvider('mainnet', 'https://...')
     ```

2. **Compile contract:**
   ```bash
   npm run compile-contract
   ```

3. **Get mainnet contract address:**
   ```bash
   npm run get-contract-address
   ```

4. **Fund with real BCH** (mainnet, not testnet)

5. **Update frontend configuration** for mainnet

**⚠️ Warning:** Mainnet uses real BCH. Test thoroughly on Chipnet first!

---

## Quick Reference

```bash
# Compile contract
npm run compile-contract

# Get contract address
npm run get-contract-address

# Full deployment script (includes compilation)
npm run deploy-contract
```

---

**Need help?** Check [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) or open an issue.

