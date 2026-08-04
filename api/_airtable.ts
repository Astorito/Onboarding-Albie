// Thin REST wrapper around the Airtable Web API (Metadata + Records), used by
// api/_db.ts. No 'airtable' npm package — plain fetch keeps this dependency-free
// and avoids any ESM/CJS friction (this file compiles to CommonJS like the rest
// of /api).

const API_BASE = 'https://api.airtable.com/v0';

function baseId(): string {
  const id = process.env.AIRTABLE_BASE_ID;
  if (!id) throw new Error('Missing AIRTABLE_BASE_ID');
  return id;
}

function apiKey(): string {
  const key = process.env.AIRTABLE_API_KEY;
  if (!key) throw new Error('Missing AIRTABLE_API_KEY');
  return key;
}

async function request(method: string, path: string, body?: unknown): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json && (json.error?.message || json.error)) || res.statusText;
    throw new Error(`Airtable ${method} ${path} -> ${res.status}: ${JSON.stringify(msg)}`);
  }
  return json;
}

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

// Escape a value for safe interpolation into an Airtable formula string literal.
function escapeFormulaValue(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export async function findRecordByField(
  table: string,
  fieldName: string,
  value: string,
): Promise<AirtableRecord | null> {
  const formula = `{${fieldName}} = "${escapeFormulaValue(value)}"`;
  const json = await request(
    'GET',
    `/${baseId()}/${encodeURIComponent(table)}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`,
  );
  const records = json.records as AirtableRecord[] | undefined;
  return records && records.length > 0 ? records[0] : null;
}

export async function listAllRecords(table: string): Promise<AirtableRecord[]> {
  const all: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const qs = offset ? `?offset=${encodeURIComponent(offset)}` : '';
    const json = await request('GET', `/${baseId()}/${encodeURIComponent(table)}${qs}`);
    all.push(...(json.records ?? []));
    offset = json.offset;
  } while (offset);
  return all;
}

export async function createRecord(table: string, fields: Record<string, any>): Promise<AirtableRecord> {
  const json = await request('POST', `/${baseId()}/${encodeURIComponent(table)}`, {
    fields,
    typecast: true, // let new Single Select option values through without failing the write
  });
  return json as AirtableRecord;
}

export async function updateRecord(
  table: string,
  recordId: string,
  fields: Record<string, any>,
): Promise<AirtableRecord> {
  const json = await request('PATCH', `/${baseId()}/${encodeURIComponent(table)}/${recordId}`, {
    fields,
    typecast: true,
  });
  return json as AirtableRecord;
}

export async function deleteRecord(table: string, recordId: string): Promise<void> {
  await request('DELETE', `/${baseId()}/${encodeURIComponent(table)}/${recordId}`);
}
