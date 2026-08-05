// Routing layer: Airtable-first, Sheets-fallback.
//
// Each onboarding lives in exactly ONE store. New onboardings (created from now
// on) go to Airtable; onboardings that already exist in the Sheet stay there
// until completed. Callers (session.ts, submit.ts, admin endpoints) check
// Airtable first via the functions here; if nothing is found, they fall back to
// their existing, untouched Sheets code.

import {
  findRecordByField, listAllRecords, createRecord, updateRecord, deleteRecord,
  type AirtableRecord,
} from './_airtable';
import { slugFromRow } from './_slug';

export const HOTEL_TABLE = 'Onboardings_Hotel';
export const MARKETING_TABLE = 'Onboardings_Marketing';
export const ACCOUNTS_TABLE = 'Accounts';
export const ENGAGEMENTS_TABLE = 'Engagements';
const ONBOARDING_TABLES = [HOTEL_TABLE, MARKETING_TABLE] as const;

export function isAirtableConfigured(): boolean {
  return !!(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID);
}

function tryJson(val: any, fallback: any) {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

// ─── Hotel field mapping — Airtable fields <-> the app's payload/session shape ─
// Field names mirror SHEET_HEADERS + ADMIN_COLS exactly, so session.ts/submit.ts
// build the identical JSON response/payload regardless of which store answers.
function hotelFieldsFromPayload(payload: any): Record<string, any> {
  const { general = {}, brand = {}, dns = {} } = payload;
  return {
    'Session ID': payload.sessionId,
    'Timestamp': new Date().toISOString(),
    'Property Type': payload.propertyType ?? '',
    'Property Name': general.propertyName ?? '',
    'Description': general.description ?? '',
    'Address': general.address ?? '',
    'City': general.city ?? '',
    'State / Province': general.stateProvince ?? '',
    'Country': general.country ?? '',
    'ZIP / Postal Code': general.zipCode ?? '',
    'Timezone': general.timezone ?? '',
    'Currency': general.currency ?? '',
    'Language': general.language ?? '',
    'Phone': general.phone ?? '',
    'Notification Email': general.notificationEmail ?? '',
    'Website URL': general.websiteUrl ?? '',
    'Site Title': brand.siteTitle ?? '',
    'Primary Color': brand.primaryColor ?? '',
    'Secondary Color': brand.secondaryColor ?? '',
    'Accent Color': brand.accentColor ?? '',
    'Font Family': brand.fontFamily ?? '',
    'Button Style': brand.buttonStyle ?? '',
    'Logo URL': brand.logoUrl ?? '',
    'Favicon URL': brand.faviconUrl ?? '',
    'Subdomain': dns.subdomain ?? '',
    'GTM ID': dns.gtmId ?? '',
    'GA4 Measurement ID': dns.ga4Id ?? '',
    'Google Map ID': dns.mapId ?? '',
    'Cancellation Policies': JSON.stringify(payload.cancellationPolicies ?? []),
    'Rooms': JSON.stringify(payload.rooms ?? []),
    'Add-ons': JSON.stringify(payload.addons ?? {}),
    'Rates': JSON.stringify(payload.rates ?? {}),
    'Taxes': JSON.stringify(payload.taxes ?? []),
    'Group Members': JSON.stringify(payload.groupMembers ?? []),
    'SiteMinder': JSON.stringify(payload.siteMinder ?? { connect: false, sites: [] }),
    'Property Terms & Conditions': general.termsConditions ?? '',
    'Date Format': general.dateFormat ?? '',
  };
}

function sessionResponseFromHotelRecord(record: AirtableRecord) {
  const f = record.fields;
  const onboardingName = f['Onboarding Name'] || null;
  const sessionId = f['Session ID'];
  return {
    sessionId,
    slug: slugFromRow(onboardingName ?? '', sessionId) || null,
    onboardingName,
    propertyType: f['Property Type'] || null,
    general: {
      propertyName: f['Property Name'] ?? '',
      description: f['Description'] ?? '',
      address: f['Address'] ?? '',
      city: f['City'] ?? '',
      stateProvince: f['State / Province'] ?? '',
      country: f['Country'] ?? '',
      zipCode: f['ZIP / Postal Code'] ?? '',
      timezone: f['Timezone'] ?? '',
      currency: f['Currency'] ?? '',
      language: f['Language'] ?? '',
      phone: f['Phone'] ?? '',
      notificationEmail: f['Notification Email'] ?? '',
      websiteUrl: f['Website URL'] ?? '',
      termsConditions: f['Property Terms & Conditions'] ?? '',
      dateFormat: f['Date Format'] ?? '',
    },
    brand: {
      siteTitle: f['Site Title'] ?? '',
      primaryColor: f['Primary Color'] ?? '',
      secondaryColor: f['Secondary Color'] ?? '',
      accentColor: f['Accent Color'] ?? '',
      fontFamily: f['Font Family'] ?? '',
      buttonStyle: f['Button Style'] ?? '',
      logoUrl: f['Logo URL'] ?? '',
      faviconUrl: f['Favicon URL'] ?? '',
    },
    dns: {
      subdomain: f['Subdomain'] ?? '',
      gtmId: f['GTM ID'] ?? '',
      ga4Id: f['GA4 Measurement ID'] ?? '',
      mapId: f['Google Map ID'] ?? '',
    },
    cancellationPolicies: tryJson(f['Cancellation Policies'], []),
    rooms: tryJson(f['Rooms'], []),
    addons: tryJson(f['Add-ons'], {}),
    rates: tryJson(f['Rates'], {}),
    taxes: tryJson(f['Taxes'], []),
    groupMembers: tryJson(f['Group Members'], []),
    siteMinder: tryJson(f['SiteMinder'], { connect: false, sites: [] }),
  };
}

// Marketing table isn't wired to a persistence UI yet (that flow is still
// client-only) — a minimal shape keeps session.ts's contract satisfiable if a
// marketing record is ever looked up before that follow-up lands.
function sessionResponseFromMarketingRecord(record: AirtableRecord) {
  const f = record.fields;
  const onboardingName = f['Onboarding Name'] || null;
  const sessionId = f['Session ID'];
  return {
    sessionId,
    slug: slugFromRow(onboardingName ?? '', sessionId) || null,
    onboardingName,
    propertyType: null,
    general: {}, brand: {}, dns: {},
    cancellationPolicies: [], rooms: [], addons: {}, rates: {}, taxes: [], groupMembers: [],
    siteMinder: { connect: false, sites: [] },
  };
}

export interface OnboardingHit {
  table: typeof HOTEL_TABLE | typeof MARKETING_TABLE;
  record: AirtableRecord;
}

export async function findOnboardingBySessionId(sessionId: string): Promise<OnboardingHit | null> {
  if (!isAirtableConfigured() || !sessionId) return null;
  for (const table of ONBOARDING_TABLES) {
    const rec = await findRecordByField(table, 'Session ID', sessionId);
    if (rec) return { table, record: rec };
  }
  return null;
}

export async function findOnboardingBySlug(slug: string): Promise<OnboardingHit | null> {
  if (!isAirtableConfigured() || !slug) return null;
  for (const table of ONBOARDING_TABLES) {
    const all = await listAllRecords(table);
    const match = all.find(
      (r) => slugFromRow(r.fields['Onboarding Name'] || '', r.fields['Session ID'] || '') === slug,
    );
    if (match) return { table, record: match };
  }
  return null;
}

export function sessionResponseFromHit(hit: OnboardingHit) {
  return hit.table === HOTEL_TABLE
    ? sessionResponseFromHotelRecord(hit.record)
    : sessionResponseFromMarketingRecord(hit.record);
}

// Update an existing hotel-shaped record by its Airtable record id.
export async function writeHotelFields(recordId: string, payload: any): Promise<void> {
  await updateRecord(HOTEL_TABLE, recordId, hotelFieldsFromPayload(payload));
}

// Create a brand-new hotel onboarding row from a full submit payload — used
// only when a sessionId doesn't exist in Airtable OR Sheets (e.g. an anonymous
// visitor with no admin-created row).
export async function createHotelOnboardingFromPayload(payload: any): Promise<void> {
  await createRecord(HOTEL_TABLE, hotelFieldsFromPayload(payload));
}

// ─── Admin: onboardings (list / create / delete) ──────────────────────────────

export async function listAirtableOnboardings(): Promise<Record<string, any>[]> {
  if (!isAirtableConfigured()) return [];
  const out: Record<string, any>[] = [];
  for (const table of ONBOARDING_TABLES) {
    const recs = await listAllRecords(table);
    const type = table === HOTEL_TABLE ? 'hotel' : 'marketing';
    recs.forEach((r) => out.push({ ...r.fields, Type: type }));
  }
  return out;
}

function generateSessionId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `albie_${Date.now()}_${rand}`;
}

