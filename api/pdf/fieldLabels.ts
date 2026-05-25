// Friendly labels for payload keys — shared by ReviewStep and the PDF.
// Kept in api/pdf/ so the serverless function can import without crossing
// the api/src boundary.

export const FIELD_LABELS: Record<string, string> = {
  // General
  propertyName: 'Property Name',
  description: 'Description',
  address: 'Address',
  city: 'City',
  stateProvince: 'State / Province',
  country: 'Country',
  zipCode: 'ZIP / Postal Code',
  timezone: 'Timezone',
  currency: 'Currency',
  language: 'Language',
  phone: 'Phone',
  notificationEmail: 'Notification Email',
  websiteUrl: 'Website URL',
  // Brand
  siteTitle: 'Site Title',
  primaryColor: 'Primary Color',
  secondaryColor: 'Secondary Color',
  accentColor: 'Accent Color',
  fontFamily: 'Font Family',
  buttonStyle: 'Button Style',
  logoUrl: 'Logo URL',
  faviconUrl: 'Favicon URL',
  // DNS
  subdomain: 'Subdomain',
  gtmId: 'GTM ID',
  ga4Id: 'GA4 Measurement ID',
  mapId: 'Google Map ID',
  // Rates
  rateCode: 'Rate Code',
  rateGroup: 'Rate Group',
  shortTitle: 'Short Title',
  longTitle: 'Long Title',
  status: 'Status',
  orderIndex: 'Display Order',
  availFrom: 'Bookable From',
  availTo: 'Bookable Until',
  minStay: 'Minimum Stay',
  maxStay: 'Maximum Stay',
  appliesTo: 'Applies To',
  imageUrl: 'Image URL',
  tags: 'Tags',
  salesMessages: 'Sales Message',
  terms: 'Terms & Conditions',
};

export const friendly = (key: string): string =>
  FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
