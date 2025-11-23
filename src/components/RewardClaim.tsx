'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { estimateReward, validateContractParams } from '@/utils/contract'
import { sendTransaction } from '@/utils/wallet'

interface RewardClaimProps {
  walletAddress: string | null
  emotionScore: number | null
  proofHash: string | null
  timestamp: number | null
  sessionId: string
}

export default function RewardClaim({
  walletAddress,
  emotionScore,
  proofHash,
  timestamp,
  sessionId,
}: RewardClaimProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canClaim = walletAddress && emotionScore !== null && proofHash !== null && timestamp !== null

  const handleClaim = async () => {
    if (!canClaim || !emotionScore || !proofHash || !walletAddress || !timestamp) return

    setIsClaiming(true)
    setError(null)

    try {
      // Validate parameters
      const validation = validateContractParams(
        emotionScore,
        timestamp,
        proofHash,
        walletAddress,
        sessionId
      )

      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid parameters')
      }

      // Get contract instance
      const { getContract, buildRewardTransaction } = await import('@/utils/contract')
      const contract = await getContract(
        emotionScore,
        timestamp,
        proofHash,
        walletAddress,
        sessionId
      )

      // Build and send transaction
      // NOTE: This requires the contract to be deployed and funded with BCH
      // In a production setup, you would need:
      // 1. Deploy the contract (fund a UTXO locked to the contract address)
      // 2. The contract UTXO should contain the reward amount
      // 3. Then users can claim by spending from that UTXO

      // For now, we'll attempt to build the transaction
      // If the contract isn't funded, this will fail gracefully
      try {
        const txid = await buildRewardTransaction(contract, walletAddress, emotionScore)
        setTxHash(txid)
      } catch (contractError: any) {
        // If contract interaction fails (e.g., no UTXO locked to contract),
        // provide helpful error message
        console.warn('Contract interaction failed:', contractError)
        throw new Error(
          'Contract not funded or UTXO not available. ' +
          'The contract needs to be deployed and funded first. ' +
          'See deployment instructions in README.md'
        )
      }
    } catch (err: any) {
      console.error('Claim error:', err)
      setError(err.message || 'Failed to claim reward. Please try again.')
    } finally {
      setIsClaiming(false)
    }
  }

  const rewardAmount = emotionScore ? estimateReward(emotionScore) : 0

  return (
    <div className="space-y-4">
      {/* Reward Info */}
      <AnimatePresence>
        {emotionScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Coins className="w-8 h-8 text-yellow-400" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {rewardAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-300">satoshis</p>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              Based on emotion score: {emotionScore.toFixed(1)}/5.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claim Button */}
      <motion.button
        whileHover={canClaim ? { scale: 1.05 } : {}}
        whileTap={canClaim ? { scale: 0.95 } : {}}
        onClick={handleClaim}
        disabled={!canClaim || isClaiming || !!txHash}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
      >
        {isClaiming ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Claiming Reward...
          </>
        ) : txHash ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Reward Claimed!
          </>
        ) : (
          <>
            <Coins className="w-5 h-5" />
            Claim Reward
          </>
        )}
      </motion.button>

      {/* Transaction Hash */}
      {txHash && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-semibold">Transaction Successful!</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-300 font-mono break-all flex-1">
              {txHash}
            </p>
            <a
              href={`https://chipnet.imaginary.cash/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-200"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Info Message */}
      {!emotionScore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-400"
        >
          Scan your emotion first to claim rewards
        </motion.div>
      )}
    </div>
  )
}




