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
export const WEBDESIGN_TABLE = 'Onboardings_WebDesign';
export const SOCIAL_TABLE = 'Onboardings_Social';
export const ACCOUNTS_TABLE = 'Accounts';
export const ENGAGEMENTS_TABLE = 'Engagements';
const ONBOARDING_TABLES = [HOTEL_TABLE, MARKETING_TABLE, WEBDESIGN_TABLE, SOCIAL_TABLE] as const;

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
    'Has PMS': general.hasPms ?? '',
    'PMS Name': general.pmsName ?? '',
    'Has Channel Manager': general.hasChannelManager ?? '',
    'Channel Manager Name': general.channelManagerName ?? '',
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
      hasPms: f['Has PMS'] ?? '',
      pmsName: f['PMS Name'] ?? '',
      hasChannelManager: f['Has Channel Manager'] ?? '',
      channelManagerName: f['Channel Manager Name'] ?? '',
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

// ─── Marketing field mapping — Airtable fields <-> the payload/session shape ──
// Field names mirror the Onboardings_Marketing table created for this feature.
// The Goal checkboxes are real booleans in Airtable, but the frontend's plain
// HTML checkboxes emit 'on'/'' (the browser's own convention) — converted at
// this boundary so both sides only ever see their native representation.
function marketingFieldsFromPayload(payload: any): Record<string, any> {
  const { basics = {}, accounts = {}, strategy = {} } = payload;
  const isChecked = (v: any) => v === 'on' || v === true;
  return {
    'Session ID': payload.sessionId,
    'Timestamp': new Date().toISOString(),
    'Email': basics.email ?? '',
    'Business Name': basics.businessName ?? '',
    'Past Campaigns': basics.pastCampaigns ?? '',
    'Google Ads Account': accounts.googleAdsAccount ?? '',
    'GTM Account': accounts.gtmAccount ?? '',
    'GA4 Account': accounts.ga4Account ?? '',
    'Facebook Account': accounts.facebookAccount ?? '',
    'Drive Folder URL': accounts.driveFolderUrl ?? '',
    'YouTube URL': accounts.youtubeUrl ?? '',
    'Goal Brand Awareness': isChecked(strategy.goalBrandAwareness),
    'Goal Traffic': isChecked(strategy.goalTraffic),
    'Goal Leads': isChecked(strategy.goalLeads),
    'Goal Purchases/Bookings': isChecked(strategy.goalPurchasesBookings),
    'Goal Other': strategy.goalOther ?? '',
    'Competitors': strategy.competitors ?? '',
    'Target Locations': strategy.targetLocations ?? '',
    'Approve Ad Copy': strategy.approveAdCopy ?? '',
    'Monthly Budget': strategy.monthlyBudget ?? '',
    'Own Credit Card': strategy.ownCreditCard ?? '',
    'Launch Date': strategy.launchDate ?? '',
    'Ideal Customer Insights': strategy.idealCustomerInsights ?? '',
    'Additional Info': strategy.additionalInfo ?? '',
  };
}

function sessionResponseFromMarketingRecord(record: AirtableRecord) {
  const f = record.fields;
  const onboardingName = f['Onboarding Name'] || null;
  const sessionId = f['Session ID'];
  const asChecked = (v: any) => (v ? 'on' : '');
  return {
    sessionId,
    slug: slugFromRow(onboardingName ?? '', sessionId) || null,
    onboardingName,
    basics: {
      email: f['Email'] ?? '',
      businessName: f['Business Name'] ?? '',
      pastCampaigns: f['Past Campaigns'] ?? '',
    },
    accounts: {
      googleAdsAccount: f['Google Ads Account'] ?? '',
      gtmAccount: f['GTM Account'] ?? '',
      ga4Account: f['GA4 Account'] ?? '',
      facebookAccount: f['Facebook Account'] ?? '',
      driveFolderUrl: f['Drive Folder URL'] ?? '',
      youtubeUrl: f['YouTube URL'] ?? '',
    },
    strategy: {
      goalBrandAwareness: asChecked(f['Goal Brand Awareness']),
      goalTraffic: asChecked(f['Goal Traffic']),
      goalLeads: asChecked(f['Goal Leads']),
      goalPurchasesBookings: asChecked(f['Goal Purchases/Bookings']),
      goalOther: f['Goal Other'] ?? '',
      competitors: f['Competitors'] ?? '',
      targetLocations: f['Target Locations'] ?? '',
      approveAdCopy: f['Approve Ad Copy'] ?? '',
      monthlyBudget: f['Monthly Budget'] ?? '',
      ownCreditCard: f['Own Credit Card'] ?? '',
      launchDate: f['Launch Date'] ?? '',
      idealCustomerInsights: f['Ideal Customer Insights'] ?? '',
      additionalInfo: f['Additional Info'] ?? '',
    },
  };
}

