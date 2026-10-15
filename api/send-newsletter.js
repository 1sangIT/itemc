/**
 * Newsletter delivery endpoint for Vercel.
 * Keep credentials in Vercel Environment Variables only: RESEND_API_KEY
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.itemc.kr');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { from, to, subject, html } = req.body || {};
  if (!from || !Array.isArray(to) || to.length === 0 || !subject || !html) {
    return res.status(400).json({ error: 'Missing required newsletter fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Newsletter service is not configured' });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Newsletter provider request failed:', error);
    return res.status(502).json({ error: 'Newsletter provider request failed' });
  }
};
