import { StyleSheet } from '@react-pdf/renderer';

// Brand palette — mirrors src/index.css onboarding tokens
export const colors = {
  brand:      '#12433F', // logo text + section headers
  accent:     '#dfec60', // lime — bullets, dividers, badges
  background: '#fcf9f8',
  surface:    '#f0eded',
  surfaceLow: '#f6f3f2',
  border:     '#c1c8c8',
  text:       '#1c1b1b',
  muted:      '#717878',
  dotYellow:  '#F2EA5F',
  dotTeal:    '#2F6B6D',
  green:      '#5b6300',
};

export const styles = StyleSheet.create({
  // ─── Page basics ───────────────────────────────────────────────────────
  page: {
    backgroundColor: colors.background,
    padding: 0,
    fontFamily: 'Helvetica',
    color: colors.text,
    fontSize: 10,
  },
  contentBody: {
    padding: '40 50',
  },

  // ─── Cover page ────────────────────────────────────────────────────────
  coverWrap: {
    flex: 1,
    padding: 50,
    flexDirection: 'column',
  },
  coverHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverEyebrow: {
    fontSize: 9,
    color: colors.brand,
    letterSpacing: 3,
    fontFamily: 'Helvetica-Bold',
    marginTop: 80,
    marginBottom: 24,
  },
  coverTitle: {
    fontSize: 42,
    color: colors.brand,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.1,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 36,
  },
  coverDivider: {
    width: 90,
    height: 4,
    backgroundColor: colors.accent,
    marginBottom: 28,
  },
  coverMetaRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  coverMetaLabel: {
    width: 130,
    fontSize: 9,
    color: colors.muted,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  coverMetaValue: {
    fontSize: 11,
    color: colors.brand,
    fontFamily: 'Helvetica',
  },
  coverFooter: {
    marginTop: 'auto',
    fontSize: 8,
    color: colors.muted,
    letterSpacing: 2,
    textAlign: 'center',
  },

  // ─── Logo (text-based, no image) ───────────────────────────────────────
  logoText: {
    fontSize: 22,
    color: colors.brand,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
  },
  logoDot: {
    fontSize: 22,
    color: colors.dotTeal,
    fontFamily: 'Helvetica-Bold',
  },
  logoSub: {
    fontSize: 7,
    color: colors.muted,
    letterSpacing: 2,
    marginTop: -2,
  },

  // ─── Section headers ───────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingVertical: 18,
    backgroundColor: colors.brand,
    color: '#fff',
  },
  sectionBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
    letterSpacing: 2,
  },
  sectionEyebrow: {
    fontSize: 8,
    color: colors.accent,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    marginBottom: 4,
    marginLeft: 'auto',
  },

  // ─── Key/Value grid ───────────────────────────────────────────────────
  kvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  kvCell: {
    width: '50%',
    paddingRight: 14,
    marginBottom: 14,
  },
  kvCellFull: {
    width: '100%',
    paddingRight: 0,
    marginBottom: 14,
  },
  kvLabel: {
    fontSize: 7,
    color: colors.muted,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  kvValue: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.4,
  },

  // ─── List item cards (rooms, policies, taxes) ─────────────────────────
  card: {
    backgroundColor: colors.surfaceLow,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    color: colors.brand,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.4,
  },
  badgeDefault: {
    fontSize: 7,
    color: colors.brand,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 4,
  },

  // ─── Tags / chips (facilities) ────────────────────────────────────────
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  chip: {
    fontSize: 8,
    color: colors.brand,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },

  // ─── Footer ───────────────────────────────────────────────────────────
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: colors.muted,
  },

  // ─── Misc ─────────────────────────────────────────────────────────────
  empty: {
    fontSize: 10,
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: 10,
  },
  colorSwatch: {
    width: 16,
    height: 16,
    marginRight: 6,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