// ─── Web Design field mapping — Airtable fields <-> the payload/session shape ─
// Field names mirror src/website/WebsiteReviewStep.tsx's FIELD_LABELS verbatim
// (that map can't be imported here — api/ is a separate CJS build context —
// but keeping the literal strings identical means Airtable's column headers,
// the Review screen, and the PDF all agree). Checkboxes follow the same
// isChecked/asChecked 'on'/''-vs-boolean convention as marketing above. The
// five multi-option fields (industry, propertyType, bookingEngine,
// domainProperty, hostingProvider) are stored as their RAW value strings
// (e.g. 'hotel_hospitality'), not translated labels — that keeps read-back
// trivially correct for resuming a session (the frontend's SelectableCard
// prefill compares against the raw value), at the cost of the Airtable column
// showing the raw slug instead of a friendly label. The PDF translates these
// for display only, never feeding a translated value back into the payload.
function websiteFieldsFromPayload(payload: any): Record<string, any> {
  const {
    company = {}, brand = {}, structure = {}, inspiration = {},
    hotelGate = {}, hotelGeneral = {}, hotelTechnical = {}, features = {},
  } = payload;
  const isChecked = (v: any) => v === 'on' || v === true;
  return {
    'Session ID': payload.sessionId,
    'Timestamp': new Date().toISOString(),

    'Company / Brand Name': company.companyName ?? '',
    'Industry / Market': company.industry ?? '',
    'Industry (Other)': company.industryOther ?? '',
    'Existing Website URL': company.existingWebsiteUrl ?? '',
    'Main Contact Person': company.contactPerson ?? '',
    'Email Address': company.email ?? '',
    'Goal: Brand Awareness': isChecked(company.goalBrandAwareness),
    'Goal: Lead Generation': isChecked(company.goalLeadGeneration),
    'Goal: Sales / E-commerce': isChecked(company.goalSalesEcommerce),
    'Goal: Informational': isChecked(company.goalInformational),
    'Goal (Other)': company.goalOther ?? '',

    'Has Brand Identity / Guidelines': brand.hasBrandIdentity ?? '',
    'Resource: Logo': isChecked(brand.resourceLogo),
    'Resource: Typography / Brand Fonts': isChecked(brand.resourceTypography),
    'Resource: Colors': isChecked(brand.resourceColors),
    'Resource: Brand Guidelines': isChecked(brand.resourceGuidelines),
    'Resource (Other)': brand.resourceOther ?? '',
    'Brand in 3-5 Words': brand.brandDescriptionWords ?? '',

    'Estimated Number of Pages': structure.estimatedPages ?? '',
    'Page: Home': isChecked(structure.pageHome),
    'Page: About Us': isChecked(structure.pageAboutUs),
    'Page: Services / Products': isChecked(structure.pageServicesProducts),
    'Page: Blog / News': isChecked(structure.pageBlogNews),
    'Page: Contact': isChecked(structure.pageContact),
    'Page: Testimonials / Case Studies': isChecked(structure.pageTestimonials),
    'Page (Other)': structure.pageOther ?? '',
    'One-Sentence Description': structure.oneSentenceDescription ?? '',
    'Ideal Customer': structure.idealCustomer ?? '',
    'Business Location': structure.businessLocation ?? '',
    'Company Story': structure.companyStory ?? '',
    'Main Services / Products': structure.servicesDescription ?? '',
    'Brand Story / Core Values': structure.brandStoryValues ?? '',

    'Reference Websites': inspiration.referenceWebsites ?? '',
    'Likes About References': inspiration.likesAboutReferences ?? '',
    'Dislikes / What to Avoid': inspiration.dislikesToAvoid ?? '',
    'Competitors': inspiration.competitors ?? '',

    'Hotel / Hospitality Project': hotelGate.isHotelProject ?? '',

    'Property Type': hotelGeneral.propertyType ?? '',
    'Property Type (Other)': hotelGeneral.propertyTypeOther ?? '',
    'Location(s)': hotelGeneral.hotelLocations ?? '',
    'Room Types / Categories': hotelGeneral.roomTypesCount ?? '',
    'Feature: Experiences': isChecked(hotelGeneral.featureExperiences),
    'Feature: Activities': isChecked(hotelGeneral.featureActivities),
    'Feature: Weddings & Events': isChecked(hotelGeneral.featureWeddingsEvents),
    'Feature: Dining': isChecked(hotelGeneral.featureDining),
    'Feature: Amenities': isChecked(hotelGeneral.featureAmenities),
    'Feature: Accommodations': isChecked(hotelGeneral.featureAccommodations),
    'Feature: Offers & Packages': isChecked(hotelGeneral.featureOffersPackages),
    'Amenities/Activities to Highlight': hotelGeneral.amenitiesHighlight ?? '',
    'Professional Photography Access': hotelGeneral.professionalPhotography ?? '',

    'Has Active Booking Engine': hotelTechnical.hasActiveBookingEngine ?? '',
    'Booking Engine': hotelTechnical.bookingEngine ?? '',
    'Booking Engine (Other)': hotelTechnical.bookingEngineOther ?? '',
    'PMS': hotelTechnical.pms ?? '',
    'Channel Manager': hotelTechnical.channelManager ?? '',

    'Feature: Contact Forms': isChecked(features.featureContactForms),
    'Feature: Newsletter Subscriptions': isChecked(features.featureNewsletter),
    'Feature: Booking System': isChecked(features.featureBookingSystem),
    'Feature: E-commerce': isChecked(features.featureEcommerce),
    'Feature: Blog / Dynamic Content': isChecked(features.featureBlogDynamic),
    'Feature: Third-Party Integrations': isChecked(features.featureThirdPartyIntegrations),
    'Feature (Other)': features.featureOther ?? '',
    'SEO Goals / Priority Keywords': features.seoGoals ?? '',
    'Domain Property': features.domainProperty ?? '',
    'Domain Property (Other)': features.domainPropertyOther ?? '',
    'Hosting Provider': features.hostingProvider ?? '',
    'Hosting Provider (Other)': features.hostingProviderOther ?? '',
    'Additional Info': features.additionalInfo ?? '',
    'Desired Timeline / Deadline': features.desiredTimeline ?? '',
  };
}

