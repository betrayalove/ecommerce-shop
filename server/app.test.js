const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { once } = require('node:events');
const { createApp } = require('./app');
const { verifyPassword } = require('./users');
const { createGateway } = require('../api/[...path].js');

const SECRET = 'integration-test-only-secret-at-least-32-bytes';
const ORIGIN = 'https://shop-demo.vercel.app';

async function fixture(t, options = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'shop-integration-'));
  const dataFile = join(directory, 'users.json');
  const servers = [];
  t.after(async () => {
    await Promise.all(servers.map(server => new Promise(resolve => {
      if (!server.listening) return resolve();
      server.close(resolve);
      server.closeIdleConnections();
    })));
    rmSync(directory, { recursive: true, force: true });
  });
  async function open() {
    const app = createApp({ secret: SECRET, production: true, origins: ORIGIN, dataFile, ...options });
    const server = app.listen(0, '127.0.0.1');
    servers.push(server);
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    return {
      server,
      request: (path, init = {}) => fetch(`${base}/api${path}`, {
        ...init,
        headers: { 'content-type': 'application/json', origin: ORIGIN, ...init.headers },
      }),
    };
  }
  return { ...(await open()), open, dataFile };
}

function post(body, cookie) {
  return { method: 'POST', body: JSON.stringify(body), ...(cookie ? { headers: { cookie } } : {}) };
}

function sessionCookie(response) {
  const value = response.headers.get('set-cookie');
  assert.ok(value, 'Successful authentication must set a cookie');
  assert.match(value, /^shop_session=/);
  assert.match(value, /HttpOnly/i);
  assert.match(value, /Secure/i);
  assert.match(value, /SameSite=(Strict|Lax)/i);
  assert.match(value, /Path=\//i);
  assert.doesNotMatch(value, /Domain=/i, 'The gateway must be able to set a first-party host-only cookie');
  return value.split(';')[0];
}

test('httpOnly session survives /me, logout clears it and revokes a copied JWT', async t => {
  const { request } = await fixture(t);
  assert.equal((await request('/auth/me')).status, 401);
  const login = await request('/auth/login', post({ email: ' ADMIN@test.com ', password: '123456' }));
  assert.equal(login.status, 200);
  const cookie = sessionCookie(login);
  const loggedIn = await login.json();
  assert.equal(loggedIn.user.email, 'admin@test.com');
  assert.equal(loggedIn.token, undefined);
  assert.equal(loggedIn.user.passwordHash, undefined);
  const me = await request('/auth/me', { headers: { cookie } });
  assert.equal(me.status, 200);
  assert.equal(me.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await me.json(), loggedIn.user);
  const alias = await request('/user/me', { headers: { cookie } });
  assert.equal(alias.status, 200);
  assert.deepEqual(await alias.json(), loggedIn.user);
  const logout = await request('/auth/logout', post({}, cookie));
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get('set-cookie'), /^shop_session=;/);
  assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/i);
  assert.equal((await request('/auth/me', { headers: { cookie } })).status, 401, 'Clearing the browser cookie alone must not leave copied tokens usable');
  const fresh = await request('/auth/login', post({ email: 'admin@test.com', password: '123456' }));
  assert.equal(fresh.status, 200);
  const freshCookie = sessionCookie(fresh);
  assert.notEqual(freshCookie, cookie);
  assert.equal((await request('/auth/me', { headers: { cookie: freshCookie } })).status, 200);
  assert.equal((await request('/auth/me', { headers: { cookie } })).status, 401);
});

