// Website Project onboarding summary PDF. Mirrors the structure/factory
// pattern of api/_pdf/MarketingOnboardingPDF.tsx (react-pdf components passed
// in rather than statically imported — see api/_pdf/OnboardingPDF.tsx's
// comment for why). Self-contained: its own label map, no overlap with
// api/_pdf/fieldLabels.ts's hotel-specific keys.
//
// Renders the payload exactly as POSTed by the client (api/send-onboarding.ts
// passes req.body straight through, not a re-read from storage), so this must
// tolerate the same raw shape src/website/WebsiteApp.tsx builds — including
// the 5 fields (industry, propertyType, bookingEngine, domainProperty,
// hostingProvider) that travel as raw slugs like 'hotel_hospitality' rather
// than a human label (kept that way end-to-end so resuming a session's
// SelectableCard prefill stays a trivial string comparison — see the longer
// comment on websiteFieldsFromPayload in api/_db.ts). The 5 VALUE_LABELS maps
// below translate those slugs for display only; nothing here feeds back into
// the payload or storage.

import * as React from 'react';
import { createStyles } from './styles';

const LABELS: Record<string, string> = {
  companyName: 'Company / Brand Name',
  industry: 'Industry / Market',
  industryOther: 'Industry (Other)',
  existingWebsiteUrl: 'Existing Website URL',
  contactPerson: 'Main Contact Person',
  email: 'Email Address',
  goalBrandAwareness: 'Goal: Brand Awareness',
  goalLeadGeneration: 'Goal: Lead Generation',
  goalSalesEcommerce: 'Goal: Sales / E-commerce',
  goalInformational: 'Goal: Informational',
  goalOther: 'Goal (Other)',
  hasBrandIdentity: 'Has Brand Identity / Guidelines',
  resourceLogo: 'Resource: Logo',
  resourceTypography: 'Resource: Typography / Brand Fonts',
  resourceColors: 'Resource: Colors',
  resourceGuidelines: 'Resource: Brand Guidelines',
  resourceOther: 'Resource (Other)',
  brandDescriptionWords: 'Brand in 3-5 Words',
  estimatedPages: 'Estimated Number of Pages',
  pageHome: 'Page: Home',
  pageAboutUs: 'Page: About Us',
  pageServicesProducts: 'Page: Services / Products',
  pageBlogNews: 'Page: Blog / News',
  pageContact: 'Page: Contact',
  pageTestimonials: 'Page: Testimonials / Case Studies',
  pageOther: 'Page (Other)',
  oneSentenceDescription: 'One-Sentence Description',
  idealCustomer: 'Ideal Customer',
  businessLocation: 'Business Location',
  companyStory: 'Company Story',
  servicesDescription: 'Main Services / Products',
  brandStoryValues: 'Brand Story / Core Values',
  referenceWebsites: 'Reference Websites',
  likesAboutReferences: 'Likes About References',
  dislikesToAvoid: 'Dislikes / What to Avoid',
  competitors: 'Competitors',
  isHotelProject: 'Hotel / Hospitality Project',
  propertyType: 'Property Type',
  propertyTypeOther: 'Property Type (Other)',
  hotelLocations: 'Location(s)',
  roomTypesCount: 'Room Types / Categories',
  featureExperiences: 'Feature: Experiences',
  featureActivities: 'Feature: Activities',
  featureWeddingsEvents: 'Feature: Weddings & Events',
  featureDining: 'Feature: Dining',
  featureAmenities: 'Feature: Amenities',
  featureAccommodations: 'Feature: Accommodations',
  featureOffersPackages: 'Feature: Offers & Packages',
  amenitiesHighlight: 'Amenities/Activities to Highlight',
  professionalPhotography: 'Professional Photography Access',
  hasActiveBookingEngine: 'Has Active Booking Engine',
  bookingEngine: 'Booking Engine',
  bookingEngineOther: 'Booking Engine (Other)',
  pms: 'PMS',
  channelManager: 'Channel Manager',
  featureContactForms: 'Feature: Contact Forms',
  featureNewsletter: 'Feature: Newsletter Subscriptions',
  featureBookingSystem: 'Feature: Booking System',
  featureEcommerce: 'Feature: E-commerce',
  featureBlogDynamic: 'Feature: Blog / Dynamic Content',
  featureThirdPartyIntegrations: 'Feature: Third-Party Integrations',
  featureOther: 'Feature (Other)',
  seoGoals: 'SEO Goals / Priority Keywords',
  domainProperty: 'Domain Property',
  domainPropertyOther: 'Domain Property (Other)',
  hostingProvider: 'Hosting Provider',
  hostingProviderOther: 'Hosting Provider (Other)',
  additionalInfo: 'Additional Info',
  desiredTimeline: 'Desired Timeline / Deadline',
};

