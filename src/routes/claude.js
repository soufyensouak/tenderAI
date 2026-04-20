const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');

router.post('/', requireAuth, async (req, res) => {
  const { messages, system, max_tokens = 1000 } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens,
        system,
        messages
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Anthropic Proxy Error" });
  }
});

module.exports = router;