test('registration validates types, email and password bounds without creating invalid accounts', async t => {
  const { request, dataFile } = await fixture(t);
  const invalidBodies = [
    null, {}, { email: [], password: 'valid-pass' }, { email: { value: 'a@test.com' }, password: 'valid-pass' },
    { email: 'a@test.com', password: 123456 }, { email: 'a@test.com', password: [] },
    { email: '', password: 'valid-pass' }, { email: 'a@', password: 'valid-pass' },
    { email: 'a b@test.com', password: 'valid-pass' },
    { email: `${'a'.repeat(245)}@example.com`, password: 'valid-pass' },
    { email: 'a@test.com', password: 'short' }, { email: 'a@test.com', password: 'x'.repeat(129) },
  ];
  for (const body of invalidBodies) {
    const response = await request('/auth/register', post(body));
    assert.equal(response.status, 400, `Unexpected registration response for ${JSON.stringify(body)}`);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal(typeof (await response.json()).error, 'string');
  }
  const malformed = await request('/auth/register', { method: 'POST', body: '{broken' });
  assert.equal(malformed.status, 400);
  assert.equal(JSON.parse(readFileSync(dataFile, 'utf8')).length, 1);
});

test('registration normalizes email and rejects duplicates across case and whitespace', async t => {
  const { request } = await fixture(t);
  const created = await request('/auth/register', post({ email: '  New.User@Example.COM  ', password: 'valid-pass' }));
  assert.equal(created.status, 201);
  const cookie = sessionCookie(created);
  const { user } = await created.json();
  assert.equal(user.email, 'new.user@example.com');
  assert.equal((await (await request('/auth/me', { headers: { cookie } })).json()).id, user.id);
  for (const email of ['new.user@example.com', ' NEW.USER@example.com ']) {
    const duplicate = await request('/auth/register', post({ email, password: 'another-pass' }));
    assert.equal(duplicate.status, 409);
    assert.equal(duplicate.headers.get('set-cookie'), null);
  }
  const login = await request('/auth/login', post({ email: ' NEW.USER@EXAMPLE.COM ', password: 'valid-pass' }));
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.id, user.id);
  assert.equal((await request('/auth/login', post({ email: user.email, password: 'wrong-password' }))).status, 401);
});

test('passwords are salted hashes and accounts plus session revocations survive reopening the data file', async t => {
  const { request, server, dataFile, open } = await fixture(t);
  const password = 'Stored-Password-123!';
  const first = await request('/auth/register', post({ email: 'persisted@example.com', password }));
  assert.equal(first.status, 201);
  const cookie = sessionCookie(first);
  const user = (await first.json()).user;
  assert.equal((await request('/auth/register', post({ email: 'same-password@example.com', password }))).status, 201);
  const raw = readFileSync(dataFile, 'utf8');
  assert.equal(raw.includes(password), false);
  const persisted = JSON.parse(raw);
  const account = persisted.find(item => item.id === user.id);
  const another = persisted.find(item => item.email === 'same-password@example.com');
  assert.equal(account.password, undefined);
  assert.match(account.passwordHash, /^[a-f0-9]{32}:[a-f0-9]{128}$/);
  assert.notEqual(account.passwordHash, another.passwordHash, 'Identical passwords must have different salts');
  assert.equal(verifyPassword(password, account.passwordHash), true);
  assert.equal(verifyPassword('wrong-password', account.passwordHash), false);
  await request('/auth/logout', post({}, cookie));
  await new Promise(resolve => { server.close(resolve); server.closeIdleConnections(); });
  const restarted = await open();
  assert.equal((await restarted.request('/auth/me', { headers: { cookie } })).status, 401);
  const login = await restarted.request('/auth/login', post({ email: user.email, password }));
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.id, user.id);
});

test('production rejects writes from disallowed origins and never sets their session cookie', async t => {
  const { request, dataFile } = await fixture(t);
  for (const path of ['/auth/login', '/auth/register', '/auth/logout']) {
    const response = await request(path, { ...post({ email: 'blocked@example.com', password: 'valid-pass' }), headers: { origin: 'https://evil.test' } });
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    assert.equal(response.headers.get('set-cookie'), null);
  }
  assert.equal(JSON.parse(readFileSync(dataFile, 'utf8')).length, 1);
});

