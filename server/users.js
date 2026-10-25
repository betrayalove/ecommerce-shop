const { randomBytes, randomUUID, scryptSync, timingSafeEqual } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !/^[0-9a-f]{32}:[0-9a-f]{128}$/i.test(stored)) return false;
  const [salt, digest] = stored.split(':');
  const expected = Buffer.from(digest, 'hex');
  return expected.length === 64 && timingSafeEqual(expected, scryptSync(password, salt, 64));
}
function createUsers(file) {
  let users;
  if (file && fs.existsSync(file)) {
    users = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(users) || !users.every(u => u && typeof u.name === 'string' && /^[0-9a-f]{32}:[0-9a-f]{128}$/i.test(u.passwordHash) && typeof u.id === 'string' && typeof u.email === 'string' && typeof u.passwordHash === 'string' && Number.isInteger(u.version))) {
      throw new Error('Invalid user data file. Restore its backup before starting the server.');
    }
  } else users = [{ id: '1', email: 'admin@test.com', name: 'Admin', passwordHash: hashPassword(process.env.DEMO_PASSWORD || '123456'), version: 0 }];
  function save(next) {
    if (file) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(next), { mode: 0o600 });
      fs.renameSync(tmp, file);
    }
    users = next;
  }
  if (file && !fs.existsSync(file)) save(users);
  return {
    byEmail: email => users.find(u => u.email === email),
    byId: id => users.find(u => u.id === id),
    add(email, password) {
      const user = { id: randomUUID(), email, name: email.split('@')[0], passwordHash: hashPassword(password), version: 0 };
      save([...users, user]); return user;
    },
    revoke(id) { save(users.map(u => u.id === id ? { ...u, version: u.version + 1 } : u)); },
  };
}
module.exports = { createUsers, verifyPassword };
