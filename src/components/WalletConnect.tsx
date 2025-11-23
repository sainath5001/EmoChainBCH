'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, CheckCircle2, AlertCircle } from 'lucide-react'
import { connectWallet, isPaytacaInstalled } from '@/utils/wallet'

interface WalletConnectProps {
  onConnect: (address: string) => void
  address: string | null
}

export default function WalletConnect({ onConnect, address }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    checkWalletInstalled()

    // Re-check periodically in case wallet loads after page load
    const interval = setInterval(() => {
      checkWalletInstalled()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const checkWalletInstalled = async () => {
    try {
      const installed = await isPaytacaInstalled()
      setIsInstalled(installed)

      // Also log for debugging
      if (typeof window !== 'undefined') {
        const win = window as any
        console.log('Wallet detection:', {
          paytaca: !!win.paytaca,
          PaytacaWallet: !!win.PaytacaWallet,
          bitcoin: !!win.bitcoin,
          bitcoinCash: !!win.bitcoinCash,
          bch: !!win.bch,
          installed
        })
      }
    } catch (err) {
      console.error('Error checking wallet:', err)
      setIsInstalled(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const address = await connectWallet()
      onConnect(address)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      console.error('Wallet connection error:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    onConnect('')
    setError(null)
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!address ? (
          <motion.div
            key="connect"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-3"
          >
            {!isInstalled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-sm text-yellow-200"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Paytaca Wallet Required</p>
                    <p className="text-xs text-yellow-300 mb-2">
                      {isInstalled
                        ? 'Wallet detected but not connected. Click "Connect Wallet" to connect.'
                        : 'Install the Paytaca wallet extension to connect'}
                    </p>
                    {!isInstalled && (
                      <div className="text-xs text-yellow-400 space-y-1">
                        <p><strong>Install:</strong></p>
                        <p>• Chrome: <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer" className="underline">Chrome Web Store</a> (search "Paytaca")</p>
                        <p>• Firefox: <a href="https://addons.mozilla.org" target="_blank" rel="noopener noreferrer" className="underline">Firefox Add-ons</a> (search "Paytaca")</p>
                        <p className="mt-2"><strong>After install:</strong> Switch to <code className="bg-yellow-900/30 px-1 rounded">Chipnet</code> network</p>
                        <p className="mt-2 text-yellow-300"><strong>Tip:</strong> Refresh page after installing extension</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={isInstalled ? { scale: 1.05 } : {}}
              whileTap={isInstalled ? { scale: 0.95 } : {}}
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              {isConnecting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-500/20 border border-green-500/50 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-semibold">Wallet Connected</span>
              </div>
              <p className="text-xs text-gray-300 font-mono break-all">
                {address}
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDisconnect}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Disconnect
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  )
}


