// Vercel Serverless Function — POST /api/analyze-url
// Scrapes a hotel website via Jina AI Reader (free) and extracts
// structured fields using GPT-4o-mini.

const SYSTEM_PROMPT = `You are extracting structured information about a hotel or property from its website content.
Return ONLY a valid JSON object with these exact keys. Use null for any field you cannot find with reasonable confidence — never invent data.

{
  "propertyName": string | null,        // Hotel / property name
  "description": string | null,         // 2-3 sentence description of the property
  "address": string | null,             // Street address
  "city": string | null,                // City name
  "stateProvince": string | null,       // State, province or region name
  "country": string | null,             // Full country name in English (e.g. "Spain", "Denmark")
  "zipCode": string | null,             // ZIP or postal code
  "timezone": string | null,            // IANA timezone ID inferred from location (e.g. "Europe/Madrid")
  "currency": string | null,            // ISO 4217 code inferred from country (e.g. "EUR", "USD", "DKK")
  "language": string | null,            // BCP 47 code detected from page language (e.g. "en", "es", "da")
  "phone": string | null,               // Primary phone with international prefix (e.g. "+1 212 555 0123")
  "notificationEmail": string | null,   // Contact or reservations email address
  "websiteUrl": string | null,          // Main website URL
  "siteTitle": string | null            // Brand name or page title used on the site
}`;

export interface AnalyzeResult {
  propertyName: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  stateProvince: string | null;
  country: string | null;
  zipCode: string | null;
  timezone: string | null;
  currency: string | null;
  language: string | null;
  phone: string | null;
  notificationEmail: string | null;
  websiteUrl: string | null;
  siteTitle: string | null;
}

export default async function handler(req: any, res: any) {
  // CORS headers (needed for local vercel dev)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body ?? {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "url" in request body' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is not configured. Add it to your Vercel environment variables.',
    });
  }

  try {
    // ── Step 1: Fetch page as clean text/markdown via Jina AI Reader (free) ──
    const jinaRes = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'text',
      },
      signal: AbortSignal.timeout(9000),
    });

    if (!jinaRes.ok) {
      throw new Error(`Could not fetch page content (Jina returned ${jinaRes.status}). Check the URL is publicly accessible.`);
    }

    const markdown = await jinaRes.text();
    // Trim to ~6 000 chars — keeps token cost under ~$0.003 per request
    const content = markdown.slice(0, 6000);

    // ── Step 2: Extract structured fields with GPT-4o-mini ──
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Website URL: ${url}\n\nPage content:\n${content}`,
          },
        ],
        response_format: { type: 'json_object' }, // guarantees valid JSON back
        max_tokens: 500,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text().catch(() => openaiRes.statusText);
      throw new Error(`OpenAI API error ${openaiRes.status}: ${errText}`);
    }

    const openaiData = await openaiRes.json();
    const rawJson = openaiData.choices?.[0]?.message?.content ?? '{}';
    const result: AnalyzeResult = JSON.parse(rawJson);

    // Always ensure websiteUrl is populated
    if (!result.websiteUrl) result.websiteUrl = url;

    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error during analysis';
    console.error('[analyze-url]', message);
    return res.status(500).json({ error: message });
  }
}
