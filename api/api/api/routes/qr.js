// api/routes/qr.js - QR Code Generation Endpoint
const QRCode = require('qrcode');

module.exports = (app) => {
  app.post('/api/qr/generate', async (req, res) => {
    const { url, size = 200, format = 'png' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      let qrCode;
      
      if (format === 'svg') {
        qrCode = await QRCode.toString(url, { type: 'image/svg+xml' });
      } else {
        qrCode = await QRCode.toDataURL(url, { 
          width: size,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
      }

      res.json({ 
        success: true,
        qrCode,
        format,
        url,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'QR code generation failed', 
        details: error.message 
      });
    }
  });
};
