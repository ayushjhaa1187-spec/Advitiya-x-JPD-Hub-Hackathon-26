// Smart Rules Route - Serverless Function
module.exports = async (req, res) => {
  res.json({ message: "Smart rules endpoint" });
};
// Smart Rules Route - Rule Management

// In-memory storage (replace with database)
const rulesDatabase = new Map();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { name, conditions, actions, userId } = req.body;
      
      if (!name || !conditions || !actions) {
        return res.status(400).json({ error: 'Name, conditions, and actions are required' });
      }

      const ruleId = Date.now().toString();
      const ruleData = {
        id: ruleId,
        name,
        conditions,
        actions,
        userId: userId || null,
        createdAt: new Date().toISOString(),
        active: true
      };

      rulesDatabase.set(ruleId, ruleData);

      res.status(201).json({
        success: true,
        rule: ruleData
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create rule' });
    }
  } else if (req.method === 'GET') {
    try {
      const rules = Array.from(rulesDatabase.values());
      res.status(200).json({
        success: true,
        rules,
        count: rules.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rules' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
