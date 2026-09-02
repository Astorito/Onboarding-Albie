// Powers an approximate "% of fields filled in" shown on grid cards — a coarse admin
// indicator, not a source of truth. GET /api/admin/onboardings already spreads every
// Airtable column onto each row (see listAirtableOnboardings in api/_db.ts), so this reads
// straight off data the API already returns; nothing new is fetched or written.
//
// The field lists below mirror the exact Airtable column names in api/_db.ts's
// hotelFieldsFromPayload / marketingFieldsFromPayload / websiteFieldsFromPayload /
// SOCIAL_MODULE_FIELDS. Duplicated (not imported) because api/ builds as a separate CJS
// project from this front end — same reason websiteFieldsFromPayload's own comment gives
// for not importing its label map the other way. If a product's field set changes there,
// mirror the change here.
//
// Known imprecision, accepted as fine for a dashboard-only nice-to-have: some fields carry
// non-empty defaults the form saves even untouched (e.g. Hotel's Add-ons/Taxes/Cancellation
// Policies), and Web Design's hotel-specific fields only apply to hotel projects — both can
// make the % run a little high. Not worth extra logic to correct for this.

import type { Onboarding } from './api';

const HOTEL_TEXT_FIELDS = [
  'Property Type', 'Property Name', 'Description', 'Address', 'City', 'State / Province',
  'Country', 'ZIP / Postal Code', 'Timezone', 'Currency', 'Language', 'Phone',
  'Notification Email', 'Website URL', 'Site Title', 'Primary Color', 'Secondary Color',
  'Accent Color', 'Font Family', 'Button Style', 'Logo URL', 'Favicon URL', 'Subdomain',
  'GTM ID', 'GA4 Measurement ID', 'Google Map ID', 'Property Terms & Conditions',
  'Date Format', 'Has PMS', 'PMS Name', 'Has Channel Manager', 'Channel Manager Name',
];
const HOTEL_JSON_FIELDS = ['Cancellation Policies', 'Rooms', 'Add-ons', 'Rates', 'Taxes', 'Group Members', 'SiteMinder'];

const MARKETING_TEXT_FIELDS = [
  'Email', 'Business Name', 'Past Campaigns', 'Google Ads Account', 'GTM Account',
  'GA4 Account', 'Facebook Account', 'Drive Folder URL', 'YouTube URL', 'Goal Other',
  'Competitors', 'Target Locations', 'Approve Ad Copy', 'Monthly Budget', 'Own Credit Card',
  'Launch Date', 'Ideal Customer Insights', 'Additional Info',
];
const MARKETING_BOOL_FIELDS = ['Goal Brand Awareness', 'Goal Traffic', 'Goal Leads', 'Goal Purchases/Bookings'];

const WEBSITE_TEXT_FIELDS = [
  'Company / Brand Name', 'Industry / Market', 'Industry (Other)', 'Existing Website URL',
  'Main Contact Person', 'Email Address', 'Goal (Other)',
  'Has Brand Identity / Guidelines', 'Resource (Other)', 'Brand in 3-5 Words',
  'Estimated Number of Pages', 'Page (Other)', 'One-Sentence Description', 'Ideal Customer',
  'Business Location', 'Company Story', 'Main Services / Products', 'Brand Story / Core Values',
  'Reference Websites', 'Likes About References', 'Dislikes / What to Avoid', 'Competitors',
  'Hotel / Hospitality Project',
  'Property Type', 'Property Type (Other)', 'Location(s)', 'Room Types / Categories',
  'Amenities/Activities to Highlight', 'Professional Photography Access',
  'Has Active Booking Engine', 'Booking Engine', 'Booking Engine (Other)', 'PMS', 'Channel Manager',
  'Feature (Other)', 'SEO Goals / Priority Keywords', 'Domain Property', 'Domain Property (Other)',
  'Hosting Provider', 'Hosting Provider (Other)', 'Additional Info', 'Desired Timeline / Deadline',
];
const WEBSITE_BOOL_FIELDS = [
  'Goal: Brand Awareness', 'Goal: Lead Generation', 'Goal: Sales / E-commerce', 'Goal: Informational',
  'Resource: Logo', 'Resource: Typography / Brand Fonts', 'Resource: Colors', 'Resource: Brand Guidelines',
  'Page: Home', 'Page: About Us', 'Page: Services / Products', 'Page: Blog / News', 'Page: Contact',
  'Page: Testimonials / Case Studies',
  'Feature: Experiences', 'Feature: Activities', 'Feature: Weddings & Events', 'Feature: Dining',
  'Feature: Amenities', 'Feature: Accommodations', 'Feature: Offers & Packages',
  'Feature: Contact Forms', 'Feature: Newsletter Subscriptions', 'Feature: Booking System',
  'Feature: E-commerce', 'Feature: Blog / Dynamic Content', 'Feature: Third-Party Integrations',
];

