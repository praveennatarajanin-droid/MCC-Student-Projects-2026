// RBLA-full/backend/services/pollinationsService.js


/**
 * Calls your backend proxy for Pollinations sentiment/summary analysis.
 * @param {string[]} reviewTexts - Array of customer review lines (with stars/comments).
 * @returns {Promise<{summary: string}>} - Sentiment analysis result.
 */
async function analyzeSentimentWithPollinations(reviewTexts) {
  // Prepare the sentiment analysis prompt
  const prompt = `
You are a sentiment analysis system. Given the reviews below, return ONLY one word reflecting the overall sentiment: "Positive", "Neutral", or "Negative".
If there are no valid reviews or nothing you can classify, respond ONLY with: "No reviews".
Do NOT provide summary, reasoning, or explanations. Only output that single word.

Reviews:
${reviewTexts.join('\n')}
  `;

  console.log('[pollinationsService] Sending prompt to proxy:', prompt);

  try {
    // Post to your own proxy endpoint (not Pollinations directly)
    const response = await fetch('http://localhost:5000/api/ai/summary', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        model: "openai"
      })
    });

    console.log('[pollinationsService] Proxy response status:', response.status);

    const data = await response.json();
    console.log('[pollinationsService] Proxy response data:', data);

    return data; // { summary: "...", ... }
  } catch (error) {
    console.error('[pollinationsService] Proxy call error:', error);
    return { summary: 'Sentiment API error (proxy)' };
  }
}

// Export the function for use in other backend files
module.exports = { analyzeSentimentWithPollinations };
