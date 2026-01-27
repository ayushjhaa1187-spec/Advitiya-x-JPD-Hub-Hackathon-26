// URL Shortener Route - Serverless Function
module.exports = async (req, res) => {
  res.json({ message: "URL shortener endpoint" });
};
// URL Shortener Route - Vercel Serverless Function
const { nanoid } = require('nanoid');

// In-memory storage (replace with database in production)
const urlDatabase = new Map();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { originalUrl, customAlias, userId } = req.body;
      
      if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' });
      }

      // Generate short code
      const shortCode = customAlias || nanoid(8);
      
      // Check if custom alias already exists
      if (urlDatabase.has(shortCode)) {
        return res.status(409).json({ error: 'Alias already exists' });
      }

      const urlData = {
        originalUrl,
        shortCode,
        userId: userId || null,
        createdAt: new Date().toISOString(),
        clicks: 0
      };

      urlDatabase.set(shortCode, urlData);

      const shortUrl = `${req.headers.origin || 'http://localhost:3000'}/${shortCode}`;
      
      res.status(201).json({
        success: true,
        shortUrl,
        shortCode,
        originalUrl
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
