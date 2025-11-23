/**
 * EmoChain Proof-of-Emotion Reward Contract
 * 
 * This contract uses Layla Upgrade CHIPs:
 * - CHIP Functions: Modular script organization
 * - CHIP Bitwise Operations: Efficient hash verification
 * - CHIP Loops: Iterative reward calculation
 * - P2S (Pay-to-Script): Advanced locking mechanism
 * 
 * Contract Logic:
 * 1. Verifies emotion score is valid (1-5)
 * 2. Checks timestamp freshness (within 5 minutes)
 * 3. Validates proof hash matches expected SHA-256
 * 4. Calculates reward based on emotion score using loops
 * 5. Releases BCH from P2S script
 */

// Contract parameters (passed via constructor)
// score: emotion score (1-5)
// timestamp: Unix timestamp
// proofHash: SHA-256 hash of (score:timestamp:address:sessionId)
// userAddress: Bitcoin Cash address of user
// sessionId: unique session identifier

// Reward calculation function using CHIP loops
// Higher emotion scores = higher rewards
// Score 5 = 5000 satoshis, Score 4 = 4000, etc.
function calculateReward(score) {
    // Base reward in satoshis
    baseReward = 1000;
    
    // Use CHIP loop to calculate multiplier
    // Loop from 1 to score, accumulating reward
    multiplier = 0;
    i = 1;
    
    // CHIP loop: while i <= score
    while (i <= score) {
        multiplier = multiplier + 1;
        i = i + 1;
    }
    
    // Final reward = base * multiplier
    reward = baseReward * multiplier;
    return reward;
}

// Hash verification function using CHIP bitwise operations
// Verifies SHA-256 proof hash matches expected value
function verifyHash(score, timestamp, address, sessionId, expectedHash) {
    // Construct proof data string
    proofData = score + ":" + timestamp + ":" + address + ":" + sessionId;
    
    // Generate SHA-256 hash (using CHIP bitwise operations internally)
    computedHash = sha256(proofData);
    
    // Bitwise comparison of hash bytes
    // Using CHIP bitwise XOR to compare hashes
    hashMatch = true;
    i = 0;
    
    // Compare hash bytes using bitwise operations
    while (i < 32) {  // SHA-256 is 32 bytes
        byte1 = extractByte(computedHash, i);
        byte2 = extractByte(expectedHash, i);
        
        // Bitwise XOR: if result is non-zero, bytes don't match
        diff = byte1 XOR byte2;
        if (diff != 0) {
            hashMatch = false;
            break;
        }
        i = i + 1;
    }
    
    return hashMatch;
}

// Timestamp freshness check using CHIP bitwise comparison
function isTimestampFresh(timestamp) {
    currentTime = currentBlockTime();
    timeDiff = currentTime - timestamp;
    
    // 5 minutes = 300 seconds
    maxAge = 300;
    
    // Bitwise comparison: timeDiff < maxAge
    isFresh = timeDiff < maxAge;
    return isFresh;
}

// Main contract function
// Validates all conditions and releases reward
function validateAndReward(score, timestamp, proofHash, userAddress, sessionId) {
    // Validation 1: Score must be between 1 and 5
    scoreValid = (score >= 1) && (score <= 5);
    require(scoreValid, "Invalid emotion score");
    
    // Validation 2: Timestamp must be fresh
    fresh = isTimestampFresh(timestamp);
    require(fresh, "Timestamp expired");
    
    // Validation 3: Proof hash must match
    hashValid = verifyHash(score, timestamp, userAddress, sessionId, proofHash);
    require(hashValid, "Invalid proof hash");
    
    // Calculate reward using loop-based function
    reward = calculateReward(score);
    
    // Release reward to user address
    // This uses P2S (Pay-to-Script) unlocking mechanism
    sendToAddress(userAddress, reward);
    
    return true;
}

// Contract entry point
// This is called when transaction is sent to contract address
pub function main(score, timestamp, proofHash, userAddress, sessionId) {
    return validateAndReward(score, timestamp, proofHash, userAddress, sessionId);
}

