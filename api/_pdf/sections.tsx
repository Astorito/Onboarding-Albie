import * as React from 'react';
import { colors } from './styles';
import { friendly } from './fieldLabels';

// No top-level import of '@react-pdf/renderer' here — it's ESM-only and this
// file compiles to CommonJS. `Page`/`Text`/`View`/`styles` are passed in from
// send-onboarding.ts, which loads the package via dynamic import().
// Everything below is unchanged from the original module-level version —
// just wrapped in this factory so react-pdf's components are received as
// parameters instead of a static import.
export function createSections(
  { Page, Text, View }: { Page: any; Text: any; View: any },
  styles: any,
) {
  // ─── Shared sub-components ──────────────────────────────────────────────────

  const LogoDark: React.FC = () => (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={styles.logoTextDark}>albie</Text>
        <Text style={styles.logoDotDark}>.</Text>
      </View>
      <Text style={styles.logoSubDark}>BY TAG SOFTWARE</Text>
    </View>
  );

  const SectionHeader: React.FC<{ title: string; eyebrow?: string }> = ({ title, eyebrow }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionBullet} />
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      {eyebrow && <Text style={styles.sectionEyebrow}>{eyebrow}</Text>}
    </View>
  );

  const PageFooter: React.FC<{ sessionId: string }> = ({ sessionId }) => (
    <View style={styles.pageFooter} fixed>
      <Text>Albie Onboarding · {sessionId}</Text>
      <Text render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );

  // Watermark "albie" bottom-right — appears on every section page
  const Watermark: React.FC<{ onDark?: boolean }> = ({ onDark }) => (
    <Text style={onDark ? styles.watermarkCover : styles.watermarkPage}>albie</Text>
  );

  // ─── Key/Value grid ──────────────────────────────────────────────────────────
  const FULL_WIDTH_KEYS = ['description', 'siteTitle', 'address', 'logoUrl', 'faviconUrl', 'websiteUrl', 'imageUrl', 'terms', 'salesMessages'];

  const KeyValueGrid: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
    const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');
    if (entries.length === 0) {
      return <Text style={styles.empty}>No data entered for this section.</Text>;
    }
    return (
      <View style={styles.kvGrid}>
        {entries.map(([k, v]) => (
          <View key={k} style={FULL_WIDTH_KEYS.includes(k) ? styles.kvCellFull : styles.kvCell}>
            <Text style={styles.kvLabel}>{friendly(k).toUpperCase()}</Text>
            <Text style={styles.kvValue}>{String(v)}</Text>
          </View>
        ))}
      </View>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  const CoverPage: React.FC<{ payload: any }> = ({ payload }) => {
    const hotelName = payload.general?.propertyName || 'New Property';
    const propertyType = payload.propertyType === 'group' ? 'Group' : 'Independent';
    const submittedAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverWrap}>
          <LogoDark />

          <Text style={styles.coverEyebrow}>ONBOARDING SUBMISSION</Text>
          <Text style={styles.coverTitle}>{hotelName}</Text>
          <Text style={styles.coverSubtitle}>Booking engine configuration summary</Text>
          <View style={styles.coverDivider} />

          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>PROPERTY TYPE</Text>
            <Text style={styles.coverMetaValue}>{propertyType}</Text>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>SUBMITTED</Text>
            <Text style={styles.coverMetaValue}>{submittedAt}</Text>
          </View>
          {payload.general?.city && (
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverMetaLabel}>LOCATION</Text>
              <Text style={styles.coverMetaValue}>
                {[payload.general.city, payload.general.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
          {payload.general?.notificationEmail && (
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverMetaLabel}>CONTACT</Text>
              <Text style={styles.coverMetaValue}>{payload.general.notificationEmail}</Text>
            </View>
          )}
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>SESSION ID</Text>
            <Text style={[styles.coverMetaValue, { color: colors.tint, fontSize: 9 }]}>
              {payload.sessionId}
            </Text>
          </View>

          <Text style={styles.coverFooter}>ALBIE BY TAG · BOOKING ENGINE</Text>
        </View>

        <Watermark onDark />
      </Page>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SIMPLE SECTIONS (key/value)
  // ═══════════════════════════════════════════════════════════════════════════
  const SimpleSection: React.FC<{
    title: string;
    eyebrow: string;
    data: Record<string, unknown> | undefined;
    sessionId: string;
  }> = ({ title, eyebrow, data, sessionId }) => (
    <Page size="A4" style={styles.page}>
      <SectionHeader title={title} eyebrow={eyebrow} />
      <View style={styles.contentBody}>
        <KeyValueGrid data={data ?? {}} />
      </View>
      <Watermark />
      <PageFooter sessionId={sessionId} />
    </Page>
  );

  const GeneralSection: React.FC<{ data: any; sessionId: string }> = ({ data, sessionId }) => (
    <SimpleSection title="General Information" eyebrow="STEP 01" data={data} sessionId={sessionId} />
  );

  const DnsSection: React.FC<{ data: any; sessionId: string }> = ({ data, sessionId }) => (
    <SimpleSection title="DNS & Tracking" eyebrow="OPTIONAL" data={data} sessionId={sessionId} />
  );

  // ─── Brand section — color swatches + other fields ──────────────────────────
  const BrandSection: React.FC<{ data: any; sessionId: string }> = ({ data, sessionId }) => {
    const b = data ?? {};
    const colorFields: Array<[string, string]> = [
      ['primaryColor',   'Primary Color'],
      ['secondaryColor', 'Secondary Color'],
      ['accentColor',    'Accent Color'],
    ];
    const otherKeys = ['siteTitle', 'fontFamily', 'buttonStyle', 'logoUrl', 'faviconUrl'];
    const others = Object.fromEntries(otherKeys.map(k => [k, b[k]]).filter(([, v]) => v));

    return (
      <Page size="A4" style={styles.page}>
        <SectionHeader title="Website & Brand" eyebrow="STEP 02" />
        <View style={styles.contentBody}>
          {/* Color swatches */}
          <View style={[styles.kvGrid, { marginBottom: 8 }]}>
            {colorFields.map(([key, label]) =>
              b[key] ? (
                <View key={key} style={styles.kvCell}>
                  <Text style={styles.kvLabel}>{label.toUpperCase()}</Text>
                  <View style={styles.colorRow}>
                    <View style={[styles.colorSwatch, { backgroundColor: String(b[key]) }]} />
                    <Text style={styles.kvValue}>{b[key]}</Text>
                  </View>
                </View>
              ) : null,
            )}
          </View>
          <KeyValueGrid data={others} />
        </View>
        <Watermark />
        <PageFooter sessionId={sessionId} />
      </Page>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CANCELLATION POLICIES
  // ═══════════════════════════════════════════════════════════════════════════
  const CancellationSection: React.FC<{ items: any[]; sessionId: string }> = ({ items = [], sessionId }) => (
    <Page size="A4" style={styles.page}>
      <SectionHeader
        title="Cancellation Policies"
        eyebrow={`${items.length} POLIC${items.length === 1 ? 'Y' : 'IES'}`}
      />
      <View style={styles.contentBody}>
        {items.length === 0 ? (
          <Text style={styles.empty}>No cancellation policies defined.</Text>
        ) : (
          items.map((p, i) => (
            <View key={p.id ?? i} style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={styles.cardTitle}>{p.name || 'Unnamed policy'}</Text>
                {p.isDefault && <Text style={styles.badgeDefault}>DEFAULT</Text>}
              </View>
              <Text style={styles.cardSubtitle}>
                Window: {p.window || '—'}h · Penalty: {p.penaltyType || p.penalty || 'No penalty'}
                {p.penaltyValue ? ` (${p.penaltyValue})` : ''}
              </Text>
              {p.description && <Text style={styles.cardBody}>{p.description}</Text>}
              {p.notes && (
                <Text style={[styles.cardBody, { marginTop: 4, color: colors.muted, fontStyle: 'italic' }]}>
                  Notes: {p.notes}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
      <Watermark />
      <PageFooter sessionId={sessionId} />
    </Page>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // ROOMS
  // ═══════════════════════════════════════════════════════════════════════════
  const RoomsSection: React.FC<{ rooms: any[]; sessionId: string }> = ({ rooms = [], sessionId }) => (
    <Page size="A4" style={styles.page}>
      <SectionHeader title="Room Information" eyebrow={`${rooms.length} ROOM${rooms.length === 1 ? '' : 'S'}`} />
      <View style={styles.contentBody}>
        {rooms.length === 0 ? (
          <Text style={styles.empty}>No rooms added yet.</Text>
        ) : (
          rooms.map((r, i) => (
            <View key={r.id ?? i} style={styles.card} wrap={false}>
              <Text style={styles.cardTitle}>
                {r.shortTitle || r.name || 'Untitled Room'}
                {r.code ? `  ·  ${r.code}` : ''}
              </Text>
              <Text style={styles.cardSubtitle}>
                {[r.type, r.bed && `${r.bed} bed`, r.bedrooms && `${r.bedrooms} bedrooms`]
                  .filter(Boolean).join(' · ')}
              </Text>
              {(r.longTitle || r.description) && (
                <Text style={styles.cardBody}>{r.longTitle || r.description}</Text>
              )}
              <Text style={[styles.cardBody, { marginTop: 6 }]}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Occupancy: </Text>
                Max {r.maxOccupants || '?'} guests ({r.maxAdults || '?'} adults · {r.childrenCapacity || '?'} children) · Included: {r.includedOccupancy || '?'}
              </Text>
              {Array.isArray(r.facilities) && r.facilities.length > 0 && (
                <View style={styles.chipRow}>
                  {r.facilities.map((f: string) => (
                    <Text key={f} style={styles.chip}>{f}</Text>
                  ))}
                </View>
              )}
              {Array.isArray(r.imageUrls) && r.imageUrls.length > 0 && (
                <Text style={[styles.cardBody, { marginTop: 4, color: colors.muted, fontSize: 8 }]}>
                  Images: {r.imageUrls.join(', ')}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
      <Watermark />
      <PageFooter sessionId={sessionId} />
    </Page>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD-ONS
  // ═══════════════════════════════════════════════════════════════════════════
  type AddonCfg = { enabled?: boolean; price?: string };

  const AddonsSection: React.FC<{ addons: Record<string, AddonCfg>; sessionId: string }> = ({
    addons = {},
    sessionId,
  }) => {
    const entries = (Object.entries(addons) as [string, AddonCfg][]).filter(([, cfg]) => cfg?.enabled);
    return (
      <Page size="A4" style={styles.page}>
        <SectionHeader title="Add-ons & Extras" eyebrow={`${entries.length} ENABLED`} />
        <View style={styles.contentBody}>
          {entries.length === 0 ? (
            <Text style={styles.empty}>No add-ons enabled.</Text>
          ) : (
            <View style={styles.kvGrid}>
              {entries.map(([name, cfg]) => (
                <View key={name} style={styles.kvCell}>
                  <Text style={styles.kvLabel}>{name.toUpperCase()}</Text>
                  <Text style={styles.kvValue}>{cfg.price ? `$${cfg.price}` : 'Free / Included'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <Watermark />
        <PageFooter sessionId={sessionId} />
      </Page>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RATES
  // ═══════════════════════════════════════════════════════════════════════════
  const RatesSection: React.FC<{ rates: Record<string, string>; sessionId: string }> = ({
    rates = {},
    sessionId,
  }) => (
    <Page size="A4" style={styles.page}>
      <SectionHeader title="Rates & Packages" eyebrow="STEP 07" />
      <View style={styles.contentBody}>
        <KeyValueGrid data={rates} />
      </View>
      <Watermark />
      <PageFooter sessionId={sessionId} />
    </Page>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TAXES
  // ═══════════════════════════════════════════════════════════════════════════
  const TaxesSection: React.FC<{ taxes: any[]; sessionId: string }> = ({ taxes = [], sessionId }) => (
    <Page size="A4" style={styles.page}>
      <SectionHeader title="Taxes & Fees" eyebrow={`${taxes.length} ITEM${taxes.length === 1 ? '' : 'S'}`} />
      <View style={styles.contentBody}>
        {taxes.length === 0 ? (
          <Text style={styles.empty}>No taxes or fees configured.</Text>
        ) : (
          taxes.map((t, i) => (
            <View key={t.id ?? i} style={styles.card} wrap={false}>
              <Text style={styles.cardTitle}>{t.name || t.type || 'Unnamed tax'}</Text>
              <Text style={styles.cardSubtitle}>
                {t.type} · {t.chargeType} {t.value}{t.chargeType === 'Percentage' ? '%' : ''} · {t.quantifier || 'Per booking'}
              </Text>
              {t.description && <Text style={styles.cardBody}>{t.description}</Text>}
            </View>
          ))
        )}
      </View>
      <Watermark />
      <PageFooter sessionId={sessionId} />
    </Page>
  );

  return {
    CoverPage,
    GeneralSection,
    BrandSection,
    DnsSection,
    CancellationSection,
    RoomsSection,
    AddonsSection,
    RatesSection,
    TaxesSection,
  };
}
