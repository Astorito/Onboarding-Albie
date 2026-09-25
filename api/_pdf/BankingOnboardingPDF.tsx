// Banking Information onboarding summary PDF — a short ops form for collecting
// payout details from an already-onboarded client. Same factory pattern as
// every other PDF here (see api/_pdf/OnboardingPDF.tsx for why react-pdf
// components are passed in rather than statically imported).

import * as React from 'react';
import { createStyles } from './styles';

const GENERAL_LABELS: Record<string, string> = {
  propertyName: 'Property / Client Name',
  contactName: 'Point of Contact',
  contactEmail: 'Contact Email',
  contactPhone: 'Contact Phone',
  country: 'Property Country',
};

const BANKING_LABELS: Record<string, string> = {
  bankName: 'Bank Name',
  accountType: 'Account Type',
  accountNumber: 'Account Number',
  routingNumber: 'Routing Number',
  swiftRecipientName: 'SWIFT Recipient Name',
  swiftAccountNumber: 'SWIFT Account Number / IBAN',
  swiftBicCode: 'SWIFT / BIC Code',
  swiftBankNameAddress: 'SWIFT Bank Name & Address',
  swiftIntermediaryBank: 'SWIFT Intermediary Bank',
};

const friendly = (labels: Record<string, string>) => (key: string): string =>
  labels[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

export function createBankingPDF(pdf: { Document: any; Page: any; Text: any; View: any; StyleSheet: any }) {
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
      <Text>Banking Information Onboarding · {sessionId}</Text>
      <Text render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );

  const KeyValueGrid: React.FC<{ data: Record<string, unknown>; labels: Record<string, string> }> = ({ data, labels }) => {
    const label = friendly(labels);
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
            <Text style={styles.kvLabel}>{label(k).toUpperCase()}</Text>
            <Text style={styles.kvValue}>{String(v)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const BankingPDF: React.FC<{ payload: any }> = ({ payload }) => {
    const sessionId = payload.sessionId ?? '';
    const general = payload.general ?? {};
    const banking = payload.banking ?? {};

    return (
      <Document
        title={`Banking Information · ${general.propertyName ?? 'Submission'}`}
        author="TAG"
        subject="Banking Information"
      >
        <Page size="A4" style={styles.page}>
          <SectionHeader title="Property & Contact" eyebrow="STEP 01" />
          <View style={styles.contentBody}>
            <KeyValueGrid data={general} labels={GENERAL_LABELS} />
          </View>
          <PageFooter sessionId={sessionId} />
        </Page>

        <Page size="A4" style={styles.page}>
          <SectionHeader title="Banking Details" eyebrow="STEP 02" />
          <View style={styles.contentBody}>
            <KeyValueGrid data={banking} labels={BANKING_LABELS} />
          </View>
          <PageFooter sessionId={sessionId} />
        </Page>
      </Document>
    );
  };

  return BankingPDF;
}