// The four *OtherEnabled keys are pure CSS-reveal triggers on the client (see
// src/website/OtherReveal.tsx) — the actual answer lives in the matching
// *Other field, which already has its own label above. Skipping these avoids
// a redundant "Goal Other Enabled: Yes" line next to "Goal (Other): ...".
const SKIP_KEYS = new Set(['goalOtherEnabled', 'resourceOtherEnabled', 'pageOtherEnabled', 'featureOtherEnabled']);

// Value -> display label, for the 5 fields that travel as raw slugs.
const VALUE_LABELS: Record<string, Record<string, string>> = {
  industry: {
    hotel_hospitality: 'Hotel / Hospitality', restaurant_fnb: 'Restaurant / F&B',
    real_estate: 'Real Estate', corporate_services: 'Corporate / Services',
    ecommerce: 'E-commerce', other: 'Other',
  },
  propertyType: {
    collection_hotel: 'Collection hotel', individual_hotel: 'Individual hotel',
    boutique_hotel: 'Boutique hotel', lodge: 'Lodge', resort: 'Resort',
    vacation_rental: 'Vacation rental', other: 'Other',
  },
  bookingEngine: { albie: 'ALBIE', cloudbeds: 'Cloudbeds', siteminder: 'SiteMinder', other: 'Other' },
  domainProperty: {
    already_purchased: 'Already purchased', need_assistance: 'Need assistance',
    not_sure: 'Not sure', other: 'Other',
  },
  hostingProvider: {
    already_have: 'Already have', need_assistance: 'Need assistance',
    not_sure: 'Not sure', other: 'Other',
  },
};

const friendly = (key: string): string =>
  LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

const displayValue = (key: string, v: unknown): string => {
  if (v === 'on') return 'Yes';
  if (v === 'yes') return 'Yes';
  if (v === 'no') return 'No';
  if (v === 'planned') return 'Planned';
  const map = VALUE_LABELS[key];
  if (map && typeof v === 'string' && map[v]) return map[v];
  return String(v);
};

export function createWebsitePDF(pdf: { Document: any; Page: any; Text: any; View: any; StyleSheet: any }) {
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
      <Text>TAG Website Project Onboarding · {sessionId}</Text>
      <Text render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );

  const KeyValueGrid: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
    const entries = Object.entries(data).filter(
      ([k, v]) => !SKIP_KEYS.has(k) && v !== null && v !== undefined && v !== false && String(v).trim() !== '',
    );
    if (entries.length === 0) {
      return <Text style={styles.empty}>No data entered for this section.</Text>;
    }
    return (
      <View style={styles.kvGrid}>
        {entries.map(([k, v]) => (
          <View key={k} style={styles.kvCell}>
            <Text style={styles.kvLabel}>{friendly(k).toUpperCase()}</Text>
            <Text style={styles.kvValue}>{displayValue(k, v)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const WebsiteSection: React.FC<{
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

  const WebsitePDF: React.FC<{ payload: any }> = ({ payload }) => {
    const sessionId = payload.sessionId ?? '';
    // Same gate the client itself applies (WebsiteApp.tsx / WebsiteReviewStep.tsx)
    // — only print the two hotel-specific pages when the client actually
    // confirmed a hospitality project.
    const isHotelProject = payload.hotelGate?.isHotelProject === 'yes';
    return (
      <Document
        title={`TAG Website Project · ${payload.company?.companyName ?? 'Submission'}`}
        author="TAG"
        subject="Website Project Onboarding"
      >
        <WebsiteSection title="Company Information" eyebrow="STEP 01" data={payload.company} sessionId={sessionId} />
        <WebsiteSection title="Brand Identity" eyebrow="STEP 02" data={payload.brand} sessionId={sessionId} />
        <WebsiteSection title="Website Structure & Content" eyebrow="STEP 03" data={payload.structure} sessionId={sessionId} />
        <WebsiteSection title="Inspiration & References" eyebrow="STEP 04" data={payload.inspiration} sessionId={sessionId} />
        <WebsiteSection title="Hotel / Hospitality" eyebrow="STEP 05" data={payload.hotelGate} sessionId={sessionId} />
        {isHotelProject && (
          <>
            <WebsiteSection title="Hotel / Hospitality — General Information" eyebrow="STEP 06" data={payload.hotelGeneral} sessionId={sessionId} />
            <WebsiteSection title="Hotel / Hospitality — Technical Information" eyebrow="STEP 07" data={payload.hotelTechnical} sessionId={sessionId} />
          </>
        )}
        <WebsiteSection title="Features & Infrastructure" eyebrow="STEP 08" data={payload.features} sessionId={sessionId} />
      </Document>
    );
  };

  return WebsitePDF;
}
