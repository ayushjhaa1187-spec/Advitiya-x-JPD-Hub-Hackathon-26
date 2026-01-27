// Links Management Route - Add/Create Links
module.exports = async (req, res) => {
  res.json({ message: "Add links endpoint" });
};
// Add Links Route - Vercel Serverless Function

// In-memory storage (replace with database)
const linksDatabase = new Map();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { title, url, tags = [], userId } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const linkId = Date.now().toString();
      const linkData = {
        id: linkId,
        title: title || url,
        url,
        tags,
        userId: userId || null,
        createdAt: new Date().toISOString(),
        clicks: 0,
        active: true
      };

      linksDatabase.set(linkId, linkData);

      res.status(201).json({
        success: true,
        link: linkData
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create link' });
    }
  } else if (req.method === 'GET') {
    try {
      const links = Array.from(linksDatabase.values());
      res.status(200).json({
        success: true,
        links,
        count: links.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch links' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
