import * as React from 'react';
import { createStyles } from './styles';
import { createSections } from './sections';

// No top-level import of '@react-pdf/renderer' here — it's ESM-only and this
// file compiles to CommonJS. `pdf` (Document/Page/Text/View/StyleSheet) is
// passed in from send-onboarding.ts, which loads the package via dynamic
// import(). Everything below is unchanged from the original module-level
// version — just wrapped in this factory.
export function createOnboardingPDF(pdf: { Document: any; Page: any; Text: any; View: any; StyleSheet: any }) {
  const { Document, Page, Text, View, StyleSheet } = pdf;
  const styles = createStyles(StyleSheet);
  const {
    CoverPage,
    GeneralSection,
    BrandSection,
    DnsSection,
    CancellationSection,
    RoomsSection,
    AddonsSection,
    RatesSection,
    TaxesSection,
  } = createSections({ Page, Text, View }, styles);

  // Top-level PDF document. Each module gets its own A4 page so page breaks
  // happen at natural boundaries instead of mid-room.
  const OnboardingPDF: React.FC<{ payload: any }> = ({ payload }) => {
    const sessionId = payload.sessionId ?? '';
    const hasDns =
      payload.dns && Object.values(payload.dns).some((v) => v && String(v).trim() !== '');

    return (
      <Document
        title={`Albie Onboarding · ${payload.general?.propertyName ?? 'Submission'}`}
        author="Albie by TAG"
        subject="Booking Engine Onboarding"
      >
        <CoverPage payload={payload} />
        <GeneralSection data={payload.general} sessionId={sessionId} />
        <BrandSection data={payload.brand} sessionId={sessionId} />
        {hasDns && <DnsSection data={payload.dns} sessionId={sessionId} />}
        <CancellationSection items={payload.cancellationPolicies ?? []} sessionId={sessionId} />
        <RoomsSection rooms={payload.rooms ?? []} sessionId={sessionId} />
        <AddonsSection addons={payload.addons ?? {}} sessionId={sessionId} />
        <RatesSection rates={payload.rates ?? {}} sessionId={sessionId} />
        <TaxesSection taxes={payload.taxes ?? []} sessionId={sessionId} />
      </Document>
    );
  };

  return OnboardingPDF;
}
