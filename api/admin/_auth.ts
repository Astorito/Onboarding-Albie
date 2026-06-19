// JWT helpers for admin auth.
// The secret key is derived from GOOGLE_SERVICE_ACCOUNT_JSON (always present),
// so no extra env var is needed.

import * as crypto from 'crypto';

const TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function secret(): string {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? 'fallback-dev-secret';
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// Minimal HS256 JWT — no external dependency needed (crypto is built-in to Node)
function base64url(input: string | Buffer): string {
  const b64 = Buffer.isBuffer(input)
    ? input.toString('base64')
    : Buffer.from(input).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function signToken(payload: Record<string, unknown>): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS }));
  const sig = base64url(
    crypto.createHmac('sha256', secret()).update(`${header}.${body}`).digest()
  );
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [header, body, sig] = token.split('.');
    const expected = base64url(
      crypto.createHmac('sha256', secret()).update(`${header}.${body}`).digest()
    );
    if (sig !== expected) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64').toString()) as Record<string, unknown>;
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

// Parses the admin_token cookie from a request's Cookie header.
export function tokenFromRequest(req: { headers: { cookie?: string } }): string | null {
  const cookieHeader = req.headers.cookie ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Call at the top of any protected endpoint. Returns the token payload or sends 401.
export function requireAuth(
  req: { headers: { cookie?: string } },
  res: { status: (c: number) => { json: (b: unknown) => unknown } }
): Record<string, unknown> | null {
  const token = tokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return payload;
}
