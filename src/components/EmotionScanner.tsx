'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Smile, Loader2, AlertCircle } from 'lucide-react'
import { loadModels, detectEmotion, getEmotionLabel } from '@/utils/emotionDetection'
import { generateProofHash } from '@/utils/proofGenerator'

interface EmotionScannerProps {
  walletAddress: string | null
  sessionId: string
  onScoreGenerated: (score: number, hash: string, timestamp: number) => void
}

export default function EmotionScanner({
  walletAddress,
  sessionId,
  onScoreGenerated,
}: EmotionScannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [emotionScore, setEmotionScore] = useState<number | null>(null)
  const [emotionLabel, setEmotionLabel] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Load AI models on mount with retry logic
    let retryCount = 0
    const maxRetries = 3

    const attemptLoad = async () => {
      try {
        await loadModels()
        setModelsLoaded(true)
        setError(null)
      } catch (err: any) {
        console.error(`Failed to load models (attempt ${retryCount + 1}):`, err)

        // Retry a few times
        if (retryCount < maxRetries) {
          retryCount++
          console.log(`Retrying model load (${retryCount}/${maxRetries})...`)
          setTimeout(attemptLoad, 2000) // Retry after 2 seconds
        } else {
          const errorMsg = err.message || 'Failed to load AI models'
          setError(errorMsg)
        }
      }
    }

    attemptLoad()

    return () => {
      // Cleanup: stop video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available. Please use HTTPS or localhost.')
      }

      console.log('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
      })

      console.log('Camera stream obtained:', stream)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        console.log('Video element srcObject set')

        // Force video to play
        try {
          await videoRef.current.play()
          console.log('Video play() successful')
        } catch (playError) {
          console.warn('Video play() error (may be autoplay policy):', playError)
          // This is often just autoplay policy, video should still work
        }
      } else {
        console.error('Video ref is null')
        throw new Error('Video element not available')
      }
    } catch (err: any) {
      console.error('Camera access error:', err)
      let errorMsg = 'Failed to access camera. '

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission denied. Please:\n1. Click the camera icon in browser address bar\n2. Allow camera access\n3. Refresh page and try again'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found. Please connect a camera device.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is being used by another application. Please close other apps using the camera.'
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = 'Camera constraints not supported. Trying with default settings...'
        // Try again with simpler constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            return // Success with fallback
          }
        } catch (fallbackErr) {
          errorMsg = 'Camera access failed. Please check your camera settings.'
        }
      } else {
        errorMsg += err.message || 'Please check your camera settings.'
      }

      setError(errorMsg)
      throw err // Re-throw to be caught by handleScan
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const handleScan = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first')
      return
    }

    if (!modelsLoaded) {
      setError('AI models are still loading. Please wait...')
      return
    }

    setIsScanning(true)
    setError(null)
    setEmotionScore(null)

    try {
      // Start camera if not already started
      if (!streamRef.current) {
        console.log('Starting camera...')
        await startCamera()

        // Wait for video to be ready
        if (videoRef.current) {
          console.log('Waiting for video to be ready...')
          await new Promise((resolve, reject) => {
            if (!videoRef.current) {
              reject(new Error('Video element not available'))
              return
            }

            const timeout = setTimeout(() => {
              reject(new Error('Camera initialization timeout. Please check camera permissions.'))
            }, 10000) // Increased timeout to 10 seconds

            const checkReady = () => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                clearTimeout(timeout)
                console.log('Video is ready')
                setTimeout(resolve, 500) // Give it a moment to render
              }
            }

            videoRef.current.onloadedmetadata = () => {
              console.log('Video metadata loaded')
              checkReady()
            }

            videoRef.current.oncanplay = () => {
              console.log('Video can play')
              checkReady()
            }

            // Check if already ready
            checkReady()
          })
        } else {
          throw new Error('Video element not created')
        }
      }

      if (!videoRef.current || !videoRef.current.srcObject) {
        throw new Error('Video element or stream not available. Please try again.')
      }

      console.log('Detecting emotion...')
      // Detect emotion
      const score = await detectEmotion(videoRef.current)
      console.log('Emotion score:', score)
      setEmotionScore(score)
      setEmotionLabel(getEmotionLabel(score))

      // Generate proof hash with Unix timestamp in seconds
      const timestamp = Math.floor(Date.now() / 1000)
      const hash = await generateProofHash(
        score,
        timestamp,
        walletAddress,
        sessionId
      )

      // Notify parent component with score, hash, and timestamp
      onScoreGenerated(score, hash, timestamp)

      // Stop camera after scanning
      stopCamera()
    } catch (err: any) {
      console.error('Emotion detection error:', err)
      let errorMsg = err.message || 'Failed to detect emotion. Please try again.'

      // Provide more helpful error messages
      if (err.message?.includes('NotAllowedError') || err.message?.includes('PermissionDeniedError')) {
        errorMsg = 'Camera permission denied. Please allow camera access in browser settings and try again.'
      } else if (err.message?.includes('NotFoundError')) {
        errorMsg = 'No camera found. Please connect a camera device.'
      } else if (err.message?.includes('NotReadableError')) {
        errorMsg = 'Camera is being used by another application. Please close other apps using the camera.'
      } else if (err.message?.includes('timeout')) {
        errorMsg = 'Camera initialization timeout. Please check camera permissions and try again.'
      }

      setError(errorMsg)
      stopCamera()
    } finally {
      setIsScanning(false)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400'
    if (score >= 4) return 'text-green-400'
    if (score >= 3) return 'text-yellow-400'
    if (score >= 2) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
        <AnimatePresence mode="wait">
          {streamRef.current || (videoRef.current && videoRef.current.srcObject) ? (
            <motion.video
              key="video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full object-cover"
              onLoadedMetadata={() => {
                console.log('Video metadata loaded')
              }}
              onError={(e) => {
                console.error('Video error:', e)
                setError('Video stream error. Please try again.')
              }}
            />
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900"
            >
              <Camera className="w-16 h-16 text-gray-600" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanning Overlay */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-white text-center"
            >
              <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Analyzing emotion...</p>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Emotion Score Display */}
      <AnimatePresence>
        {emotionScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/50 rounded-xl p-6 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Smile className="w-8 h-8 text-primary-400" />
              <span className="text-3xl font-bold text-white">
                {emotionScore.toFixed(1)}
              </span>
              <span className="text-lg text-gray-300">/ 5.0</span>
            </div>
            <p className={`text-lg font-semibold ${getScoreColor(emotionScore)}`}>
              {emotionLabel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleScan}
        disabled={isScanning || !walletAddress || !modelsLoaded}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
      >
        {isScanning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            Scan Emotion
          </>
        )}
      </motion.button>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-sm text-red-200"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold mb-1">AI Models Not Found</p>
              <p className="text-xs text-red-300 mb-2">{error}</p>
              <div className="text-xs text-red-400 space-y-1">
                <p><strong>Quick Fix:</strong></p>
                <p>1. Run: <code className="bg-red-900/30 px-1 rounded">./scripts/download-models.sh</code></p>
                <p>2. Or download from: <a href="https://github.com/justadudewhohacks/face-api.js-models" target="_blank" rel="noopener noreferrer" className="underline">face-api.js-models</a></p>
                <p>3. Place 8 files in <code className="bg-red-900/30 px-1 rounded">public/models/</code></p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Models Loading Indicator */}
      {!modelsLoaded && !error && (
        <div className="text-center text-sm text-gray-400">
          <Loader2 className="w-4 h-4 inline-block animate-spin mr-2" />
          Loading AI models...
        </div>
      )}
    </div>
  )
}


