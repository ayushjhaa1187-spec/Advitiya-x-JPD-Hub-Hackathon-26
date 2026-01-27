// Manage Links Route - Get/Update/Delete Links
module.exports = async (req, res) => {
  res.json({ message: "Manage links endpoint" });
};
// Manage Links Route - Get/Update/Delete Links

// In-memory storage (replace with database)
const linksDatabase = new Map();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Link ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const link = linksDatabase.get(id);
      if (!link) {
        return res.status(404).json({ error: 'Link not found' });
      }
      res.status(200).json({ success: true, link });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch link' });
    }
  } else if (req.method === 'PUT') {
    try {
      const link = linksDatabase.get(id);
      if (!link) {
        return res.status(404).json({ error: 'Link not found' });
      }

      const updates = req.body;
      const updatedLink = { ...link, ...updates, updatedAt: new Date().toISOString() };
      linksDatabase.set(id, updatedLink);

      res.status(200).json({ success: true, link: updatedLink });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update link' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deleted = linksDatabase.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Link not found' });
      }
      res.status(200).json({ success: true, message: 'Link deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete link' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
