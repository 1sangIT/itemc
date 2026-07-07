const SUPABASE_URL = 'https://axgiamwbkwjivbmfvvww.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z2lhbXdia3dqaXZibWZ2dnd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3OTAxNjEsImV4cCI6MjA5NjM2NjE2MX0.fz9iaZa9NCzLkszEnvqxBhdaFwj2J0tR6QFZH13Pwwo';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = async function handler(req, res) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;

  if (!slug) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Missing slug');
    return;
  }

  const apiUrl =
    `${SUPABASE_URL}/rest/v1/articles` +
    `?slug=eq.${encodeURIComponent(slug)}` +
    '&published=eq.true' +
    '&select=title,description,cover_image_url,cover_emoji,slug';

  const response = await fetch(apiUrl, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!response.ok) {
    res.statusCode = response.status;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Failed to load article');
    return;
  }

  const rows = await response.json();
  const article = rows[0];

  if (!article) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Article not found');
    return;
  }

  const title = `${article.title} — ITEM C`;
  const description = article.description || 'ITEM C — 물건을 읽는 매거진';
  const canonicalUrl = `https://www.itemc.kr/article/${encodeURIComponent(article.slug)}`;
  const appUrl = `https://www.itemc.kr/article.html?slug=${encodeURIComponent(article.slug)}`;
  const imageUrl = article.cover_image_url || '';
  const imageType = imageUrl.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
  const emoji = article.cover_emoji || '◼︎';

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(`<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="ITEM C">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}">` : ''}
  ${imageUrl ? `<meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">` : ''}
  ${imageUrl ? `<meta property="og:image:type" content="${escapeHtml(imageType)}">` : ''}
  ${imageUrl ? '<meta property="og:image:width" content="1200">' : ''}
  ${imageUrl ? '<meta property="og:image:height" content="630">' : ''}

  <meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">` : ''}

  <meta http-equiv="refresh" content="0; url=${escapeHtml(appUrl)}">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif; background:#0a0a0a; color:#f0f0f0; display:grid; place-items:center; min-height:100vh; margin:0; }
    a { color:#e8ff00; }
    .box { max-width:640px; padding:32px; text-align:center; }
    .emoji { font-size:64px; margin-bottom:20px; }
  </style>
</head>
<body>
  <main class="box">
    <div class="emoji">${escapeHtml(emoji)}</div>
    <h1>${escapeHtml(article.title)}</h1>
    <p>${escapeHtml(description)}</p>
    <p><a href="${escapeHtml(appUrl)}">기사로 이동</a></p>
  </main>
  <script>location.replace(${JSON.stringify(appUrl)});</script>
</body>
</html>`);
};
