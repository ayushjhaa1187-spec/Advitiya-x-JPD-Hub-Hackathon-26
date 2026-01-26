const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 60000, max: 100 });
app.use('/api/', limiter);

// API Routes
app.post('/api/hubs', (req, res) => { /* Create hub */ });
app.get('/api/hubs/:id', (req, res) => { /* Get hub */ });
app.post('/api/hubs/:id/links', (req, res) => { /* Add link */ });
app.get('/api/hubs/:id/analytics', (req, res) => { /* Get analytics */ });

app.listen(3000, () => console.log('Server running on port 3000'));