// Social's 6 modules are each one JSON-blob Airtable column — mirrors SOCIAL_MODULE_FIELDS
// in api/_db.ts. Subfields travel as plain strings (the browser's own FormData convention,
// 'on' for a checked box), so they're all checked the same way as text fields.
const SOCIAL_MODULE_SUBFIELDS: Record<string, string[]> = {
  'Company JSON': [
    'email', 'companyName', 'hasWebsite', 'websiteUrl', 'industry', 'location',
    'businessDescription', 'instagramUrl', 'facebookUrl', 'linkedinUrl', 'tiktokUrl',
    'youtubeUrl', 'otherPlatforms',
  ],
  'Goals JSON': [
    'goalBrandAwareness', 'goalBrandPositioning', 'goalGrowAudience', 'goalEngagement',
    'goalConversion', 'goalWebsiteTraffic', 'goalLeads', 'goalBookings', 'goalPromoteServices',
    'goalPromoteEvents', 'goalTrust', 'goalEducate', 'goalCustomerExperience', 'goalRecruitment',
    'goalCompanyNews', 'goalExistingRelationships', 'goalOtherEnabled', 'goalOther', 'primaryGoal',
    'successDefinition', 'inspirationBrands', 'primaryAudience', 'secondaryAudiences',
    'currentCustomerProfile', 'audienceMisconceptions',
  ],
  'Offerings JSON': [
    'offeringsDescription', 'priorityOfferings', 'newOfferings', 'contentTopics',
    'mustCommunicateTopics', 'topicsToAvoid', 'contentBalance',
  ],
  'Brand JSON': [
    'voiceProfessional', 'voiceFriendly', 'voiceApproachable', 'voiceInformative',
    'voiceEducational', 'voiceInspirational', 'voiceAspirational', 'voiceSophisticated',
    'voiceLuxury', 'voiceCasual', 'voicePlayful', 'voiceModern', 'voiceBold', 'voiceWarm',
    'voiceTrustworthy', 'voiceAuthoritative', 'voiceTechnical', 'voiceCommunityFocused',
    'voiceOtherEnabled', 'voiceOther', 'brandPersonality', 'wordsToUse', 'wordsToAvoid',
    'preferredLanguage', 'bilingualApproach', 'hasBrandIdentity', 'brandMaterialsUrl',
    'visualStyle', 'hasApprovedTemplates', 'templatesUrl',
  ],
  'Assets JSON': [
    'assetProfessionalPhotography', 'assetProfessionalVideo', 'assetUserGenerated',
    'assetTeamPhotos', 'assetProductPhotos', 'assetPropertyPhotos', 'assetEventPhotos',
    'assetLifestylePhotography', 'assetDroneFootage', 'assetInterviews', 'assetTestimonials',
    'assetGraphicAssets', 'assetStockPhotography', 'assetNoCurrentAssets', 'assetLibraryUrl',
    'assetLibraryPermissionConfirmed', 'restrictedAssets', 'willProvideNewContent',
    'contentContactPerson', 'onSiteContentCapture', 'onSiteContactInfo', 'interestedInProduction',
  ],
  'Competitors JSON': ['directCompetitors', 'aspirationalBrands', 'contentReferences', 'contentToAvoid'],
};

function isTextFilled(v: unknown): boolean {
  return typeof v === 'string' && v.trim() !== '';
}

// A parsed JSON value counts as "filled" only if something inside it is itself non-empty —
// a bare non-empty-looking object like SiteMinder's default {connect:false, sites:[]} must
// not count as filled just because it has keys.
function isJsonFilled(raw: unknown): boolean {
  if (typeof raw !== 'string' || !raw) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }
  if (Array.isArray(parsed)) return parsed.length > 0;
  if (parsed && typeof parsed === 'object') {
    return Object.values(parsed as Record<string, unknown>).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      if (v && typeof v === 'object') return Object.keys(v).length > 0;
      return !!v && String(v).trim() !== '';
    });
  }
  return false;
}

// Returns 0-100, or null when there's nothing to compute against — an Engagement's own row
// carries no product form fields (its bundled products live in separate rows this endpoint
// doesn't return alongside it), so its card shows no progress bar at all rather than a
// fabricated number.
export function computeCompletionPercent(o: Onboarding): number | null {
  const type = o['Type'] ?? 'hotel';
  if (type === 'engagement') return null;

  const raw = o as unknown as Record<string, unknown>;
  let total = 0;
  let filled = 0;

  const countText = (fields: string[]) => {
    for (const f of fields) { total++; if (isTextFilled(raw[f])) filled++; }
  };
  const countBool = (fields: string[]) => {
    for (const f of fields) { total++; if (raw[f] === true) filled++; }
  };
  const countJson = (fields: string[]) => {
    for (const f of fields) { total++; if (isJsonFilled(raw[f])) filled++; }
  };

  if (type === 'marketing') {
    countText(MARKETING_TEXT_FIELDS);
    countBool(MARKETING_BOOL_FIELDS);
  } else if (type === 'webdesign') {
    countText(WEBSITE_TEXT_FIELDS);
    countBool(WEBSITE_BOOL_FIELDS);
  } else if (type === 'social') {
    for (const [column, subfields] of Object.entries(SOCIAL_MODULE_SUBFIELDS)) {
      let parsedModule: Record<string, unknown> = {};
      try {
        parsedModule = JSON.parse((raw[column] as string) ?? '{}');
      } catch {
        parsedModule = {};
      }
      for (const sub of subfields) {
        total++;
        const v = parsedModule[sub];
        if (v === true || (typeof v === 'string' && v.trim() !== '')) filled++;
      }
    }
  } else {
    // 'hotel' — also the fallback for legacy rows with no Type, matching
    // matchesProductFilter's own hotel-fallback rule elsewhere in the admin.
    countText(HOTEL_TEXT_FIELDS);
    countJson(HOTEL_JSON_FIELDS);
  }

  if (total === 0) return null;
  return Math.round((filled / total) * 100);
}
