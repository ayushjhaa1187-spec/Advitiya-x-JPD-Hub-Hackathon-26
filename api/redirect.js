// Vercel Serverless Function for Link Redirection
// Handles: /:shortCode -> redirect to original URL

module.exports = async (req, res) => {
  const { shortCode } = req.query;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (!shortCode) {
    return res.status(400).json({ 
      error: 'Short code is required',
      usage: '/api/redirect?shortCode=abc123'
    });
  }
  
  try {
    // TODO: Database lookup
    // For now, return mock data structure
    
    // Simulate database query
    const mockLinks = {
      'demo': 'https://github.com',
      'test': 'https://google.com',
      'abc123': 'https://example.com'
    };
    
    const originalUrl = mockLinks[shortCode];
    
    if (!originalUrl) {
      return res.status(404).json({
        error: 'Link not found',
        shortCode,
        message: 'This short link does not exist or has expired'
      });
    }
    
    // Track click analytics (device, location, referrer)
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referrer = req.headers['referer'] || 'direct';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // TODO: Store click analytics in database
    console.log('Click tracked:', { shortCode, userAgent, referrer, ip });
    
    // Return redirect info (for API usage)
    if (req.query.api === 'true') {
      return res.status(200).json({
        shortCode,
        originalUrl,
        message: 'Redirect target found'
      });
    }
    
    // Redirect to original URL
    return res.redirect(302, originalUrl);
    
  } catch (error) {
    console.error('Redirect error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to process redirect'
    });
  }
};
