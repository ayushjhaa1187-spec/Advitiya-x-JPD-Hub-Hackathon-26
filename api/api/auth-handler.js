// api/auth-handler.js - OAuth Handler with Correct Redirect
const axios = require('axios');

module.exports = async (req, res) => {
  const { code, state } = req.query;
  
  try {
    const provider = state?.split('_')[0];
    
    if (provider === 'google') {
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.API_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code'
      });

      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
      });

      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendURL}/dashboard.html?token=${tokenResponse.data.access_token}&user=${userResponse.data.email}`);
    }
    else if (provider === 'github') {
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: `${process.env.API_URL}/api/auth/github/callback`
      }, { headers: { Accept: 'application/json' } });

      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${tokenResponse.data.access_token}` }
      });

      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendURL}/dashboard.html?token=${tokenResponse.data.access_token}&user=${userResponse.data.login}`);
    }
  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect('/?error=auth_failed');
  }
};
