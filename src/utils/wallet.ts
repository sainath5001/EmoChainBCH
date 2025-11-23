/**
 * Paytaca Wallet Integration for Bitcoin Cash Chipnet
 * Handles wallet connection and transaction signing
 */

declare global {
  interface Window {
    paytaca?: {
      isEnabled: () => Promise<boolean>
      enable: () => Promise<void>
      getAddress: () => Promise<string>
      sendTransaction: (hex: string) => Promise<string>
      signMessage: (message: string) => Promise<string>
    }
  }
}

/**
 * Check if Paytaca wallet is installed
 */
export async function isPaytacaInstalled(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  // Check multiple possible Paytaca wallet interfaces
  // Paytaca might expose itself in different ways
  const win = window as any

  // Method 1: Direct paytaca object
  if (win.paytaca) {
    try {
      // Check if it has the expected methods
      if (typeof win.paytaca.getAddress === 'function' ||
        typeof win.paytaca.isEnabled === 'function') {
        return true
      }
    } catch (e) {
      console.log('Paytaca check error:', e)
    }
  }

  // Method 2: PaytacaWallet
  if (win.PaytacaWallet || win.Paytaca) {
    return true
  }

  // Method 3: bitcoinCash or bch namespace
  if (win.bitcoinCash || win.bch) {
    return true
  }

  // Method 4: Standard bitcoin interface
  if (win.bitcoin && win.bitcoin.isPaytaca) {
    return true
  }

  // Method 5: Check for Paytaca in document
  // Some wallets inject themselves differently
  if (document.getElementById('paytaca-extension') ||
    document.querySelector('[data-paytaca]')) {
    return true
  }

  return false
}

/**
 * Connect to Paytaca wallet and get address
 */
export async function connectWallet(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet can only be accessed in browser')
  }

  const win = window as any

  try {
    // Method 1: Direct paytaca object
    if (win.paytaca) {
      try {
        // Try enable first if method exists
        if (typeof win.paytaca.enable === 'function') {
          await win.paytaca.enable()
        }

        // Try getAddress
        if (typeof win.paytaca.getAddress === 'function') {
          const address = await win.paytaca.getAddress()
          if (address) return address
        }

        // Try isEnabled and then getAddress
        if (typeof win.paytaca.isEnabled === 'function') {
          const enabled = await win.paytaca.isEnabled()
          if (!enabled && typeof win.paytaca.enable === 'function') {
            await win.paytaca.enable()
          }
          if (typeof win.paytaca.getAddress === 'function') {
            const address = await win.paytaca.getAddress()
            if (address) return address
          }
        }
      } catch (e) {
        console.log('Paytaca direct connection error:', e)
      }
    }

    // Method 2: PaytacaWallet class
    if (win.PaytacaWallet) {
      try {
        const wallet = new win.PaytacaWallet()
        const address = await wallet.getAddress()
        if (address) return address
      } catch (e) {
        console.log('PaytacaWallet class error:', e)
      }
    }

    // Method 3: bitcoinCash namespace
    if (win.bitcoinCash) {
      try {
        if (win.bitcoinCash.request) {
          const accounts = await win.bitcoinCash.request({
            method: 'wallet_getAccounts',
          })
          if (accounts && accounts[0]?.address) {
            return accounts[0].address
          }
        }
      } catch (e) {
        console.log('bitcoinCash connection error:', e)
      }
    }

    // Method 4: Standard bitcoin interface
    if (win.bitcoin) {
      try {
        // Check if it's Paytaca
        if (win.bitcoin.isPaytaca || win.bitcoin._paytaca) {
          const accounts = await win.bitcoin.request({
            method: 'wallet_getAccounts',
          })
          if (accounts && accounts[0]?.address) {
            return accounts[0].address
          }
        }

        // Try standard request
        const accounts = await win.bitcoin.request({
          method: 'wallet_getAccounts',
        })
        if (accounts && accounts[0]?.address) {
          return accounts[0].address
        }
      } catch (e) {
        console.log('bitcoin interface error:', e)
      }
    }

    // Method 5: bch namespace
    if (win.bch) {
      try {
        if (win.bch.getAddress) {
          const address = await win.bch.getAddress()
          if (address) return address
        }
      } catch (e) {
        console.log('bch namespace error:', e)
      }
    }

    // If we get here, wallet is installed but connection failed
    throw new Error(
      'Paytaca wallet detected but connection failed. ' +
      'Please ensure the wallet is unlocked and try again. ' +
      'Also make sure you are on Chipnet network.'
    )
  } catch (error: any) {
    console.error('Wallet connection error:', error)

    // Provide helpful error message
    if (error.message && !error.message.includes('Paytaca wallet detected')) {
      throw new Error(
        error.message ||
        'Failed to connect wallet. Please ensure Paytaca is installed, unlocked, and on Chipnet network.'
      )
    }
    throw error
  }
}

/**
 * Sign a message with the connected wallet
 */
export async function signMessage(message: string): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet can only be accessed in browser')
  }

  try {
    if (window.paytaca) {
      return await window.paytaca.signMessage(message)
    }

    if ((window as any).bitcoin) {
      const result = await (window as any).bitcoin.request({
        method: 'wallet_signMessage',
        params: { message },
      })
      return result.signature
    }

    throw new Error('No wallet available for signing')
  } catch (error) {
    console.error('Message signing error:', error)
    throw error
  }
}

/**
 * Send a transaction to Chipnet
 */
export async function sendTransaction(hex: string): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet can only be accessed in browser')
  }

  try {
    if (window.paytaca) {
      return await window.paytaca.sendTransaction(hex)
    }

    if ((window as any).bitcoin) {
      const result = await (window as any).bitcoin.request({
        method: 'wallet_sendTransaction',
        params: { hex },
      })
      return result.txid
    }

    throw new Error('No wallet available for sending transactions')
  } catch (error) {
    console.error('Transaction sending error:', error)
    throw error
  }
}

/**
 * Validate Bitcoin Cash address format
 */
export function isValidBCHAddress(address: string): boolean {
  // Basic validation for BCH addresses
  // Chipnet addresses typically start with 'bchtest:' or 'bchreg:'
  // Mainnet addresses start with 'bitcoincash:' or legacy format
  const bchAddressRegex = /^(bitcoincash:|bchtest:|bchreg:)?[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42}$/i
  return bchAddressRegex.test(address)
}


