// OnActivities onboarding summary PDF — properties that sell activities or
// experiences with no lodging. Same factory pattern as every other PDF here
// (react-pdf components are passed in rather than statically imported; see
// api/_pdf/OnboardingPDF.tsx for why), reusing the shared createStyles.
//
// Label maps mirror src/activities/ActivitiesReviewStep.tsx so the client's
// Review screen and this PDF describe the same field the same way. They can't
// be imported from src/ — api/ is a separate CommonJS build context.

import * as React from 'react';
import { createStyles } from './styles';

const GENERAL_LABELS: Record<string, string> = {
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
  dateFormat: 'Date Format',
  termsConditions: 'Terms & Conditions',
};

const BRAND_LABELS: Record<string, string> = {
  siteTitle: 'Site Title',
  primaryColor: 'Primary Color',
  secondaryColor: 'Secondary Color',
  accentColor: 'Accent Color',
  fontFamily: 'Font Family',
  buttonStyle: 'Button Style',
  logoUrl: 'Logo URL',
  faviconUrl: 'Favicon URL',
};

const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

const friendly = (labels: Record<string, string>) => (key: string): string =>
  labels[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

// ── Value formatters, mirroring src/activities/types.ts ───────────────────────
function formatDuration(a: any): string {
  const n = String(a?.duration ?? '').trim();
  if (!n) return '';
  const unit = a.durationUnit === 'minutes' ? 'min' : a.durationUnit === 'days' ? 'day' : 'hr';
  const plural = unit !== 'min' && Number(n) !== 1 ? 's' : '';
  return `${n} ${unit}${plural}`;
}

function formatPrice(a: any): string {
  const p = String(a?.price ?? '').trim();
  if (!p) return '';
  return a.priceType === 'per_person' ? `${p} per person` : `${p} flat`;
}

function formatTaxValue(t: any): string {
  const v = String(t?.value ?? '').trim();
  if (!v) return '—';
  if (t.calcType === 'percentage') return `${v}%`;
  if (t.calcType === 'per_person') return `${v} per person`;
  return `${v} per item`;
}

function formatPolicyWindow(p: any): string {
  const w = String(p?.window ?? '').trim();
  if (!w) return 'No window set';
  const unit = p.windowUnit === 'days' ? 'day' : 'hour';
  return `Up to ${w} ${unit}${Number(w) !== 1 ? 's' : ''} before`;
}

function formatPolicyPenalty(p: any): string {
  if (p?.penaltyType === 'none' || !p?.penaltyType) return 'No penalty';
  const v = String(p.penaltyValue ?? '').trim() || '—';
  return p.penaltyType === 'percentage' ? `${v}% of total` : `${v} fixed`;
}

function formatDays(days: unknown): string {
  if (!Array.isArray(days) || days.length === 0) return 'Not set';
  if (days.length === 7) return 'Every day';
  return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    .filter((d) => days.includes(d))
    .map((d) => DAY_LABELS[d])
    .join(', ');
}

function formatSeason(a: any): string {
  const from = String(a?.seasonFrom ?? '').trim();
  const to = String(a?.seasonTo ?? '').trim();
  if (!from && !to) return 'All year';
  if (from && to) return `${from} → ${to}`;
  return from ? `From ${from}` : `Until ${to}`;
}

export function createActivitiesPDF(pdf: { Document: any; Page: any; Text: any; View: any; StyleSheet: any }) {
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
      <Text>OnActivities Onboarding · {sessionId}</Text>
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

  // Activities carry their own tax/policy references — resolved to names here so
  // the PDF never shows a raw numeric id.
  const ActivityCard: React.FC<{
    activity: any; taxes: any[]; policies: any[];
  }> = ({ activity: a, taxes, policies }) => {
    const appliedTaxes = (Array.isArray(a.taxIds) ? a.taxIds : [])
      .map((id: number) => taxes.find((t) => t.id === id))
      .filter(Boolean)
      .map((t: any) => `${t.name || 'Unnamed tax'} (${formatTaxValue(t)})`);
    const policy = policies.find((p) => p.id === a.cancellationPolicyId);
    const meta = [formatDuration(a), formatPrice(a)].filter(Boolean).join(' · ');
    const capacity = [
      a.capacity ? `Capacity: ${a.capacity}` : '',
      a.minParticipants || a.maxParticipants
        ? `Group size: ${a.minParticipants || '—'}–${a.maxParticipants || '—'}`
        : '',
    ].filter(Boolean).join(' · ');

    return (
      <View style={styles.card} wrap={false}>
        <Text style={styles.cardTitle}>{a.name || 'Untitled activity'}</Text>
        {meta !== '' && <Text style={styles.cardSubtitle}>{meta}</Text>}
        {a.description ? <Text style={styles.cardBody}>{a.description}</Text> : null}
        {capacity !== '' && <Text style={styles.cardBody}>{capacity}</Text>}
        <Text style={styles.cardBody}>
          Available: {formatDays(a.availableDays)}
          {Array.isArray(a.timeSlots) && a.timeSlots.length > 0 ? ` · ${a.timeSlots.join(', ')}` : ''}
          {` · ${formatSeason(a)}`}
        </Text>
        <Text style={styles.cardBody}>
          Cancellation: {policy ? `${policy.name || 'Unnamed policy'} — ${formatPolicyWindow(policy)}, ${formatPolicyPenalty(policy)}` : 'Not set'}
        </Text>
        <Text style={styles.cardBody}>
          Taxes: {appliedTaxes.length > 0 ? appliedTaxes.join(', ') : 'None'}
        </Text>
        {a.termsConditions ? (
          <Text style={styles.cardBody}>Terms &amp; conditions: {a.termsConditions}</Text>
        ) : null}
      </View>
    );
  };

  const ActivitiesPDF: React.FC<{ payload: any }> = ({ payload }) => {
    const sessionId = payload.sessionId ?? '';
    const general = payload.general ?? {};
    const brand = payload.brand ?? {};
    const activities: any[] = Array.isArray(payload.activities) ? payload.activities : [];
    const taxes: any[] = Array.isArray(payload.taxes) ? payload.taxes : [];
    const policies: any[] = Array.isArray(payload.cancellationPolicies) ? payload.cancellationPolicies : [];

    // Blank seeded slots the client never filled in shouldn't become empty
    // pages in the client's summary.
    const filledActivities = activities.filter(
      (a) => a && (String(a.name ?? '').trim() || String(a.description ?? '').trim() || String(a.price ?? '').trim()),
    );

    return (
      <Document
        title={`OnActivities · ${general.propertyName ?? 'Submission'}`}
        author="TAG"
        subject="OnActivities Onboarding"
      >
        <Page size="A4" style={styles.page}>
          <SectionHeader title="Property Information" eyebrow="STEP 01" />
          <View style={styles.contentBody}>
            <KeyValueGrid data={general} labels={GENERAL_LABELS} />
          </View>
          <PageFooter sessionId={sessionId} />
        </Page>

        <Page size="A4" style={styles.page}>
          <SectionHeader title="Website & Brand" eyebrow="STEP 02" />
          <View style={styles.contentBody}>
            <KeyValueGrid data={brand} labels={BRAND_LABELS} />
          </View>
          <PageFooter sessionId={sessionId} />
        </Page>

        <Page size="A4" style={styles.page}>
          <SectionHeader title="Cancellation Policies" eyebrow="STEP 03" />
          <View style={styles.contentBody}>
            {policies.length === 0 ? (
              <Text style={styles.empty}>No cancellation policies entered.</Text>
            ) : (
              policies.map((p, i) => (
                <View key={p.id ?? i} style={styles.card} wrap={false}>
                  <Text style={styles.cardTitle}>{p.name || 'Unnamed policy'}</Text>
                  <Text style={styles.cardSubtitle}>
                    {formatPolicyWindow(p)} · {formatPolicyPenalty(p)}
                    {p.isDefault ? ' · Default' : ''}
                  </Text>
                  {p.notes ? <Text style={styles.cardBody}>{p.notes}</Text> : null}
                </View>
              ))
            )}
          </View>
          <PageFooter sessionId={sessionId} />
        </Page>

        <Page size="A4" style={styles.page}>
          <SectionHeader title="Taxes" eyebrow="STEP 04" />
          <View style={styles.contentBody}>
            {taxes.length === 0 ? (
              <Text style={styles.empty}>No taxes entered.</Text>
            ) : (
              taxes.map((t, i) => (
                <View key={t.id ?? i} style={styles.card} wrap={false}>
                  <Text style={styles.cardTitle}>{t.name || 'Unnamed tax'}</Text>
                  <Text style={styles.cardSubtitle}>{formatTaxValue(t)}</Text>
                </View>
              ))
            )}
          </View>
          <PageFooter sessionId={sessionId} />
        </Page>

        <Page size="A4" style={styles.page}>
          <SectionHeader title="Activities" eyebrow="STEP 05" />
          <View style={styles.contentBody}>
            {filledActivities.length === 0 ? (
              <Text style={styles.empty}>No activities entered.</Text>
            ) : (
              filledActivities.map((a, i) => (
                <ActivityCard key={a.id ?? i} activity={a} taxes={taxes} policies={policies} />
              ))
            )}
          </View>
          <PageFooter sessionId={sessionId} />
        </Page>
      </Document>
    );
  };

  return ActivitiesPDF;
}
