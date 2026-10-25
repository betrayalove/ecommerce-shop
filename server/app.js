const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { randomBytes, createHash } = require('node:crypto');
const { createUsers, verifyPassword } = require('./users');
const products = require('./products');

function createApp(options = {}) {
  const production = options.production ?? process.env.NODE_ENV === 'production';
  const secret = options.secret || process.env.JWT_SECRET || (!production && randomBytes(32).toString('hex'));
  if (!secret || (production && Buffer.byteLength(secret) < 32)) throw new Error('Production requires JWT_SECRET with at least 32 bytes');
  const users = createUsers(options.dataFile ?? process.env.DATA_FILE);
  const allowed = (options.origins || process.env.CORS_ORIGIN || 'https://ecommerce-shop-seven-phi.vercel.app').split(',').map(s => s.trim()).filter(Boolean);
  const acceptsOrigin = origin => !origin || allowed.includes(origin) || (!production && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  const app = express();
  app.disable('x-powered-by');
  const cookie = 'shop_session';
  const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: production, path: '/' };
  app.use(cors({ origin: (origin, cb) => cb(null, acceptsOrigin(origin)), credentials: true }));
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !acceptsOrigin(req.headers.origin)) return res.status(403).json({ error: 'Недопустимый источник запроса' });
    next();
  });
  app.use(cookieParser());
  app.use(express.json({ limit: '16kb' }));
  app.use(['/api/auth/login', '/api/auth/register'], rateLimit({ windowMs: 15 * 60 * 1000, limit: options.authLimit || 30, skipSuccessfulRequests: true,
    keyGenerator: req => createHash('sha256').update(`${ipKeyGenerator(req.ip)}:${typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : 'invalid'}`).digest('hex'), standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Слишком много запросов. Попробуйте позже.' } }));
  const publicUser = ({ id, email, name }) => ({ id, email, name });
  function readSession(req) {
    const token = req.cookies[cookie];
    if (!token) return null;
    try {
      const claims = jwt.verify(token, secret, { algorithms: ['HS256'], issuer: 'ecommerce-shop' });
      const user = users.byId(claims.id);
      return user && user.version === claims.version ? user : null;
    } catch { return null; }
  }
  function authenticate(req, res, next) {
    req.user = readSession(req);
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    next();
  }
  function signIn(res, user) {
    const token = jwt.sign({ id: user.id, version: user.version }, secret, { expiresIn: '24h', issuer: 'ecommerce-shop', algorithm: 'HS256' });
    res.cookie(cookie, token, { ...cookieOptions, maxAge: 86400000 });
  }
  function credentials(body) {
    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') return null;
    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || body.password.length < 6 || body.password.length > 128) return null;
    return { email, password: body.password };
  }
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/api/auth/register', (req, res) => {
    const data = credentials(req.body);
    if (!data) return res.status(400).json({ error: 'Укажите корректный email и пароль от 6 до 128 символов' });
    if (users.byEmail(data.email)) return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    const user = users.add(data.email, data.password); signIn(res, user);
    res.status(201).json({ user: publicUser(user) });
  });
  app.post('/api/auth/login', (req, res) => {
    const data = credentials(req.body);
    if (!data) return res.status(400).json({ error: 'Укажите корректный email и пароль' });
    const user = users.byEmail(data.email);
    if (!user || !verifyPassword(data.password, user.passwordHash)) return res.status(401).json({ error: 'Неверный email или пароль' });
    signIn(res, user); res.json({ user: publicUser(user) });
  });
  app.post('/api/auth/logout', (req, res) => {
    const user = readSession(req); if (user) users.revoke(user.id);
    res.clearCookie(cookie, cookieOptions); res.json({ ok: true });
  });
  app.get(['/api/auth/me', '/api/user/me'], authenticate, (req, res) => res.json(publicUser(req.user)));
  app.get('/api/products', (_req, res) => res.json(products));
  app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Маршрут не найден' }));
  app.use((err, _req, res, _next) => res.status(err.status === 400 ? 400 : err.status === 413 ? 413 : 500).json({ error: err.status === 400 ? 'Некорректный JSON' : 'Не удалось выполнить запрос' }));
  return app;
}
module.exports = { createApp };
