// GET  /api/admin/accounts — list all accounts (requires auth)
// POST /api/admin/accounts — create new account (requires auth)

import { requireAuth } from './_auth';
import { getAuth, getSheetsClient, ACCOUNTS_TAB, readSheetAsObjects, ACCOUNTS_HEADERS } from '../_sheets';
import { listAirtableAccounts, createAirtableAccount, isAirtableConfigured } from '../_db';

function generateAccountId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20);
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `acc_${slug}_${rand}`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = requireAuth(req, res);
  if (!payload) return;

  const sheetId = process.env.GOOGLE_SHEET_ID;

  // ── GET: return all accounts — Airtable (new) + Sheets (legacy) merged ────
  if (req.method === 'GET') {
    const airtableRows = await listAirtableAccounts();
    let sheetRows: Record<string, string>[] = [];
    if (sheetId) {
      const sheets = getSheetsClient(getAuth());
      const { rows } = await readSheetAsObjects(sheets, sheetId, ACCOUNTS_TAB);
      sheetRows = rows;
    }
    return res.status(200).json([...airtableRows, ...sheetRows]);
  }

  // ── POST: create new account — goes to Airtable (start-fresh default) ─────
  if (req.method === 'POST') {
    const { accountName } = req.body ?? {};
    if (!accountName?.trim()) {
      return res.status(400).json({ error: 'accountName is required' });
    }

    if (isAirtableConfigured()) {
      const created = await createAirtableAccount(accountName.trim());
      return res.status(201).json(created);
    }

    // Airtable not configured — original fallback: create in Sheets.
    if (!sheetId) return res.status(500).json({ error: 'Missing GOOGLE_SHEET_ID' });
    const sheets = getSheetsClient(getAuth());
    const accountId = generateAccountId(accountName.trim());
    const row = [accountId, accountName.trim(), new Date().toISOString()];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${ACCOUNTS_TAB}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return res.status(201).json({ accountId, accountName: accountName.trim() });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
