// QR Code Generation Route - Serverless Function
module.exports = async (req, res) => {
  res.json({ message: "QR code generation endpoint" });
};
// QR Code Generation Route - Vercel Serverless Function
const QRCode = require('qrcode');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { url, format = 'png', size = 300 } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const options = {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      if (format === 'svg') {
        const qrCode = await QRCode.toString(url, { type: 'svg', ...options });
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.status(200).send(qrCode);
      } else {
        const qrCode = await QRCode.toDataURL(url, options);
        return res.status(200).json({
          success: true,
          qrCode,
          url,
          format
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'QR code generation failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
