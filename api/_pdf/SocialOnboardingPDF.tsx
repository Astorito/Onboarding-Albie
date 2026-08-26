// Social Media onboarding summary PDF. Mirrors the structure/factory pattern
// of api/_pdf/MarketingOnboardingPDF.tsx (see that file's comment for why
// react-pdf components are passed in rather than statically imported).
// Label map ported verbatim from src/social/SocialReviewStep.tsx's
// FIELD_LABELS so the client Review screen, the Airtable-facing field names,
// and this PDF all describe the same field the same way.

import * as React from 'react';
import { createStyles } from './styles';

const LABELS: Record<string, string> = {
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

const friendly = (key: string): string =>
  LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

export function createSocialPDF(pdf: { Document: any; Page: any; Text: any; View: any; StyleSheet: any }) {
  const { Document, Page, Text, View, StyleSheet } = pdf;
  const styles = createStyles(StyleSheet);

  const SectionHeader: React.FC<{ title: string; eyebrow?: string }> = ({ title, eyebrow }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionBullet} />
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      {eyebrow && <Text style={styles.sectionEyebrow}>{eyebrow}</Text>}
    </View>
  );

  const PageFooter: React.FC<{ sessionId: string }> = ({ sessionId }) => (
    <View style={styles.pageFooter} fixed>
      <Text>TAG Digital Marketing Onboarding · {sessionId}</Text>
      <Text render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );

  // Checkboxes travel as the browser's own 'on'/'' convention. *OtherEnabled
  // fields only exist to CSS-trigger the client's "Other: ___" reveal — the
  // text is already shown under its own *Other key, so skip the switch
  // itself (same reasoning as the client Review screen's Section filter).
  const KeyValueGrid: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
    const entries = Object.entries(data).filter(
      ([k, v]) => !k.endsWith('OtherEnabled') && v !== null && v !== undefined && v !== false && String(v).trim() !== '',
    );
    if (entries.length === 0) {
      return <Text style={styles.empty}>No data entered for this section.</Text>;
    }
    return (
      <View style={styles.kvGrid}>
        {entries.map(([k, v]) => (
          <View key={k} style={styles.kvCell}>
            <Text style={styles.kvLabel}>{friendly(k).toUpperCase()}</Text>
            <Text style={styles.kvValue}>{v === 'on' ? 'Yes' : String(v)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const SocialSection: React.FC<{
    title: string; eyebrow: string; data: Record<string, unknown> | undefined; sessionId: string;
  }> = ({ title, eyebrow, data, sessionId }) => (
    <Page size="A4" style={styles.page}>
      <SectionHeader title={title} eyebrow={eyebrow} />
      <View style={styles.contentBody}>
        <KeyValueGrid data={data ?? {}} />
      </View>
      <PageFooter sessionId={sessionId} />
    </Page>
  );

  const SocialPDF: React.FC<{ payload: any }> = ({ payload }) => {
    const sessionId = payload.sessionId ?? '';
    return (
      <Document
        title={`TAG Digital Marketing · ${payload.company?.companyName ?? 'Submission'}`}
        author="TAG"
        subject="Social Media Onboarding"
      >
        <SocialSection title="Company & Social Profiles" eyebrow="STEP 01" data={payload.company} sessionId={sessionId} />
        <SocialSection title="Goals & Audience" eyebrow="STEP 02" data={payload.goals} sessionId={sessionId} />
        <SocialSection title="Offerings & Content Priorities" eyebrow="STEP 03" data={payload.offerings} sessionId={sessionId} />
        <SocialSection title="Brand Voice & Visual Identity" eyebrow="STEP 04" data={payload.brand} sessionId={sessionId} />
        <SocialSection title="Assets & Content Creation" eyebrow="STEP 05" data={payload.assets} sessionId={sessionId} />
        <SocialSection title="Competitors & References" eyebrow="STEP 06" data={payload.competitors} sessionId={sessionId} />
      </Document>
    );
  };

  return SocialPDF;
}
