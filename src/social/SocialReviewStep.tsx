import { Icon } from '../components/ui/primitives';
import { SOCIAL_MODULES } from './constants';

export interface SocialReviewData {
  company: Record<string, string>;
  goals: Record<string, string>;
  offerings: Record<string, string>;
  brand: Record<string, string>;
  assets: Record<string, string>;
  competitors: Record<string, string>;
}

const FIELD_LABELS: Record<string, string> = {
  // Company & Social Profiles
  email: 'Email',
  companyName: 'Company or Brand Name',
  hasWebsite: 'Has an Active Website',
  websiteUrl: 'Website URL',
  industry: 'Industry',
  location: 'Location(s)',
  businessDescription: 'Business Description',
  instagramUrl: 'Instagram',
  facebookUrl: 'Facebook',
  linkedinUrl: 'LinkedIn',
  tiktokUrl: 'TikTok',
  youtubeUrl: 'YouTube',
  otherPlatforms: 'Other Platforms',

  // Goals & Audience
  goalBrandAwareness: 'Goal: Increase Brand Awareness',
  goalBrandPositioning: 'Goal: Improve Brand Positioning',
  goalGrowAudience: 'Goal: Grow the Audience',
  goalEngagement: 'Goal: Increase Engagement',
  goalConversion: 'Goal: Increase Conversion',
  goalWebsiteTraffic: 'Goal: Drive Website Traffic',
  goalLeads: 'Goal: Generate Leads',
  goalBookings: 'Goal: Increase Bookings/Reservations',
  goalPromoteServices: 'Goal: Promote Services/Products',
  goalPromoteEvents: 'Goal: Promote Events/Experiences',
  goalTrust: 'Goal: Build Trust & Credibility',
  goalEducate: 'Goal: Educate the Audience',
  goalCustomerExperience: 'Goal: Showcase Customer Experience',
  goalRecruitment: 'Goal: Support Recruitment',
  goalCompanyNews: 'Goal: Communicate Company News',
  goalExistingRelationships: 'Goal: Strengthen Existing Relationships',
  goalOther: 'Goal (Other)',
  primaryGoal: 'Most Important Goal & Why',
  successDefinition: 'Definition of Success',
  inspirationBrands: 'Inspiration Brands & References',
  primaryAudience: 'Primary Target Audience',
  secondaryAudiences: 'Secondary Audiences',
  currentCustomerProfile: 'Current Customer Profile',
  audienceMisconceptions: 'Audience Misconceptions',

  // Offerings & Content Priorities
  offeringsDescription: 'Main Products, Services & Experiences',
  priorityOfferings: 'Priority Offerings',
  newOfferings: 'New or Upcoming Offerings',
  contentTopics: 'Regular Content Topics',
  mustCommunicateTopics: 'Must-Communicate Topics',
  topicsToAvoid: 'Topics to Avoid',
  contentBalance: 'Content Balance',

  // Brand Voice & Visual Identity
  voiceProfessional: 'Voice: Professional',
  voiceFriendly: 'Voice: Friendly',
  voiceApproachable: 'Voice: Approachable',
  voiceInformative: 'Voice: Informative',
  voiceEducational: 'Voice: Educational',
  voiceInspirational: 'Voice: Inspirational',
  voiceAspirational: 'Voice: Aspirational',
  voiceSophisticated: 'Voice: Sophisticated',
  voiceLuxury: 'Voice: Luxury',
  voiceCasual: 'Voice: Casual',
  voicePlayful: 'Voice: Playful',
  voiceModern: 'Voice: Modern',
  voiceBold: 'Voice: Bold',
  voiceWarm: 'Voice: Warm',
  voiceTrustworthy: 'Voice: Trustworthy',
  voiceAuthoritative: 'Voice: Authoritative',
  voiceTechnical: 'Voice: Technical',
  voiceCommunityFocused: 'Voice: Community-focused',
  voiceOther: 'Voice (Other)',
  brandPersonality: 'Brand Personality',
  wordsToUse: 'Words & Phrases to Use',
  wordsToAvoid: 'Words & Phrases to Avoid',
  preferredLanguage: 'Preferred Language',
  bilingualApproach: 'Bilingual Approach',
  hasBrandIdentity: 'Has Established Brand Identity',
  brandMaterialsUrl: 'Brand Materials',
  visualStyle: 'Preferred Visual Style',
  hasApprovedTemplates: 'Has Approved Templates',
  templatesUrl: 'Templates Link',

  // Assets & Content Creation
  assetProfessionalPhotography: 'Asset: Professional Photography',
  assetProfessionalVideo: 'Asset: Professional Video',
  assetUserGenerated: 'Asset: User-Generated Content',
  assetTeamPhotos: 'Asset: Team Photos',
  assetProductPhotos: 'Asset: Product Photos',
  assetPropertyPhotos: 'Asset: Property/Location Photos',
  assetEventPhotos: 'Asset: Event Photos',
  assetLifestylePhotography: 'Asset: Lifestyle Photography',
  assetDroneFootage: 'Asset: Drone Footage',
  assetInterviews: 'Asset: Interviews',
  assetTestimonials: 'Asset: Testimonials',
  assetGraphicAssets: 'Asset: Graphic Assets',
  assetStockPhotography: 'Asset: Stock Photography',
  assetNoCurrentAssets: 'No Current Visual Assets',
  assetLibraryUrl: 'Asset Library Link',
  assetLibraryPermissionConfirmed: 'Permission to Use Shared Materials',
  restrictedAssets: 'Restricted Assets',
  willProvideNewContent: 'Will Regularly Provide New Content',
  contentContactPerson: 'Internal Content Contact (POC)',
  onSiteContentCapture: 'On-Site Content Capture Available',
  onSiteContactInfo: 'On-Site Contact',
  interestedInProduction: 'Interested in Professional Production',

  // Competitors & References
  directCompetitors: 'Direct Competitors',
  aspirationalBrands: 'Aspirational Brands',
  contentReferences: 'Content References',
  contentToAvoid: 'Content You Dislike',
};