function sessionResponseFromWebsiteRecord(record: AirtableRecord) {
  const f = record.fields;
  const onboardingName = f['Onboarding Name'] || null;
  const sessionId = f['Session ID'];
  const asChecked = (v: any) => (v ? 'on' : '');
  return {
    sessionId,
    slug: slugFromRow(onboardingName ?? '', sessionId) || null,
    onboardingName,
    company: {
      companyName: f['Company / Brand Name'] ?? '',
      industry: f['Industry / Market'] ?? '',
      industryOther: f['Industry (Other)'] ?? '',
      existingWebsiteUrl: f['Existing Website URL'] ?? '',
      contactPerson: f['Main Contact Person'] ?? '',
      email: f['Email Address'] ?? '',
      goalBrandAwareness: asChecked(f['Goal: Brand Awareness']),
      goalLeadGeneration: asChecked(f['Goal: Lead Generation']),
      goalSalesEcommerce: asChecked(f['Goal: Sales / E-commerce']),
      goalInformational: asChecked(f['Goal: Informational']),
      goalOther: f['Goal (Other)'] ?? '',
    },
    brand: {
      hasBrandIdentity: f['Has Brand Identity / Guidelines'] ?? '',
      resourceLogo: asChecked(f['Resource: Logo']),
      resourceTypography: asChecked(f['Resource: Typography / Brand Fonts']),
      resourceColors: asChecked(f['Resource: Colors']),
      resourceGuidelines: asChecked(f['Resource: Brand Guidelines']),
      resourceOther: f['Resource (Other)'] ?? '',
      brandDescriptionWords: f['Brand in 3-5 Words'] ?? '',
    },
    structure: {
      estimatedPages: f['Estimated Number of Pages'] ?? '',
      pageHome: asChecked(f['Page: Home']),
      pageAboutUs: asChecked(f['Page: About Us']),
      pageServicesProducts: asChecked(f['Page: Services / Products']),
      pageBlogNews: asChecked(f['Page: Blog / News']),
      pageContact: asChecked(f['Page: Contact']),
      pageTestimonials: asChecked(f['Page: Testimonials / Case Studies']),
      pageOther: f['Page (Other)'] ?? '',
      oneSentenceDescription: f['One-Sentence Description'] ?? '',
      idealCustomer: f['Ideal Customer'] ?? '',
      businessLocation: f['Business Location'] ?? '',
      companyStory: f['Company Story'] ?? '',
      servicesDescription: f['Main Services / Products'] ?? '',
      brandStoryValues: f['Brand Story / Core Values'] ?? '',
    },
    inspiration: {
      referenceWebsites: f['Reference Websites'] ?? '',
      likesAboutReferences: f['Likes About References'] ?? '',
      dislikesToAvoid: f['Dislikes / What to Avoid'] ?? '',
      competitors: f['Competitors'] ?? '',
    },
    hotelGate: {
      isHotelProject: f['Hotel / Hospitality Project'] ?? '',
    },
    hotelGeneral: {
      propertyType: f['Property Type'] ?? '',
      propertyTypeOther: f['Property Type (Other)'] ?? '',
      hotelLocations: f['Location(s)'] ?? '',
      roomTypesCount: f['Room Types / Categories'] ?? '',
      featureExperiences: asChecked(f['Feature: Experiences']),
      featureActivities: asChecked(f['Feature: Activities']),
      featureWeddingsEvents: asChecked(f['Feature: Weddings & Events']),
      featureDining: asChecked(f['Feature: Dining']),
      featureAmenities: asChecked(f['Feature: Amenities']),
      featureAccommodations: asChecked(f['Feature: Accommodations']),
      featureOffersPackages: asChecked(f['Feature: Offers & Packages']),
      amenitiesHighlight: f['Amenities/Activities to Highlight'] ?? '',
      professionalPhotography: f['Professional Photography Access'] ?? '',
    },
    hotelTechnical: {
      hasActiveBookingEngine: f['Has Active Booking Engine'] ?? '',
      bookingEngine: f['Booking Engine'] ?? '',
      bookingEngineOther: f['Booking Engine (Other)'] ?? '',
      pms: f['PMS'] ?? '',
      channelManager: f['Channel Manager'] ?? '',
    },
    features: {
      featureContactForms: asChecked(f['Feature: Contact Forms']),
      featureNewsletter: asChecked(f['Feature: Newsletter Subscriptions']),
      featureBookingSystem: asChecked(f['Feature: Booking System']),
      featureEcommerce: asChecked(f['Feature: E-commerce']),
      featureBlogDynamic: asChecked(f['Feature: Blog / Dynamic Content']),
      featureThirdPartyIntegrations: asChecked(f['Feature: Third-Party Integrations']),
      featureOther: f['Feature (Other)'] ?? '',
      seoGoals: f['SEO Goals / Priority Keywords'] ?? '',
      domainProperty: f['Domain Property'] ?? '',
      domainPropertyOther: f['Domain Property (Other)'] ?? '',
      hostingProvider: f['Hosting Provider'] ?? '',
      hostingProviderOther: f['Hosting Provider (Other)'] ?? '',
      additionalInfo: f['Additional Info'] ?? '',
      desiredTimeline: f['Desired Timeline / Deadline'] ?? '',
    },
  };
}

