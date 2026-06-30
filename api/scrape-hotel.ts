// POST /api/scrape-hotel
// Scrapes a hotel website and pre-fills the onboarding Sheet row via Gemini Flash.
// Body: { sessionId: string, url: string }
//
// Required env vars:
//   GOOGLE_SHEET_ID             — same as the rest of the API
//   GOOGLE_SERVICE_ACCOUNT_JSON — same as the rest of the API
//   GEMINI_API_KEY              — Google AI Studio key (free tier)

import { getAuth, getSheetsClient, ONBOARDINGS_TAB, findRowBySessionId, colIndexToLetter } from './_sheets';
import { SHEET_HEADERS } from './submit';

// Vercel Pro: allow up to 60s for fetch + Gemini (this endpoint is admin-only)
export const config = { maxDuration: 60 };

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Fields Gemini can extract — maps to SHEET_HEADERS column names
const FIELD_TO_HEADER: Record<string, string> = {
  propertyName:      'Property Name',
  description:       'Description',
  address:           'Address',
  city:              'City',
  stateProvince:     'State / Province',
  country:           'Country',
  zipCode:           'ZIP / Postal Code',
  phone:             'Phone',
  notificationEmail: 'Notification Email',
  websiteUrl:        'Website URL',
  siteTitle:         'Site Title',
  primaryColor:      'Primary Color',
  secondaryColor:    'Secondary Color',
  accentColor:       'Accent Color',
  logoUrl:           'Logo URL',
};

// Strip scripts/styles/tags to reduce token count sent to Gemini
function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/data:[^;]+;base64,[^"'\s]*/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40000);
}

// Pull meta tags into a flat summary for Gemini context
function extractMeta(html: string): string {
  const lines: string[] = [];
  for (const m of html.matchAll(/<meta[^>]+>/gi)) {
    const tag = m[0];
    const name = tag.match(/(?:name|property)=["']([^"']+)["']/i)?.[1];
    const content = tag.match(/content=["']([^"']+)["']/i)?.[1];
    if (name && content) lines.push(`${name}: ${content}`);
  }
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  if (title) lines.push(`title: ${title}`);
  return lines.join('\n').slice(0, 3000);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, url } = req.body ?? {};
  if (!sessionId || !url) return res.status(400).json({ error: 'sessionId and url are required' });

  const sheetId   = process.env.GOOGLE_SHEET_ID;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!sheetId)   return res.status(500).json({ error: 'Missing GOOGLE_SHEET_ID' });
  if (!geminiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });

  try {
    // ── 1. Fetch the hotel website ───────────────────────────────────────────
    let html: string;
    try {
      const siteRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        signal: AbortSignal.timeout(12000),
      });
      if (!siteRes.ok) return res.status(422).json({ error: `Could not fetch site: HTTP ${siteRes.status}` });
      html = await siteRes.text();
    } catch (e: any) {
      return res.status(422).json({ error: `Could not reach URL: ${e.message}` });
    }

    const pageText   = extractText(html);
    const metaSummary = extractMeta(html);

    // ── 2. Ask Gemini Flash to extract structured fields ─────────────────────
    const prompt = `You are extracting structured data from a hotel or property website to pre-fill an onboarding form.

Website URL: ${url}

Meta tags:
${metaSummary}

Page text (truncated):
${pageText}

Extract the following fields. Return ONLY a raw JSON object with no markdown, no code fences.
Use null for any field you cannot confidently extract — do NOT guess.

{
  "propertyName": "Official name of the property",
  "description": "2-3 sentence description of the property",
  "address": "Street address",
  "city": "City",
  "stateProvince": "State or province",
  "country": "Country name in English",
  "zipCode": "ZIP or postal code",
  "phone": "Phone number with country code if visible",
  "notificationEmail": "Contact or reservations email if visible",
  "websiteUrl": "${url}",
  "siteTitle": "Suggested booking engine title (property name + tagline)",
  "primaryColor": "Main brand hex color from CSS or logo (e.g. #2F6B6D), or null",
  "secondaryColor": "Secondary brand hex color or null",
  "accentColor": "Accent hex color or null",
  "logoUrl": "Absolute URL of the property logo image or null"
}`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({ error: `Gemini error: ${errText}` });
    }

    const geminiData = await geminiRes.json();
    const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const fields: Record<string, string | null> = JSON.parse(rawJson);

    // ── 3. Write non-null fields to the Sheet ────────────────────────────────
    const auth = getAuth();
    const sheets = getSheetsClient(auth);

    // Read the real header row so column positions are always accurate
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${ONBOARDINGS_TAB}!1:1`,
    });
    const headers = (headerRes.data.values?.[0] ?? []) as string[];

    const rowNum = await findRowBySessionId(sheets, sheetId, ONBOARDINGS_TAB, sessionId);

    if (rowNum < 1) {
      // Row doesn't exist yet — create it with sessionId + scraped fields
      const newRow = SHEET_HEADERS.map(h => {
        if (h === 'Session ID') return sessionId;
        if (h === 'Timestamp')  return new Date().toISOString();
        if (h === 'Property Type') return 'independent';
        const fieldEntry = Object.entries(FIELD_TO_HEADER).find(([, header]) => header === h);
        if (fieldEntry) return fields[fieldEntry[0]] ?? '';
        return '';
      });
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${ONBOARDINGS_TAB}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [newRow] },
      });
    } else {
      // Row exists — sparse update: only write the fields Gemini actually found
      const updates = Object.entries(FIELD_TO_HEADER)
        .filter(([field]) => fields[field])
        .map(([field, headerName]) => {
          const colIdx = headers.indexOf(headerName);
          if (colIdx === -1) return null;
          return {
            range: `${ONBOARDINGS_TAB}!${colIndexToLetter(colIdx + 1)}${rowNum}`,
            values: [[fields[field]]],
          };
        })
        .filter(Boolean);

      if (updates.length) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates,
          },
        });
      }
    }

    return res.status(200).json({ success: true, fieldsFound: Object.keys(fields).filter(k => fields[k]) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[scrape-hotel]', message);
    return res.status(500).json({ error: message });
  }
}
