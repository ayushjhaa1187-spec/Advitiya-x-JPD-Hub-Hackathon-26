/**
 * QR Code Generator Utility
 * Generates QR codes for shortened URLs
 * Requires: npm install qrcode
 */

const QRCode = require('qrcode');

/**
 * Generate QR code as Data URL
 * @param {string} url - The URL to encode
 * @param {object} options - QR code options
 * @returns {Promise<string>} - Base64 data URL
 */
async function generateQR(url, options = {}) {
    try {
        const defaultOptions = {
            width: 300,
            margin: 2,
            color: {
                dark: '#4F46E5',  // Primary brand color
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        };

        const qrOptions = { ...defaultOptions, ...options };
        const qrDataURL = await QRCode.toDataURL(url, qrOptions);
        
        return qrDataURL;
    } catch (error) {
        console.error('QR Code generation failed:', error);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * Generate QR code as PNG buffer
 * @param {string} url - The URL to encode
 * @param {object} options - QR code options
 * @returns {Promise<Buffer>} - PNG buffer
 */
async function generateQRBuffer(url, options = {}) {
    try {
        const defaultOptions = {
            width: 300,
            margin: 2,
            color: {
                dark: '#4F46E5',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        };

        const qrOptions = { ...defaultOptions, ...options };
        const buffer = await QRCode.toBuffer(url, qrOptions);
        
        return buffer;
    } catch (error) {
        console.error('QR Code buffer generation failed:', error);
        throw new Error('Failed to generate QR code buffer');
    }
}

/**
 * Generate QR code as SVG string
 * @param {string} url - The URL to encode
 * @returns {Promise<string>} - SVG string
 */
async function generateQRSVG(url) {
    try {
        const svg = await QRCode.toString(url, {
            type: 'svg',
            color: {
                dark: '#4F46E5',
                light: '#FFFFFF'
            }
        });
        
        return svg;
    } catch (error) {
        console.error('QR Code SVG generation failed:', error);
        throw new Error('Failed to generate QR code SVG');
    }
}

module.exports = {
    generateQR,
    generateQRBuffer,
    generateQRSVG
};
