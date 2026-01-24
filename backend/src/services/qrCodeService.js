const QRCode = require('qrcode');

class QRCodeService {
  /**
   * Generate QR code for a link hub
   * @param {string} hubUrl - The full URL of the link hub
   * @param {string} hubId - The ID of the link hub
   * @returns {Promise<string>} QR code as data URL
   */
  async generateQRCode(hubUrl, hubId) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(hubUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR Code Generation Error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code with custom branding
   * @param {string} url - Hub URL
   * @param {object} options - Customization options
   * @returns {Promise<string>} QR code as data URL
   */
  async generateBrandedQRCode(url, options = {}) {
    const {
      accentColor = '#22c55e',
      darkMode = false,
      size = 300
    } = options;

    try {
      const darkColor = darkMode ? '#ffffff' : '#000000';
      const lightColor = darkMode ? '#1f2937' : '#ffffff';

      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        width: size,
        color: {
          dark: darkColor,
          light: lightColor
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Branded QR Code Generation Error:', error);
      throw new Error('Failed to generate branded QR code');
    }
  }

  /**
   * Get QR code in multiple formats
   */
  async generateQRCodeMultiFormat(url, hubId) {
    try {
      // PNG format
      const pngDataUrl = await QRCode.toDataURL(url);

      // SVG format
      const svgString = await QRCode.toString(url, {
        type: 'svg',
        width: 300,
        margin: 1
      });

      return {
        png: pngDataUrl,
        svg: svgString,
        url: url
      };
    } catch (error) {
      console.error('Multi-format QR Code Generation Error:', error);
      throw error;
    }
  }
}

module.exports = new QRCodeService();