test('production refuses missing or short signing secrets', () => {
  const previous = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  try {
    for (const secret of [undefined, '', 'short-secret']) {
      assert.throws(() => createApp({ production: true, secret }), /JWT_SECRET.*32/);
    }
    assert.doesNotThrow(() => createApp({ production: true, secret: SECRET }));
  } finally {
    if (previous === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previous;
  }
});

function responseRecorder() {
  const result = { headers: {} };
  return {
    result,
    res: {
      setHeader(key, value) { result.headers[key.toLowerCase()] = value; },
      appendHeader(key, value) { const name = key.toLowerCase(); result.headers[name] = [...(result.headers[name] || []), value]; },
      status(code) { result.status = code; return this; },
      json(body) { result.body = body; return this; },
      send(body) { result.body = body; return this; },
      end() { return this; },
    },
  };
}
const gatewayHeaders = { host: 'shop-demo.vercel.app', origin: ORIGIN, cookie: 'shop_session=existing-session' };

test('gateway forwards cookies, JSON body and query and preserves response status, Set-Cookie and no-store', async () => {
  const { result, res } = responseRecorder();
  const cookies = ['shop_session=new-session; Secure; HttpOnly; SameSite=Strict; Path=/', 'other=value; Path=/'];
  const gateway = createGateway({
    origin: 'https://shop-backend.example/',
    fetch: async (url, init) => {
      assert.equal(url, 'https://shop-backend.example/api/auth/register?source=demo');
      assert.equal(init.method, 'POST');
      assert.equal(init.headers.cookie, gatewayHeaders.cookie);
      assert.equal(init.headers.origin, 'https://ecommerce-shop-seven-phi.vercel.app');
      assert.equal(init.headers['content-type'], 'application/json');
      assert.deepEqual(JSON.parse(init.body), { email: 'new@example.com', password: 'test-password' });
      assert.equal(init.redirect, 'manual');
      const response = new Response('{"user":{"id":"new-user"}}', { status: 201, headers: { 'content-type': 'application/json' } });
      for (const cookie of cookies) response.headers.append('set-cookie', cookie);
      return response;
    },
  });
  await gateway({ method: 'POST', url: '/api/auth/register?source=demo', body: { email: 'new@example.com', password: 'test-password' }, headers: gatewayHeaders }, res);
  assert.equal(result.status, 201);
  assert.equal(result.headers['cache-control'], 'no-store');
  assert.equal(result.headers['content-type'], 'application/json');
  assert.deepEqual(result.headers['set-cookie'], cookies);
  assert.deepEqual(JSON.parse(result.body), { user: { id: 'new-user' } });
});

test('gateway forwards GET without a body and preserves an upstream unauthorized response', async () => {
  const { result, res } = responseRecorder();
  const gateway = createGateway({ origin: 'https://shop-backend.example', fetch: async (_url, init) => {
    assert.equal(init.body, undefined);
    return new Response('{"error":"Unauthorized"}', { status: 401 });
  } });
  await gateway({ method: 'GET', url: '/api/auth/me', headers: gatewayHeaders }, res);
  assert.equal(result.status, 401);
  assert.equal(result.headers['cache-control'], 'no-store');
  assert.deepEqual(JSON.parse(result.body), { error: 'Unauthorized' });
});

test('gateway rejects cross-origin requests without calling backend and handles backend failures as 502', async () => {
  const forbidden = responseRecorder();
  let fetched = false;
  const gateway = createGateway({ origin: 'https://shop-backend.example', fetch: async () => { fetched = true; throw new Error('Network failure'); } });
  await gateway({ method: 'POST', url: '/api/auth/login', body: {}, headers: { ...gatewayHeaders, origin: 'https://evil.test' } }, forbidden.res);
  assert.equal(forbidden.result.status, 403);
  assert.equal(fetched, false);
  const unavailable = responseRecorder();
  await gateway({ method: 'GET', url: '/api/products', headers: gatewayHeaders }, unavailable.res);
  assert.equal(fetched, true);
  assert.equal(unavailable.result.status, 502);
  assert.equal(typeof unavailable.result.body.error, 'string');
});
