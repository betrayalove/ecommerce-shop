const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = Number(process.env.PORT) || 3080;
const JWT_SECRET = process.env.JWT_SECRET || 'internet-magazin-secret-key';
const TOKEN_EXPIRES = '24h';
const AUTH_COOKIE = 'auth_token';
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// In-memory data
const users = [
  {
    id: '1',
    email: 'admin@test.com',
    password: '123456',
    name: 'Admin',
  },
];

const products = [
  { id: '1', title: 'Смартфон X1', price: 29990, category: 'electronics', description: 'Современный смартфон с отличной камерой.', image: 'https://placehold.co/400x300?text=Phone' },
  { id: '2', title: 'Ноутбук Pro', price: 89990, category: 'electronics', description: 'Мощный ноутбук для работы и игр.', image: 'https://placehold.co/400x300?text=Laptop' },
  { id: '3', title: 'Наушники Wireless', price: 4990, category: 'electronics', description: 'Беспроводные наушники с шумоподавлением.', image: 'https://placehold.co/400x300?text=Headphones' },
  { id: '4', title: 'Футболка Classic', price: 1290, category: 'clothing', description: 'Хлопковая футболка базового кроя.', image: 'https://placehold.co/400x300?text=T-Shirt' },
  { id: '5', title: 'Джинсы Slim', price: 3490, category: 'clothing', description: 'Узкие джинсы из денима.', image: 'https://placehold.co/400x300?text=Jeans' },
  { id: '6', title: 'Книга «React в действии»', price: 890, category: 'books', description: 'Практическое руководство по React.', image: 'https://placehold.co/400x300?text=Book' },
  { id: '7', title: 'Часы Smart Watch', price: 15990, category: 'electronics', description: 'Умные часы с пульсометром.', image: 'https://placehold.co/400x300?text=Watch' },
  { id: '8', title: 'Рюкзак Urban', price: 2990, category: 'accessories', description: 'Вместительный городской рюкзак.', image: 'https://placehold.co/400x300?text=Backpack' },
  { id: '9', title: 'Кроссовки Run', price: 5990, category: 'clothing', description: 'Лёгкие беговые кроссовки.', image: 'https://placehold.co/400x300?text=Shoes' },
  { id: '10', title: 'Клавиатура Mechanical', price: 7490, category: 'electronics', description: 'Механическая клавиатура с подсветкой.', image: 'https://placehold.co/400x300?text=Keyboard' },
];

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

function getTokenFromRequest(req) {
  const cookieToken = req.cookies && req.cookies[AUTH_COOKIE];
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

function authMiddleware(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Укажите email и пароль' });
  }
  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
  }
  const user = {
    id: String(users.length + 1),
    email,
    password,
    name: email.split('@')[0],
  };
  users.push(user);
  const token = generateToken(user);
  setAuthCookie(res, token);
  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Укажите email и пароль' });
  }
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }
  const token = generateToken(user);
  setAuthCookie(res, token);
  res.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// POST /api/auth/logout (clears auth cookie)
app.post('/api/auth/logout', (req, res) => {
  res.cookie(AUTH_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  res.json({ ok: true });
});

// GET /api/auth/me (protected, returns current user from cookie)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ id: user.id, email: user.email, name: user.name });
});

// GET /api/user/me (protected)
app.get('/api/user/me', authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ id: user.id, email: user.email, name: user.name });
});

// GET /api/products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Товар не найден' });
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Порт ${PORT} занят. Освободите: lsof -i :${PORT}  →  kill <PID>`);
  } else {
    console.error(err.message);
  }
  process.exit(1);
});