export async function createAirtableOnboarding(opts: {
  accountId: string;
  onboardingName: string;
  pocEmail?: string;
  createdBy: string;
  type?: 'hotel' | 'marketing';
}): Promise<{ sessionId: string }> {
  const table = opts.type === 'marketing' ? MARKETING_TABLE : HOTEL_TABLE;
  const sessionId = generateSessionId();
  await createRecord(table, {
    'Session ID': sessionId,
    'Account ID': opts.accountId,
    'Onboarding Name': opts.onboardingName,
    'Status': 'pending',
    'Created By': opts.createdBy,
    'Admin Created At': new Date().toISOString(),
    'POC Email': opts.pocEmail ?? '',
  });
  return { sessionId };
}

export async function deleteAirtableOnboardingBySessionId(sessionId: string): Promise<boolean> {
  const hit = await findOnboardingBySessionId(sessionId);
  if (!hit) return false;
  await deleteRecord(hit.table, hit.record.id);
  return true;
}

// Used by send-onboarding.ts to write back PDF Link / Status after email send.
export async function updateAirtableOnboardingFields(
  sessionId: string,
  fields: Record<string, any>,
): Promise<{ ok: boolean; pocEmail?: string }> {
  const hit = await findOnboardingBySessionId(sessionId);
  if (!hit) return { ok: false };
  await updateRecord(hit.table, hit.record.id, fields);
  return { ok: true, pocEmail: hit.record.fields['POC Email'] ?? '' };
}

