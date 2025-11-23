/**
 * Generate SHA-256 proof hash for emotion verification
 * Hash contains: emotionScore + timestamp + walletAddress + sessionId
 */
export async function generateProofHash(
    emotionScore: number,
    timestamp: number,
    walletAddress: string,
    sessionId: string
): Promise<string> {
    // Create proof data string
    const proofData = `${emotionScore}:${timestamp}:${walletAddress}:${sessionId}`

    // Convert to Uint8Array
    const encoder = new TextEncoder()
    const data = encoder.encode(proofData)

    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return hashHex
}

/**
 * Verify proof hash matches expected data
 */
export async function verifyProofHash(
    hash: string,
    emotionScore: number,
    timestamp: number,
    walletAddress: string,
    sessionId: string
): Promise<boolean> {
    const expectedHash = await generateProofHash(
        emotionScore,
        timestamp,
        walletAddress,
        sessionId
    )
    return hash === expectedHash
}

/**
 * Check if timestamp is fresh (within last 5 minutes)
 */
export function isTimestampFresh(timestamp: number): boolean {
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    return (now - timestamp) < fiveMinutes
}






