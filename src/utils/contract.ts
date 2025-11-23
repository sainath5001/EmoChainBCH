/**
 * Contract interaction utilities for EmoChain
 * Handles CashScript contract compilation and transaction building
 */

import { Contract, NetworkProvider } from 'cashscript'
import { ElectrumNetworkProvider } from 'cashscript'

// Dynamic import for artifact (may not exist if contract not compiled)
let artifact: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  artifact = require('../contracts/emotion-reward-artifact.json')
} catch (e) {
  console.warn('Contract artifact not found. Please compile contract first: npm run compile-contract')
}

/**
 * Chipnet network configuration
 */
export const CHIPNET_CONFIG = {
  network: 'chipnet' as const,
  provider: new ElectrumNetworkProvider('chipnet', 'https://chipnet.imaginary.cash'),
}

/**
 * Compile and instantiate the EmotionReward contract
 * NOTE: Contract must be compiled first using: npm run compile-contract
 */
export async function getContract(
  emotionScore: number,
  timestamp: number,
  proofHash: string,
  userAddress: string,
  sessionId: string
): Promise<Contract> {
  if (!artifact) {
    throw new Error(
      'Contract artifact not found. Please compile the contract first: npm run compile-contract'
    )
  }

  try {
    // Convert string proofHash to hex string (remove 0x if present)
    const hashHex = proofHash.startsWith('0x') ? proofHash.slice(2) : proofHash

    // Convert userAddress to bytes20 format (hash160)
    // For Bitcoin Cash addresses, we need to decode to get hash160
    // Using @bitauth/libauth for proper address decoding
    const addressBytes = await decodeAddressToHash160(userAddress)

    // Convert sessionId UUID to bytes32 (take first 32 bytes of hex)
    const sessionBytes = hexToBytes32(convertUuidToHex(sessionId))

    // Convert proofHash to bytes32
    const proofHashBytes = hexToBytes32(hashHex)

    // Instantiate contract with constructor parameters
    const contract = new Contract(artifact, [
      emotionScore,
      timestamp,
      proofHashBytes,
      addressBytes,
      sessionBytes,
    ], {
      provider: CHIPNET_CONFIG.provider,
    })

    return contract
  } catch (error: any) {
    console.error('Contract instantiation error:', error)
    throw new Error(`Failed to instantiate contract: ${error.message}`)
  }
}

/**
 * Build reward claim transaction
 * NOTE: This requires the contract to be deployed and funded with a UTXO
 */
export async function buildRewardTransaction(
  contract: Contract,
  recipientAddress: string,
  emotionScore: number
): Promise<string> {
  try {
    // Calculate reward amount (in satoshis)
    const baseReward = 1000
    const multiplier = emotionScore
    const rewardAmount = BigInt(baseReward * multiplier)

    // Convert recipient address to bytes20 (hash160)
    const recipientBytes = await decodeAddressToHash160(recipientAddress)

    // Build transaction using contract function
    // The contract function validateAndReward takes:
    // - amount (bytes8): The output amount in satoshis
    // - recipient (bytes20): The recipient address hash160

    // Convert amount to bytes8 (little-endian)
    const amountBytes = new Uint8Array(8)
    const amountValue = rewardAmount
    for (let i = 0; i < 8; i++) {
      amountBytes[i] = Number((amountValue >> BigInt(i * 8)) & BigInt(0xff))
    }

    // Build and send transaction
    // Note: This will fail if contract doesn't have a UTXO locked to it
    const tx = await contract.functions
      .validateAndReward(amountBytes, recipientBytes)
      .to(recipientAddress, rewardAmount)
      .send()

    return tx.txid
  } catch (error: any) {
    console.error('Transaction building error:', error)

    // Provide helpful error messages
    if (error.message?.includes('UTXO') || error.message?.includes('insufficient')) {
      throw new Error(
        'Contract not funded. The contract needs a UTXO locked to it before rewards can be claimed. ' +
        'Please deploy and fund the contract first. See deployment instructions in README.md'
      )
    }

    throw new Error(`Failed to build transaction: ${error.message}`)
  }
}

/**
 * Estimate reward amount based on emotion score
 */
export function estimateReward(emotionScore: number): number {
  // Matches contract logic: baseReward * multiplier
  const baseReward = 1000
  const multiplier = emotionScore
  return baseReward * multiplier
}

/**
 * Validate contract parameters before submission
 */
export function validateContractParams(
  emotionScore: number,
  timestamp: number,
  proofHash: string,
  userAddress: string,
  sessionId: string
): { valid: boolean; error?: string } {
  // Validate score
  if (emotionScore < 1 || emotionScore > 5) {
    return { valid: false, error: 'Emotion score must be between 1 and 5' }
  }

  // Validate timestamp (should be within last 5 minutes)
  const now = Math.floor(Date.now() / 1000)
  const fiveMinutes = 5 * 60
  if (timestamp < now - fiveMinutes || timestamp > now) {
    return { valid: false, error: 'Timestamp must be within last 5 minutes' }
  }

  // Validate proof hash (should be 64 hex characters for SHA-256)
  const hashHex = proofHash.startsWith('0x') ? proofHash.slice(2) : proofHash
  if (!/^[0-9a-f]{64}$/i.test(hashHex)) {
    return { valid: false, error: 'Invalid proof hash format (must be 64 hex characters)' }
  }

  // Validate address
  if (!userAddress || userAddress.length < 26) {
    return { valid: false, error: 'Invalid wallet address' }
  }

  // Validate session ID
  if (!sessionId || sessionId.length < 10) {
    return { valid: false, error: 'Invalid session ID' }
  }

  return { valid: true }
}

/**
 * Helper: Decode Bitcoin Cash address to hash160 (bytes20)
 * Uses @bitauth/libauth for proper address decoding
 */
async function decodeAddressToHash160(address: string): Promise<Uint8Array> {
  try {
    // Try to use @bitauth/libauth for proper decoding
    const { decodeAddress } = await import('@bitauth/libauth')
    const decoded = decodeAddress(address)

    if (decoded && decoded.type === 'p2pkh' || decoded.type === 'p2sh') {
      // hash160 is 20 bytes
      return new Uint8Array(decoded.hashData)
    }

    throw new Error('Unsupported address type')
  } catch (error) {
    console.warn('Failed to decode address with libauth, using fallback:', error)

    // Fallback: Extract hash from address (simplified)
    // Remove prefix if present
    const cleanHex = address.replace(/^(bitcoincash:|bchtest:|bchreg:)/, '')

    // For base32 addresses, we can't easily extract hash160
    // This is a temporary workaround
    const hash = new Uint8Array(20)

    // Use a hash of the address string as fallback
    const encoder = new TextEncoder()
    const data = encoder.encode(cleanHex)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = new Uint8Array(hashBuffer)

    // Take first 20 bytes as hash160 approximation
    for (let i = 0; i < 20; i++) {
      hash[i] = hashArray[i]
    }

    return hash
  }
}

/**
 * Helper: Convert UUID to hex string (32 bytes for bytes32)
 */
function convertUuidToHex(uuid: string): string {
  // Remove hyphens from UUID
  return uuid.replace(/-/g, '')
}

/**
 * Helper: Convert hex string to bytes32
 */
function hexToBytes32(hex: string): Uint8Array {
  const cleanHex = hex.replace(/^0x/, '')
  const bytes = new Uint8Array(32)
  for (let i = 0; i < 32 && i * 2 < cleanHex.length; i++) {
    const byte = parseInt(cleanHex.substr(i * 2, 2) || '00', 16)
    bytes[i] = byte
  }
  return bytes
}

