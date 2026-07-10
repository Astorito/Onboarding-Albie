// No top-level import of '@react-pdf/renderer' here — it's ESM-only and this
// file compiles to CommonJS. `StyleSheet` is passed in from send-onboarding.ts,
// which loads the package via dynamic import(). See createStyles() below.

export const colors = {
  brand:          '#0D3A39', // Forest — main dark green
  turquoise:      '#2F6B6D', // Dark Turquoise
  accent:         '#F2EA5F', // Vibrant Lime
  tint:           '#ACC4C5', // Muted teal — subtitles on dark bg
  background:     '#ffffff',
  surface:        '#f6f3f2',
  border:         '#c1c8c8',
  text:           '#1c1b1b',
  muted:          '#717878',
  white:          '#ffffff',
  watermarkDark:  '#1a5552', // slightly lighter than Forest — on dark cover
  watermarkLight: '#ddeeed', // very light teal — on white section pages
};

// `StyleSheet` is the real @react-pdf/renderer export, obtained via dynamic
// import() in send-onboarding.ts (see comment at the top of this file).
export function createStyles(StyleSheet: any) {
  return StyleSheet.create({
  // ─── Base page (section pages — white bg) ─────────────────────────────────
  page: {
    backgroundColor: colors.background,
    padding: 0,
    fontFamily: 'Helvetica',
    color: colors.text,
    fontSize: 10,
  },

  // ─── Cover page (dark bg) ─────────────────────────────────────────────────
  coverPage: {
    backgroundColor: colors.brand,
    padding: 0,
    fontFamily: 'Helvetica',
    color: colors.white,
    fontSize: 10,
  },
  coverWrap: {
    flex: 1,
    padding: 50,
    flexDirection: 'column',
  },
  coverEyebrow: {
    fontSize: 9,
    color: colors.accent,
    letterSpacing: 3,
    fontFamily: 'Helvetica-Bold',
    marginTop: 72,
    marginBottom: 20,
  },
  coverTitle: {
    fontSize: 44,
    color: colors.white,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.1,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 13,
    color: colors.tint,
    marginBottom: 32,
  },
  coverDivider: {
    width: 80,
    height: 3,
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
    color: colors.tint,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  coverMetaValue: {
    fontSize: 11,
    color: colors.white,
    fontFamily: 'Helvetica',
  },
  coverFooter: {
    marginTop: 'auto',
    fontSize: 8,
    color: colors.tint,
    letterSpacing: 2,
    textAlign: 'center',
  },

  // ─── Logo (dark variant — for cover) ─────────────────────────────────────
  logoTextDark: {
    fontSize: 22,
    color: colors.white,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
  },
  logoDotDark: {
    fontSize: 22,
    color: colors.accent,
    fontFamily: 'Helvetica-Bold',
  },
  logoSubDark: {
    fontSize: 7,
    color: colors.tint,
    letterSpacing: 2,
    marginTop: -2,
  },

  // ─── Logo (light variant — for section headers / white pages) ────────────
  logoText: {
    fontSize: 22,
    color: colors.brand,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
  },
  logoDot: {
    fontSize: 22,
    color: colors.turquoise,
    fontFamily: 'Helvetica-Bold',
  },
  logoSub: {
    fontSize: 7,
    color: colors.muted,
    letterSpacing: 2,
    marginTop: -2,
  },

  // ─── Section header bar ───────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingVertical: 18,
    backgroundColor: colors.brand,
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
    color: colors.white,
    letterSpacing: 2,
  },
  sectionEyebrow: {
    fontSize: 8,
    color: colors.accent,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    marginLeft: 'auto',
  },

  // ─── Content body ─────────────────────────────────────────────────────────
  contentBody: {
    padding: '32 50 60 50',
  },

  // ─── Key/Value grid ───────────────────────────────────────────────────────
  kvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  kvCell: {
    width: '50%',
    paddingRight: 14,
    marginBottom: 16,
  },
  kvCellFull: {
    width: '100%',
    paddingRight: 0,
    marginBottom: 16,
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

  // ─── Cards (rooms, policies, taxes) ──────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
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
    marginLeft: 6,
  },

  // ─── Chips / facility tags ────────────────────────────────────────────────
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  chip: {
    fontSize: 8,
    color: colors.brand,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },

  // ─── Color swatches (brand section) ──────────────────────────────────────
  colorSwatch: {
    width: 18,
    height: 18,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ─── Page footer (fixed, appears on every section page) ──────────────────
  pageFooter: {
    position: 'absolute',
    bottom: 22,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: colors.muted,
  },

  // ─── Watermarks ───────────────────────────────────────────────────────────
  watermarkCover: {
    position: 'absolute',
    bottom: -10,
    right: -8,
    fontSize: 110,
    fontFamily: 'Helvetica-Bold',
    color: colors.watermarkDark,
    letterSpacing: -3,
  },
  watermarkPage: {
    position: 'absolute',
    bottom: -10,
    right: -8,
    fontSize: 110,
    fontFamily: 'Helvetica-Bold',
    color: colors.watermarkLight,
    letterSpacing: -3,
  },

  // ─── Misc ─────────────────────────────────────────────────────────────────
    empty: {
      fontSize: 10,
      color: colors.muted,
      fontStyle: 'italic',
      marginTop: 10,
    },
  });
}
