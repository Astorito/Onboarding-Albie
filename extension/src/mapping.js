// Shared mapping tables between Onboarding-Albie's Hotel data (Airtable
// `Onboardings_Hotel` table, via api/_db.ts / GeneralInformationStep.tsx) and
// Albie's own Site Customization form values. Kept as plain globals (no
// modules) so this file can be loaded as a classic content script alongside
// content.js and share scope.

// Our onboarding's Timezone <select> only offers 31 IANA zones (see
// src/steps/modules/GeneralInformationStep.tsx). Albie's own timezone select
// offers a different, larger set of ~39 IANA zones. Where the exact IANA
// string isn't one Albie offers, we map to the closest same-UTC-offset zone
// Albie *does* offer. This table is exhaustive over our 31 possible values.
const TIMEZONE_MAP = {
  'Pacific/Honolulu': 'Pacific/Honolulu',
  'America/Anchorage': 'America/Anchorage',
  'America/Los_Angeles': 'America/Los_Angeles',
  'America/Denver': 'America/Denver',
  'America/Chicago': 'America/Chicago',
  'America/New_York': 'America/New_York',
  'America/Santiago': 'America/Halifax', // both UTC-4, Albie has no Chile zone
  'America/Argentina/Buenos_Aires': 'America/Sao_Paulo', // both UTC-3
  'America/Sao_Paulo': 'America/Sao_Paulo',
  'Atlantic/Azores': 'Atlantic/Azores',
  'Europe/London': 'Europe/London',
  'Europe/Lisbon': 'Europe/London', // same civil time as London
  'Europe/Paris': 'Europe/Paris',
  'Europe/Copenhagen': 'Europe/Paris', // UTC+1, Albie has no CET zone besides Paris
  'Europe/Madrid': 'Europe/Paris',
  'Europe/Berlin': 'Europe/Paris',
  'Europe/Rome': 'Europe/Paris',
  'Europe/Amsterdam': 'Europe/Paris',
  'Europe/Stockholm': 'Europe/Paris',
  'Europe/Oslo': 'Europe/Paris',
  'Europe/Zurich': 'Europe/Paris',
  'Europe/Athens': 'Europe/Kaliningrad', // both UTC+2
  'Europe/Helsinki': 'Europe/Kaliningrad',
  'Europe/Istanbul': 'Europe/Moscow', // both UTC+3, no DST
  'Asia/Dubai': 'Asia/Dubai',
  'Asia/Kolkata': 'Asia/Kolkata',
  'Asia/Jakarta': 'Asia/Bangkok', // both UTC+7
  'Asia/Singapore': 'Asia/Shanghai', // both UTC+8
  'Asia/Tokyo': 'Asia/Tokyo',
  'Australia/Sydney': 'Australia/Sydney',
  'Pacific/Auckland': 'Pacific/Auckland',
};

// Our onboarding offers 18 languages; Albie's site-customization only
// supports these three. Anything else has no safe equivalent, so it's left
// unmapped (the field is skipped rather than guessed).
const LANGUAGE_MAP = {
  en: 'EN',
  es: 'ES',
  pt: 'PT-BR',
};

// Our onboarding offers 28 ISO currency codes (src/data/currencies.ts);
// Albie's site-customization only accepts these. Anything outside this set
// is left unmapped (skipped) rather than guessed.
const CURRENCY_SUPPORTED = new Set([
  'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD',
  'AED', 'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN',
]);

// Builds the fill plan from a raw Airtable record's `fields` object
// (Onboardings_Hotel field names, see api/_db.ts:hotelFieldsFromPayload).
// Returns { textFields: {name: value}, selectFields: {label: value} } —
// only entries we have a confident source/mapping for are included;
// everything else is left for the human to fill in manually.
function buildFillPlan(fields) {
  const textFields = {};
  const selectFields = {};

  const addressParts = [
    fields['Address'],
    fields['City'],
    [fields['State / Province'], fields['ZIP / Postal Code']].filter(Boolean).join(' '),
    fields['Country'],
  ].filter((p) => p && String(p).trim());
  if (addressParts.length) textFields['siteDetails.location.address'] = addressParts.join(', ');

  if (fields['Property Name']) textFields['siteDetails.siteName'] = fields['Property Name'];
  if (fields['Phone']) textFields['siteDetails.phone'] = fields['Phone'];
  if (fields['Website URL']) textFields['siteDetails.url'] = fields['Website URL'];
  if (fields['Subdomain']) textFields['siteDetails.subDomain'] = fields['Subdomain'];
  if (fields['Notification Email']) textFields['notifications.primaryEmail'] = fields['Notification Email'];

  if (fields['Date Format']) selectFields['Date format'] = fields['Date Format'];

  const tz = fields['Timezone'] && TIMEZONE_MAP[fields['Timezone']];
  if (tz) selectFields['timezone'] = tz;

  const currency = fields['Currency'];
  if (currency && CURRENCY_SUPPORTED.has(currency)) selectFields['currency'] = currency;

  const lang = fields['Language'] && LANGUAGE_MAP[fields['Language']];
  if (lang) selectFields['Primary Language'] = lang;

  return { textFields, selectFields };
}
