// backend/routes/pollinationsProxy.js

const express = require('express');
const router = express.Router();

// POST /api/ai/summary
router.post('/summary', async (req, res) => {
  try {
    // Log incoming request body from frontend/service
    console.log('[Proxy] Received prompt:', req.body);

    // Construct request body with required fields for Pollinations
    const requestBody = {
      model: req.body.model || 'openai',
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: req.body.prompt }
      ]
    };

    // Debug log of request body to Pollinations
    console.log('[Proxy] Sending to Pollinations:', requestBody);

    // Setup fetch options
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    };

    // Make the fetch call to Pollinations AI text generation endpoint
    const response = await fetch('https://text.pollinations.ai/', requestOptions);
    console.log('[Proxy] Pollinations response status:', response.status, response.statusText);

    // Check content type
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      // Pollinations returned an error page or failed status
      const errorText = await response.text();
      console.error('[Proxy] Pollinations error page:', errorText.substring(0, 200));
      return res.status(500).json({
        error: 'AI summary proxy error',
        detail: 'Pollinations returned error page: ' + response.status
      });
    }

    if (!contentType || !contentType.includes('application/json')) {
      // Pollinations returned plain text (likely a valid text completion)
      const textData = await response.text();
      console.log('[Proxy] Pollinations plain text response:', textData.substring(0, 200));
      // Return as JSON with a summary field so frontend/backend can handle it easily
      return res.json({ summary: textData });
    }

    // Parse JSON response body when content-type is JSON
    const data = await response.json();
    console.log('[Proxy] Response from Pollinations:', data);

    // Send back Pollinations response to frontend/backend
    res.json(data);

  } catch (err) {
    console.error('[Proxy] Error communicating with Pollinations:', err);
    res.status(500).json({ error: 'AI summary proxy error', detail: err.message });
  }
});

module.exports = router;