// ─── Social Media field mapping ────────────────────────────────────────────────
// Unlike hotel/marketing/website (one Airtable column per field), Social's 6
// modules are each stored as a single JSON blob column ('Company JSON', etc).
// The form has ~85 individual fields (16 goal checkboxes + 18 voice-trait
// checkboxes + 14 asset-type checkboxes + ~35 text fields) — one column per
// field would mean an 85-column Airtable table for comparatively flat,
// non-relational data. This mirrors how the hotel table already stores its
// own complex values (Rooms, Cancellation Policies, SiteMinder) as JSON text
// rather than exploding them into columns.
const SOCIAL_MODULES = ['company', 'goals', 'offerings', 'brand', 'assets', 'competitors'] as const;
const SOCIAL_MODULE_FIELDS: Record<typeof SOCIAL_MODULES[number], string> = {
  company: 'Company JSON',
  goals: 'Goals JSON',
  offerings: 'Offerings JSON',
  brand: 'Brand JSON',
  assets: 'Assets JSON',
  competitors: 'Competitors JSON',
};

function socialFieldsFromPayload(payload: any): Record<string, any> {
  const fields: Record<string, any> = {
    'Session ID': payload.sessionId,
    'Timestamp': new Date().toISOString(),
  };
  for (const m of SOCIAL_MODULES) {
    fields[SOCIAL_MODULE_FIELDS[m]] = JSON.stringify(payload[m] ?? {});
  }
  return fields;
}

