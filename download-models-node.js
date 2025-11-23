// Node.js script to download face-api.js models
// Run with: node download-models-node.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, 'public', 'models');
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master';

const MODELS = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1',
];

// Ensure directory exists
if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
}

function downloadFile(filename) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}/${filename}`;
        const filepath = path.join(MODELS_DIR, filename);
        
        console.log(`Downloading ${filename}...`);
        
        https.get(url, (response) => {
            if (response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302) {
                const fileStream = fs.createWriteStream(filepath);
                response.pipe(fileStream);
                
                fileStream.on('finish', () => {
                    fileStream.close();
                    const stats = fs.statSync(filepath);
                    if (stats.size > 1000) {
                        console.log(`✓ ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);
                        resolve(true);
                    } else {
                        console.log(`✗ ${filename} - File too small (${stats.size} bytes)`);
                        fs.unlinkSync(filepath);
                        reject(new Error('File too small'));
                    }
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirect
                downloadFile(filename).then(resolve).catch(reject);
            } else {
                console.log(`✗ ${filename} - HTTP ${response.statusCode}`);
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            console.log(`✗ ${filename} - ${err.message}`);
            reject(err);
        });
    });
}

async function downloadAll() {
    console.log('Starting model downloads...\n');
    
    let success = 0;
    for (const model of MODELS) {
        try {
            await downloadFile(model);
            success++;
        } catch (err) {
            // Continue with next file
        }
    }
    
    console.log(`\nDownloaded: ${success}/${MODELS.length} files`);
    
    if (success === MODELS.length) {
        console.log('✅ All models downloaded successfully!');
        console.log('Restart dev server: npm run dev');
    } else {
        console.log('⚠️  Some downloads failed. Please use browser download method.');
        console.log('See: download-via-browser.md');
    }
}

downloadAll().catch(console.error);

