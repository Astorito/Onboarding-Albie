// POST /api/admin/login
// Verifies email + password against the ADMIN_USERS env var and sets an httpOnly cookie.
//
// ADMIN_USERS format (JSON array):
//   [{"email":"you@company.com","passwordHash":"$2b$10$..."}]
//
// Generate a hash: node -e "require('bcryptjs').hash('yourpassword',10).then(console.log)"

import * as bcrypt from 'bcryptjs';
import { signToken } from './_auth';

interface AdminUser {
  email: string;
  passwordHash: string;
}

function loadAdminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_USERS;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AdminUser[];
  } catch {
    return [];
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const users = loadAdminUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Constant-time comparison even on miss (avoids timing oracle)
  const hash = user?.passwordHash ?? '$2b$10$invalidhashpaddingtomatchcost000000000000000000000000000';
  const valid = user ? await bcrypt.compare(password, hash) : false;

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ email: user!.email });

  res.setHeader(
    'Set-Cookie',
    `admin_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 8}`
  );

  return res.status(200).json({ ok: true, email: user!.email });
}
