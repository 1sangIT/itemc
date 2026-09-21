// Pamir의 정식 제품 이미지만 ITEM C에서 안정적으로 표시하기 위한 이미지 중계.
// 원본 도메인의 브라우저 핫링크 차단을 우회하되, 임의 URL 프록시로 쓰이지 않도록
// 허용한 제품 컷만 제공한다.
const IMAGES = {
  hero: 'https://www.pamir.ai/_app/immutable/assets/lapisOne-white-isometric.DzGPJoDR.png',
  overview: 'https://www.pamir.ai/pamir-lapisOne-OGImage-1.jpg',
  laptop: 'https://www.pamir.ai/_app/immutable/assets/laptop-1.CGzEZk6G.png',
  ports: 'https://www.pamir.ai/_app/immutable/assets/lapis1-black-back.D3zHN3vV.png',
};

module.exports = async function handler(req, res) {
  const image = Array.isArray(req.query.image) ? req.query.image[0] : req.query.image;
  const source = IMAGES[image];

  if (!source) {
    res.statusCode = 404;
    res.end('Image not found');
    return;
  }

  const upstream = await fetch(source, {
    headers: { 'User-Agent': 'ITEM C image proxy' },
  });

  if (!upstream.ok) {
    res.statusCode = upstream.status;
    res.end('Failed to load image');
    return;
  }

  const contentType = upstream.headers.get('content-type') || 'image/jpeg';
  const data = Buffer.from(await upstream.arrayBuffer());
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  res.end(data);
};