function sessionResponseFromSocialRecord(record: AirtableRecord) {
  const f = record.fields;
  const onboardingName = f['Onboarding Name'] || null;
  const sessionId = f['Session ID'];
  const response: Record<string, any> = {
    sessionId,
    slug: slugFromRow(onboardingName ?? '', sessionId) || null,
    onboardingName,
  };
  for (const m of SOCIAL_MODULES) {
    response[m] = tryJson(f[SOCIAL_MODULE_FIELDS[m]], {});
  }
  return response;
}

export interface OnboardingHit {
  table: typeof HOTEL_TABLE | typeof MARKETING_TABLE | typeof WEBDESIGN_TABLE | typeof SOCIAL_TABLE;
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
  if (hit.table === HOTEL_TABLE) return sessionResponseFromHotelRecord(hit.record);
  if (hit.table === WEBDESIGN_TABLE) return sessionResponseFromWebsiteRecord(hit.record);
  if (hit.table === SOCIAL_TABLE) return sessionResponseFromSocialRecord(hit.record);
  return sessionResponseFromMarketingRecord(hit.record);
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

// Same pair, for the marketing flow. Marketing has no Sheets fallback (it
// never existed there) — Airtable is the only store, so there is no "not
// found anywhere" branch to worry about like the hotel flow has.
export async function writeMarketingFields(recordId: string, payload: any): Promise<void> {
  await updateRecord(MARKETING_TABLE, recordId, marketingFieldsFromPayload(payload));
}

export async function createMarketingOnboardingFromPayload(payload: any): Promise<void> {
  await createRecord(MARKETING_TABLE, marketingFieldsFromPayload(payload));
}

// Same pair again, for the web design flow. Also Airtable-only — see the
// marketing comment above.
export async function writeWebsiteFields(recordId: string, payload: any): Promise<void> {
  await updateRecord(WEBDESIGN_TABLE, recordId, websiteFieldsFromPayload(payload));
}

export async function createWebsiteOnboardingFromPayload(payload: any): Promise<void> {
  await createRecord(WEBDESIGN_TABLE, websiteFieldsFromPayload(payload));
}

// Same pair again, for Social Media. Also Airtable-only.
export async function writeSocialFields(recordId: string, payload: any): Promise<void> {
  await updateRecord(SOCIAL_TABLE, recordId, socialFieldsFromPayload(payload));
}

export async function createSocialOnboardingFromPayload(payload: any): Promise<void> {
  await createRecord(SOCIAL_TABLE, socialFieldsFromPayload(payload));
}

// Blank-overwrite guard for the Social flow's save endpoint — same rationale
// as api/submit.ts's guard (see that file): a save built from unhydrated
// client state is all-empty, and writing it would erase real answers. Social
// has no single obvious "is this row empty" field the way hotel has
// Property Name, so this checks ALL 6 modules for any non-empty value.
export function isSocialPayloadBlank(payload: any): boolean {
  return SOCIAL_MODULES.every((m) => {
    const obj = payload?.[m];
    if (!obj || typeof obj !== 'object') return true;
    return Object.values(obj).every((v) => !v || String(v).trim() === '');
  });
}

export function socialRecordHasContent(fields: Record<string, any>): boolean {
  return SOCIAL_MODULES.some((m) => {
    const obj = tryJson(fields[SOCIAL_MODULE_FIELDS[m]], {});
    return Object.values(obj).some((v) => v && String(v).trim() !== '');
  });
}

// ─── Admin: onboardings (list / create / delete) ──────────────────────────────

export async function listAirtableOnboardings(): Promise<Record<string, any>[]> {
  if (!isAirtableConfigured()) return [];
  const out: Record<string, any>[] = [];
  for (const table of ONBOARDING_TABLES) {
    const recs = await listAllRecords(table);
    const type =
      table === HOTEL_TABLE ? 'hotel'
      : table === WEBDESIGN_TABLE ? 'webdesign'
      : table === SOCIAL_TABLE ? 'social'
      : 'marketing';
    recs.forEach((r) => out.push({ ...r.fields, Type: type }));
  }
  return out;
}

// Used by the admin dashboard to show each multi-product Engagement as its
// own list entry (with a working /e/<slug> hub link), instead of only ever
// surfacing that link once, at creation time.
export async function listAirtableEngagements(): Promise<Record<string, any>[]> {
  if (!isAirtableConfigured()) return [];
  const recs = await listAllRecords(ENGAGEMENTS_TABLE);
  return recs.map((r) => r.fields);
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
  type?: 'hotel' | 'marketing' | 'webdesign' | 'social';
}): Promise<{ sessionId: string }> {
  const table =
    opts.type === 'marketing' ? MARKETING_TABLE
    : opts.type === 'webdesign' ? WEBDESIGN_TABLE
    : opts.type === 'social' ? SOCIAL_TABLE
    : HOTEL_TABLE;
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
  social: boolean;
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

  // For each selected product with a real flow, create its own row in that
  // product's table (same as the single-product path) so the onboarding
  // works exactly as it does today — the engagement just remembers each
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

  let marketingSessionId = '';
  if (opts.products.marketing) {
    const marketing = await createAirtableOnboarding({
      accountId: opts.accountId,
      onboardingName: opts.onboardingName,
      pocEmail: opts.pocEmail,
      createdBy: opts.createdBy,
      type: 'marketing',
    });
    marketingSessionId = marketing.sessionId;
  }

  let webDesignSessionId = '';
  if (opts.products.webDesign) {
    const webDesign = await createAirtableOnboarding({
      accountId: opts.accountId,
      onboardingName: opts.onboardingName,
      pocEmail: opts.pocEmail,
      createdBy: opts.createdBy,
      type: 'webdesign',
    });
    webDesignSessionId = webDesign.sessionId;
  }

  let socialSessionId = '';
  if (opts.products.social) {
    const social = await createAirtableOnboarding({
      accountId: opts.accountId,
      onboardingName: opts.onboardingName,
      pocEmail: opts.pocEmail,
      createdBy: opts.createdBy,
      type: 'social',
    });
    socialSessionId = social.sessionId;
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
    'Social Enabled': opts.products.social,
    'Hotel Session ID': hotelSessionId,
    'Marketing Session ID': marketingSessionId,
    'Web Design Session ID': webDesignSessionId,
    'Social Session ID': socialSessionId,
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

// Reverse lookup: given a product's OWN Session ID (Hotel/Marketing/WebDesign),
// find the Engagement that bundles it, if any. Lets session.ts tell the client
// "this product belongs to a hub" even when someone opened its bare /o/<slug>
// link directly (i.e. without the ?engagement= query param the hub's own cards
// always append) — so the client can redirect to the hub instead of silently
// rendering just that one product.
export async function findEngagementByProductSessionId(sessionId: string): Promise<AirtableRecord | null> {
  if (!isAirtableConfigured() || !sessionId) return null;
  const all = await listAllRecords(ENGAGEMENTS_TABLE);
  return all.find(
    (r) =>
      r.fields['Hotel Session ID'] === sessionId ||
      r.fields['Marketing Session ID'] === sessionId ||
      r.fields['Web Design Session ID'] === sessionId ||
      r.fields['Social Session ID'] === sessionId,
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
  const marketingSessionId = f['Marketing Session ID'] || '';
  const webDesignSessionId = f['Web Design Session ID'] || '';
  const socialSessionId = f['Social Session ID'] || '';
  return {
    engagementSlug: slugFromRow(onboardingName, engagementId) || engagementId,
    engagementName: onboardingName || null,
    products: {
      albie: {
        enabled: !!f['Albie Enabled'],
        slug: f['Albie Enabled'] && hotelSessionId ? (slugFromRow(onboardingName, hotelSessionId) || null) : null,
      },
      webDesign: {
        enabled: !!f['Web Design Enabled'],
        slug: f['Web Design Enabled'] && webDesignSessionId ? (slugFromRow(onboardingName, webDesignSessionId) || null) : null,
      },
      marketing: {
        enabled: !!f['Marketing Enabled'],
        slug: f['Marketing Enabled'] && marketingSessionId ? (slugFromRow(onboardingName, marketingSessionId) || null) : null,
      },
      social: {
        enabled: !!f['Social Enabled'],
        slug: f['Social Enabled'] && socialSessionId ? (slugFromRow(onboardingName, socialSessionId) || null) : null,
      },
    },
  };
}
