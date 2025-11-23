import * as faceapi from 'face-api.js'

/**
 * Initialize face-api.js models
 * Models should be placed in /public/models directory
 */
// Track if models are loaded
let modelsLoaded = false

export async function loadModels(): Promise<void> {
    if (modelsLoaded) {
        console.log('Models already loaded')
        return
    }

    // Try multiple CDN sources
    const CDN_SOURCES = [
        'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js-models@master',
        'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master',
        'https://unpkg.com/face-api.js@0.22.2/weights',
    ]
    const LOCAL_URL = '/models'

    console.log('Loading face-api models...')

    // Try each CDN source
    for (const CDN_BASE of CDN_SOURCES) {
        try {
            console.log(`Trying CDN: ${CDN_BASE}`)

            // Test if CDN is accessible
            const testUrl = `${CDN_BASE}/tiny_face_detector_model-weights_manifest.json`
            const testResponse = await fetch(testUrl, { method: 'HEAD' })

            if (!testResponse.ok) {
                console.log(`CDN ${CDN_BASE} not accessible, trying next...`)
                continue
            }

            // Try loading models from this CDN
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(CDN_BASE),
                faceapi.nets.faceLandmark68Net.loadFromUri(CDN_BASE),
                faceapi.nets.faceRecognitionNet.loadFromUri(CDN_BASE),
                faceapi.nets.faceExpressionNet.loadFromUri(CDN_BASE),
            ])

            modelsLoaded = true
            console.log(`✅ Face-api models loaded from CDN: ${CDN_BASE}`)
            return // Success!
        } catch (cdnError) {
            console.log(`CDN ${CDN_BASE} failed:`, cdnError)
            continue // Try next CDN
        }
    }

    // If all CDNs failed, try local files
    console.log('All CDNs failed, trying local files...')

    try {
        // Verify local files exist and are valid
        const response = await fetch(`${LOCAL_URL}/tiny_face_detector_model-weights_manifest.json`)
        if (!response.ok) {
            throw new Error('Local model files not found.')
        }

        const text = await response.text()
        if (text.length < 50 || !text.trim().startsWith('{')) {
            throw new Error('Local model files are placeholders (14 bytes).')
        }

        // Load from local
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(LOCAL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(LOCAL_URL),
        ])

        modelsLoaded = true
        console.log('✅ Face-api models loaded from local files successfully!')
        return
    } catch (localError) {
        console.error('Local files also failed:', localError)
    }

    // If everything failed, throw helpful error
    throw new Error(
        'Models not available from any CDN or local files.\n\n' +
        'Quick fix - Browser download:\n' +
        '1. Visit: https://github.com/justadudewhohacks/face-api.js-models/tree/master\n' +
        '2. For each of 8 files: Click → "Raw" → Save As → public/models/\n' +
        '3. Restart server\n\n' +
        'Or try: ./download-models-git.sh'
    )
}

/**
 * Detect emotion from video stream
 * Returns emotion score (1-5) based on detected expressions
 */
export async function detectEmotion(
    videoElement: HTMLVideoElement
): Promise<number> {
    try {
        const detection = await faceapi
            .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()

        if (!detection) {
            throw new Error('No face detected')
        }

        const expressions = detection.expressions

        // Calculate happiness score based on expressions
        // Weighted combination of positive emotions
        const happiness = expressions.happy || 0
        const surprise = expressions.surprised || 0
        const neutral = expressions.neutral || 0
        const sad = expressions.sad || 0
        const angry = expressions.angry || 0
        const fearful = expressions.fearful || 0
        const disgusted = expressions.disgusted || 0

        // Calculate weighted score (1-5 scale)
        // Higher weight for positive emotions
        let score = 1

        // Base score from happiness (0-1 range)
        score += happiness * 2.5 // happiness contributes 0-2.5

        // Surprise adds positive boost
        score += surprise * 1.0 // surprise contributes 0-1.0

        // Neutral adds small boost
        score += neutral * 0.5 // neutral contributes 0-0.5

        // Negative emotions reduce score
        score -= (sad + angry + fearful + disgusted) * 0.3

        // Clamp to 1-5 range
        score = Math.max(1, Math.min(5, Math.round(score * 10) / 10))

        return score
    } catch (error) {
        console.error('Error detecting emotion:', error)
        throw error
    }
}

/**
 * Get emotion label from score
 */
export function getEmotionLabel(score: number): string {
    if (score >= 4.5) return 'Very Happy 😄'
    if (score >= 3.5) return 'Happy 😊'
    if (score >= 2.5) return 'Neutral 😐'
    if (score >= 1.5) return 'Sad 😔'
    return 'Very Sad 😢'
}