// ─── Admin: accounts (list / create) ───────────────────────────────────────────

export async function listAirtableAccounts(): Promise<Record<string, any>[]> {
  if (!isAirtableConfigured()) return [];
  const recs = await listAllRecords(ACCOUNTS_TABLE);
  return recs.map((r) => r.fields);
}

function generateAccountId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20);
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `acc_${slug}_${rand}`;
}

export async function createAirtableAccount(
  accountName: string,
): Promise<{ accountId: string; accountName: string }> {
  const accountId = generateAccountId(accountName);
  await createRecord(ACCOUNTS_TABLE, {
    'Account ID': accountId,
    'Account Name': accountName,
    'Created At': new Date().toISOString(),
  });
  return { accountId, accountName };
}

// ─── Engagements — a link that bundles 2+ products behind one "hub" screen ───
// Only created when 2+ products are selected at creation time. A single
// product (the common case today) never touches this table — it keeps using
// the plain Onboardings_* flow above, completely unchanged.

export interface EngagementProducts {
  albie: boolean;
  webDesign: boolean;
  marketing: boolean;
}

function generateEngagementId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `eng_${Date.now()}_${rand}`;
}

export async function createEngagement(opts: {
  accountId: string;
  onboardingName: string;
  pocEmail?: string;
  createdBy: string;
  products: EngagementProducts;
}): Promise<{ engagementId: string; slug: string }> {
  const engagementId = generateEngagementId();

  // If Albie is one of the selected products, it needs a real row in
  // Onboardings_Hotel (same as the single-product path) so its onboarding
  // flow works exactly as it does today — the engagement just remembers its
  // Session ID to link to it from the hub.
  let hotelSessionId = '';
  if (opts.products.albie) {
    const hotel = await createAirtableOnboarding({
      accountId: opts.accountId,
      onboardingName: opts.onboardingName,
      pocEmail: opts.pocEmail,
      createdBy: opts.createdBy,
      type: 'hotel',
    });
    hotelSessionId = hotel.sessionId;
  }

  await createRecord(ENGAGEMENTS_TABLE, {
    'Engagement ID': engagementId,
    'Onboarding Name': opts.onboardingName,
    'Account ID': opts.accountId,
    'POC Email': opts.pocEmail ?? '',
    'Created By': opts.createdBy,
    'Admin Created At': new Date().toISOString(),
    'Albie Enabled': opts.products.albie,
    'Web Design Enabled': opts.products.webDesign,
    'Marketing Enabled': opts.products.marketing,
    'Hotel Session ID': hotelSessionId,
  });

  const slug = slugFromRow(opts.onboardingName, engagementId) || engagementId;
  return { engagementId, slug };
}

export async function findEngagementBySessionId(engagementId: string): Promise<AirtableRecord | null> {
  if (!isAirtableConfigured() || !engagementId) return null;
  return findRecordByField(ENGAGEMENTS_TABLE, 'Engagement ID', engagementId);
}

export async function findEngagementBySlug(slug: string): Promise<AirtableRecord | null> {
  if (!isAirtableConfigured() || !slug) return null;
  const all = await listAllRecords(ENGAGEMENTS_TABLE);
  return all.find(
    (r) => slugFromRow(r.fields['Onboarding Name'] || '', r.fields['Engagement ID'] || '') === slug,
  ) ?? null;
}

// Shape returned by api/engagement.ts. The Albie card's slug is derived the
// same way the hotel record's own slug is — same onboarding name, its own
// Session ID — so no extra Airtable lookup is needed.
export function engagementResponseFromRecord(record: AirtableRecord) {
  const f = record.fields;
  const engagementId = f['Engagement ID'];
  const onboardingName = f['Onboarding Name'] || '';
  const hotelSessionId = f['Hotel Session ID'] || '';
  return {
    engagementSlug: slugFromRow(onboardingName, engagementId) || engagementId,
    engagementName: onboardingName || null,
    products: {
      albie: {
        enabled: !!f['Albie Enabled'],
        slug: f['Albie Enabled'] && hotelSessionId ? (slugFromRow(onboardingName, hotelSessionId) || null) : null,
      },
      webDesign: { enabled: !!f['Web Design Enabled'] },
      marketing: { enabled: !!f['Marketing Enabled'] },
    },
  };
}
