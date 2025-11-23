'use client'

import { useState, useEffect } from 'react'
import EmotionScanner from '@/components/EmotionScanner'
import WalletConnect from '@/components/WalletConnect'
import RewardClaim from '@/components/RewardClaim'
import ClientOnlyParticles from '@/components/ClientOnlyParticles'
import { motion } from 'framer-motion'
import { Sparkles, Heart, Coins } from 'lucide-react'

export default function Home() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [emotionScore, setEmotionScore] = useState<number | null>(null)
    const [proofHash, setProofHash] = useState<string | null>(null)
    const [timestamp, setTimestamp] = useState<number | null>(null)
    const [sessionId, setSessionId] = useState<string>('')

    useEffect(() => {
        // Generate session ID on mount
        setSessionId(crypto.randomUUID())
    }, [])

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated background particles - Client only to avoid hydration errors */}
            <ClientOnlyParticles />

            <div className="relative z-10 container mx-auto px-4 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        className="inline-flex items-center gap-3 mb-4"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <Sparkles className="w-12 h-12 text-primary-400" />
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            EmoChain
                        </h1>
                    </motion.div>
                    <p className="text-xl text-gray-300 mb-2">
                        Proof-of-Emotion Reward System
                    </p>
                    <p className="text-sm text-gray-400">
                        Built for Bitcoin Cash Chipnet • Blaze2025 Hackathon
                    </p>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {/* Step 1: Wallet Connect */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-6 border border-primary-500/30 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                                1
                            </div>
                            <h2 className="text-2xl font-semibold text-white">Connect Wallet</h2>
                        </div>
                        <WalletConnect
                            onConnect={setWalletAddress}
                            address={walletAddress}
                        />
                    </motion.div>

                    {/* Step 2: Scan Emotion */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-6 border border-primary-500/30 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                                2
                            </div>
                            <h2 className="text-2xl font-semibold text-white">Scan Emotion</h2>
                        </div>
                        <EmotionScanner
                            walletAddress={walletAddress}
                            sessionId={sessionId}
                            onScoreGenerated={(score, hash, ts) => {
                                setEmotionScore(score)
                                setProofHash(hash)
                                setTimestamp(ts)
                            }}
                        />
                    </motion.div>

                    {/* Step 3: Claim Reward */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-6 border border-primary-500/30 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                                3
                            </div>
                            <h2 className="text-2xl font-semibold text-white">Claim Reward</h2>
                        </div>
                        <RewardClaim
                            walletAddress={walletAddress}
                            emotionScore={emotionScore}
                            proofHash={proofHash}
                            timestamp={timestamp}
                            sessionId={sessionId}
                        />
                    </motion.div>
                </div>

                {/* Info Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-12 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
                >
                    <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-primary-500/20">
                        <Heart className="w-8 h-8 text-pink-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
                        <p className="text-gray-400 text-sm">
                            Browser-based emotion detection using advanced ML models
                        </p>
                    </div>
                    <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-primary-500/20">
                        <Coins className="w-8 h-8 text-yellow-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">BCH Rewards</h3>
                        <p className="text-gray-400 text-sm">
                            Earn Bitcoin Cash rewards verified on Chipnet blockchain
                        </p>
                    </div>
                    <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-primary-500/20">
                        <Sparkles className="w-8 h-8 text-primary-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Layla CHIPs</h3>
                        <p className="text-gray-400 text-sm">
                            Powered by advanced Bitcoin Cash smart contract features
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    )
}

