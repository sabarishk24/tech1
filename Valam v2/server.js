import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'server-data');
const dbFile = path.join(dataDir, 'db.json');
fs.mkdirSync(dataDir, { recursive: true });

const emptyState = () => ({
  farmProfile: null,
  alerts: [],
  pdfDownloads: 0,
  bundle: [],
  hasBackup: false,
  ledgerEntries: [],
  enquiries: [],
  activityLog: [],
  upcomingEvents: [],
});

let db = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf8')) : { users: {}, otp: {} };
if (!db.users) db.users = {};
if (!db.otp) db.otp = {};

function persist() {
  const tmp = `${dbFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, dbFile);
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 1_000_000) req.destroy(); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

function sanitizeUser(u) {
  return { id: u.id, name: u.name, phone: u.phone, email: u.email, role: u.role };
}

function stateFor(user) {
  return {
    user: sanitizeUser(user),
    ...user.state,
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    // In production, the backend also serves the built React app.
    if (req.method === 'GET' && !url.pathname.startsWith('/api/')) {
      const distRoot = path.join(__dirname, 'dist');
      const requested = url.pathname === '/' ? '/index.html' : url.pathname;
      const filePath = path.resolve(distRoot, `.${requested}`);
      if (filePath.startsWith(distRoot) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        return fs.createReadStream(filePath).pipe(res);
      }
      const index = path.join(distRoot, 'index.html');
      if (fs.existsSync(index)) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return fs.createReadStream(index).pipe(res); }
    }
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true, service: 'VALAM backend', timestamp: new Date().toISOString() });

    if (req.method === 'POST' && url.pathname === '/api/auth/request-otp') {
      const body = await readBody(req);
      const phone = String(body.phone || '').replace(/\D/g, '');
      if (phone.length !== 10) return json(res, 400, { error: 'Enter a valid 10-digit mobile number' });
      const otp = '123456';
      db.otp[phone] = { otp, expiresAt: Date.now() + 5 * 60_000, name: String(body.name || '').trim() };
      persist();
      return json(res, 200, { ok: true, isNewUser: !db.users[phone], otp });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/verify') {
      const body = await readBody(req);
      const phone = String(body.phone || '').replace(/\D/g, '');
      const otpRecord = db.otp[phone];
      if (!otpRecord || otpRecord.expiresAt < Date.now() || String(body.otp) !== otpRecord.otp) return json(res, 401, { error: 'Invalid or expired OTP. Use 123456 for local demo.' });

      let user = db.users[phone];
      if (!user) {
        const id = crypto.randomUUID();
        user = {
          id,
          name: String(body.name || otpRecord.name || 'Farmer').trim() || 'Farmer',
          phone: `+91${phone}`,
          role: 'farmer',
          createdAt: new Date().toISOString(),
          state: { ...emptyState(), ...(body.initialState || {}) },
        };
        db.users[phone] = user;
      } else if (body.name && String(body.name).trim()) {
        user.name = String(body.name).trim();
      }
      delete db.otp[phone];
      persist();
      return json(res, 200, stateFor(user));
    }

    const stateMatch = url.pathname.match(/^\/api\/state\/([^/]+)$/);
    if (stateMatch && req.method === 'PUT') {
      const user = Object.values(db.users).find(u => u.id === stateMatch[1]);
      if (!user) return json(res, 404, { error: 'User not found' });
      const patch = await readBody(req);
      const allowed = ['farmProfile', 'alerts', 'pdfDownloads', 'bundle', 'hasBackup', 'ledgerEntries', 'enquiries', 'activityLog', 'upcomingEvents'];
      for (const key of allowed) if (key in patch) user.state[key] = patch[key];
      persist();
      return json(res, 200, { ok: true });
    }

    const stateGet = url.pathname.match(/^\/api\/state\/([^/]+)$/);
    if (stateGet && req.method === 'GET') {
      const user = Object.values(db.users).find(u => u.id === stateGet[1]);
      if (!user) return json(res, 404, { error: 'User not found' });
      return json(res, 200, stateFor(user));
    }

    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Internal server error' });
  }
});

const port = Number(process.env.PORT || 3001);
server.listen(port, '0.0.0.0', () => console.log(`VALAM backend running at http://localhost:${port}`));
