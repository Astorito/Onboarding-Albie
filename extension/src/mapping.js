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

// Albie's Primary/Secondary Font select offers exactly these 15 fonts (plus
// "Upload custom font…", which we never pick automatically).
const ALBIE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Poppins', 'Raleway',
  'Noto Sans', 'Merriweather', 'Nunito Sans', 'PT Sans', 'Source Sans Pro',
  'Ubuntu', 'Playfair Display', 'Work Sans',
];

// Albie's Terms And Conditions textarea (Info & Messages) caps at 1000 chars.
const TERMS_MAX_LENGTH = 1000;

const clean = (v) => (v == null ? '' : String(v).trim());

// Onboarding stores "N/A" as literal text when a hotel has no state/province.
const cleanOrEmpty = (v) => (/^(n\/?a|none|-+)$/i.test(clean(v)) ? '' : clean(v));

// Albie's color inputs only accept #rrggbb. Returns null when the value
// can't be turned into that safely.
function normalizeHex(value) {
  let s = clean(value).toLowerCase();
  if (!s) return null;
  if (s[0] !== '#') s = '#' + s;
  if (/^#[0-9a-f]{3}$/.test(s)) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
  return /^#[0-9a-f]{6}$/.test(s) ? s : null;
}

// Our free-text "Button Style" vs Albie's binary Border Radius select
// (value "0" = right angles, "1" = rounded). Unknown text -> null (skipped).
function borderRadiusValue(buttonStyle) {
  const s = clean(buttonStyle).toLowerCase();
  if (/square|sharp|right.?angle/.test(s)) return '0';
  if (/round|pill/.test(s)) return '1';
  return null;
}

// Builds the fill plan from a raw Airtable record's `fields` object
// (Onboardings_Hotel field names, see api/_db.ts:hotelFieldsFromPayload).
// Returns {
//   textFields:    { rhfName: value }   inputs/textareas, found by name attr
//   labels:        { rhfName: label }   friendly names for the popup report
//   selectFields:  { labelText: value } Radix selects, found by label text
//   cascadeFields: [{label, value}]     cmdk searchable inputs, filled in order
//   notes:         [string]             values we deliberately did NOT fill
// }
// Only entries we have a confident source/mapping for are included, and empty
// values are never included, so a blank in Airtable can't overwrite a field.
function buildFillPlan(fields) {
  const textFields = {};
  const labels = {};
  const selectFields = {};
  const cascadeFields = [];
  const notes = [];

  const addText = (name, label, value) => {
    const v = clean(value);
    if (!v) return;
    textFields[name] = v;
    labels[name] = label;
  };

  // ---- General Info -------------------------------------------------------
  // Address text field: street address only (City/State/Country go in their own dropdowns)
  const addressParts = [
    fields['Address'],
    [cleanOrEmpty(fields['State / Province']), clean(fields['ZIP / Postal Code'])].filter(Boolean).join(' '),
  ].filter((p) => clean(p));
  addText('siteDetails.location.address', 'Address', addressParts.join(', '));

  addText('siteDetails.siteName', 'Site Name', fields['Property Name']);
  addText('siteDetails.phone', 'Phone Number', fields['Phone']);
  addText('siteDetails.url', 'Web Address', fields['Website URL']);
  addText('siteDetails.subDomain', 'Subdomain', fields['Subdomain']);
  addText('notifications.primaryEmail', 'Primary Email', fields['Notification Email']);

  // Cascade dropdowns: order matters — Country populates State options, State populates City
  if (clean(fields['Country'])) cascadeFields.push({ label: 'Country', value: clean(fields['Country']) });
  if (cleanOrEmpty(fields['State / Province'])) cascadeFields.push({ label: 'State', value: cleanOrEmpty(fields['State / Province']) });
  if (clean(fields['City'])) cascadeFields.push({ label: 'City', value: clean(fields['City']) });

  if (clean(fields['Date Format'])) selectFields['Date format'] = clean(fields['Date Format']);

  const tzRaw = clean(fields['Timezone']);
  if (tzRaw) {
    if (TIMEZONE_MAP[tzRaw]) selectFields['timezone'] = TIMEZONE_MAP[tzRaw];
    else notes.push(`Timezone sin mapeo: "${tzRaw}" — completar a mano.`);
  }

  const currency = clean(fields['Currency']);
  if (currency) {
    if (CURRENCY_SUPPORTED.has(currency)) selectFields['currency'] = currency;
    else notes.push(`Currency "${currency}" no soportada por Albie — completar a mano.`);
  }

  const langRaw = clean(fields['Language']);
  if (langRaw) {
    if (LANGUAGE_MAP[langRaw]) selectFields['Primary Language'] = LANGUAGE_MAP[langRaw];
    else notes.push(`Language "${langRaw}" no soportado por Albie (solo EN/ES/PT-BR) — completar a mano.`);
  }

  // ---- Info & Messages ----------------------------------------------------
  const terms = clean(fields['Property Terms & Conditions']);
  if (terms) {
    if (terms.length <= TERMS_MAX_LENGTH) {
      addText('messages.termsAndConditions', 'Terms And Conditions', terms);
    } else {
      notes.push(
        `Terms And Conditions: el texto tiene ${terms.length} caracteres y Albie acepta ${TERMS_MAX_LENGTH}. No se recortó para no cortar texto legal — pegalo a mano.`
      );
    }
  }

  // ---- Customization ------------------------------------------------------
  addText('customize.siteTitle', 'Site Title', fields['Site Title']);

  [
    ['Primary Color', 'customize.primaryColor'],
    ['Secondary Color', 'customize.secondaryColor'],
    ['Accent Color', 'customize.accentColor'],
  ].forEach(([column, name]) => {
    const raw = clean(fields[column]);
    if (!raw) return;
    const hex = normalizeHex(raw);
    if (hex) addText(name, column, hex);
    else notes.push(`${column} "${raw}" no es un color hex válido — completar a mano.`);
  });

  const font = clean(fields['Font Family']);
  if (font) {
    const match = ALBIE_FONTS.find((f) => f.toLowerCase() === font.toLowerCase());
    if (match) selectFields['Primary Font'] = match;
    else notes.push(`Font "${font}" no está en la lista de Albie — elegir otra o subir la fuente a mano.`);
  }

  const buttonStyle = clean(fields['Button Style']);
  if (buttonStyle) {
    const radius = borderRadiusValue(buttonStyle);
    if (radius !== null) selectFields['Border Radius'] = radius;
    else notes.push(`Button Style "${buttonStyle}" no se pudo traducir a Border Radius — elegir a mano.`);
  }

  if (clean(fields['Logo URL']) || clean(fields['Favicon URL'])) {
    notes.push('Logo y Favicon: hay que subir los archivos a mano (Airtable guarda links, Albie pide el archivo).');
  }

  // ---- Advanced -----------------------------------------------------------
  addText('advanced.googleTagManagerCode', 'Google Tag Manager Code', fields['GTM ID']);
  addText('advanced.googleAnalytic4Code', 'Google Analytics 4 Measurement ID', fields['GA4 Measurement ID']);
  addText('advanced.googleMapId', 'Google Map ID', fields['Google Map ID']);

  return { textFields, labels, selectFields, cascadeFields, notes };
}