const YES_NO_IN_DEV: Record<string, string> = { yes: 'Yes', no: 'No', in_development: 'Currently in development' };
const YES_NO: Record<string, string> = { yes: 'Yes', no: 'No' };
const RADIO_LABELS: Record<string, Record<string, string>> = {
  hasWebsite: YES_NO_IN_DEV,
  hasApprovedTemplates: YES_NO,
  preferredLanguage: { english: 'English', spanish: 'Spanish', bilingual: 'Bilingual' },
  hasBrandIdentity: { yes: 'Yes', no: 'No', partially: 'Partially', in_development: 'Being developed' },
  willProvideNewContent: { yes: 'Yes', no: 'No', occasionally: 'Occasionally', tbc: 'To be confirmed' },
  onSiteContentCapture: { yes: 'Yes', no: 'No', sometimes: 'Sometimes' },
  interestedInProduction: { yes: 'Yes', no: 'No', possibly: 'Possibly in the future' },
};

const friendly = (key: string) => FIELD_LABELS[key] ?? key;

const display = (key: string, val: string) => {
  if (key.endsWith('Enabled')) return val === 'other' ? 'Selected' : val;
  if (/^(goal|voice|asset)[A-Z]/.test(key) && !key.endsWith('Other')) return val === 'on' ? 'Selected' : val;
  if (key === 'assetLibraryPermissionConfirmed') return val === 'on' ? 'Confirmed' : val;
  if (RADIO_LABELS[key]) return RADIO_LABELS[key][val] ?? val;
  return val;
};

const Section = ({ moduleId, data }: { moduleId: string; data: Record<string, string> }) => {
  // *OtherEnabled fields only exist to CSS-trigger the "Other: ___" reveal —
  // the text the user actually typed is already shown under its own *Other
  // key, so surfacing the switch itself would just be a redundant raw key.
  const entries = Object.entries(data).filter(
    ([k, v]) => !k.endsWith('OtherEnabled') && v && String(v).trim() !== '',
  );
  const mod = SOCIAL_MODULES.find(m => m.id === moduleId)!;
  return (
    <div className="w-full bg-white border border-outline-variant rounded-2xl p-6 mb-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Icon name={mod.icon} className="text-secondary text-2xl" />
        <h3 className="font-bold text-primary">{mod.title}</h3>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-on-surface-variant italic">No information provided.</p>
      ) : (
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
          {entries.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <dt className="font-bold text-primary text-[10px] uppercase tracking-wider">{friendly(k)}</dt>
              <dd className="text-on-surface-variant break-words">{display(k, v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

export const SocialReviewStep = ({ reviewData }: { reviewData: SocialReviewData }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Review Your Answers</h1>
      <p className="text-on-surface-variant text-xs">
        Double-check everything before submitting your Social Media onboarding.
      </p>
    </div>
    <Section moduleId="company" data={reviewData.company} />
    <Section moduleId="goals" data={reviewData.goals} />
    <Section moduleId="offerings" data={reviewData.offerings} />
    <Section moduleId="brand" data={reviewData.brand} />
    <Section moduleId="assets" data={reviewData.assets} />
    <Section moduleId="competitors" data={reviewData.competitors} />
  </div>
);
