import * as React from 'react';
import { Document } from '@react-pdf/renderer';
import {
  CoverPage,
  GeneralSection,
  BrandSection,
  DnsSection,
  CancellationSection,
  RoomsSection,
  AddonsSection,
  RatesSection,
  TaxesSection,
} from './sections';

// Top-level PDF document. Each module gets its own A4 page so page breaks
// happen at natural boundaries instead of mid-room.
export const OnboardingPDF: React.FC<{ payload: any }> = ({ payload }) => {
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
