// Paid Media onboarding summary PDF. Mirrors the structure/factory
// pattern of api/_pdf/OnboardingPDF.tsx (react-pdf components are passed in
// rather than statically imported — see that file's comment for why), but
// self-contained: marketing's field set is small enough not to need a
// separate sections.tsx. Reuses the hotel PDF's visual language (createStyles)
// for consistency, with its own small label map (no overlap with
// api/_pdf/fieldLabels.ts's hotel-specific keys, so that file is untouched).

import * as React from 'react';
import { createStyles } from './styles';

const LABELS: Record<string, string> = {
  email: 'Email',
  businessName: 'Business Name',
  pastCampaigns: 'Past Campaigns',
  googleAdsAccount: 'Google Ads Account',
  gtmAccount: 'Google Tag Manager Account',
  ga4Account: 'Google Analytics 4 Account',
  facebookAccount: 'Facebook Account',
  driveFolderUrl: 'Drive Folder URL',
  youtubeUrl: 'YouTube URL',
  goalBrandAwareness: 'Goal: Brand Awareness',
  goalTraffic: 'Goal: Traffic',
  goalLeads: 'Goal: Leads',
  goalPurchasesBookings: 'Goal: Purchases/Bookings',
  goalOther: 'Other Goal',
  competitors: 'Competitors',
  targetLocations: 'Target Locations',
  approveAdCopy: 'Approves Ad Copy Without Review',
  monthlyBudget: 'Monthly Budget',
  ownCreditCard: 'Has Own Credit Card for Ad Spend',
  launchDate: 'Launch Date',
  idealCustomerInsights: 'Ideal Customer Insights',
  additionalInfo: 'Additional Info',
};

const friendly = (key: string): string =>
  LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

export function createMarketingPDF(pdf: { Document: any; Page: any; Text: any; View: any; StyleSheet: any }) {
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

  // Goal checkboxes travel as the browser's own 'on'/'' convention (see
  // api/_db.ts's marketingFieldsFromPayload/sessionResponseFromMarketingRecord)
  // — displayed here as a plain Yes, matching the checkbox's intent.
  const KeyValueGrid: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
    const entries = Object.entries(data).filter(
      ([, v]) => v !== null && v !== undefined && v !== false && String(v).trim() !== '',
    );
    if (entries.length === 0) {
      return <Text style={styles.empty}>No data entered for this section.</Text>;
    }
    return (
      <View style={styles.kvGrid}>
        {entries.map(([k, v]) => (
          <View key={k} style={styles.kvCell}>
            <Text style={styles.kvLabel}>{friendly(k).toUpperCase()}</Text>
            <Text style={styles.kvValue}>{v === 'on' ? 'Yes' : v === 'yes' ? 'Yes' : v === 'no' ? 'No' : v === 'not_signed_up' ? 'Not signed up for this service' : String(v)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const MarketingSection: React.FC<{
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

  const MarketingPDF: React.FC<{ payload: any }> = ({ payload }) => {
    const sessionId = payload.sessionId ?? '';
    return (
      <Document
        title={`TAG Digital Marketing · ${payload.basics?.businessName ?? 'Submission'}`}
        author="TAG"
        subject="Paid Media Onboarding"
      >
        <MarketingSection title="Business Basics" eyebrow="STEP 01" data={payload.basics} sessionId={sessionId} />
        <MarketingSection title="Accounts & Assets" eyebrow="STEP 02" data={payload.accounts} sessionId={sessionId} />
        <MarketingSection title="Strategy & Budget" eyebrow="STEP 03" data={payload.strategy} sessionId={sessionId} />
      </Document>
    );
  };

  return MarketingPDF;
}
