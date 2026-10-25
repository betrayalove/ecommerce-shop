// Vercel's server-to-server gateway keeps the auth cookie on the frontend origin.
function createGateway(options = {}) {
  return async (req, res) => {
    const backend = options.origin || process.env.API_ORIGIN || 'https://ecommerce-shop-47tg.onrender.com';
    const origin = req.headers.origin;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (origin && origin !== `https://${host}`) return res.status(403).json({ error: 'Origin not allowed' });
    const url = new URL(req.url, 'https://gateway.local');
    const apiPath = url.searchParams.get('path') || url.pathname.replace(/^\/api\//, '');
    if (!apiPath || apiPath.split('/').some(part => part === '..' || part === '.') || !/^[a-zA-Z0-9/_-]+$/.test(apiPath)) return res.status(400).json({ error: 'Invalid API path' });
    url.searchParams.delete('path');
    const headers = { 'content-type': 'application/json' };
    if (req.headers.cookie) headers.cookie = req.headers.cookie;
    if (origin) headers.origin = process.env.GATEWAY_ORIGIN || 'https://ecommerce-shop-seven-phi.vercel.app';
    try {
      const response = await (options.fetch || fetch)(`${backend.replace(/\/$/, '')}/api/${apiPath}${url.search}`, {
        method: req.method, headers, redirect: 'manual', signal: AbortSignal.timeout(20000),
        ...(!['GET', 'HEAD'].includes(req.method) ? { body: JSON.stringify(req.body || {}) } : {}),
      });
      res.setHeader('Cache-Control', 'no-store');
      for (const cookie of response.headers.getSetCookie()) res.appendHeader('Set-Cookie', cookie);
      res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
      res.status(response.status).send(await response.text());
    } catch { res.status(502).json({ error: 'Сервер временно недоступен' }); }
  };
}
module.exports = createGateway();
module.exports.createGateway = createGateway;
