// Readable onboarding slug — server-side copy. See src/utils/slug.ts for the
// full rationale. Kept as a verbatim duplicate because api/ is a separate
// (CommonJS) build context and cannot import from src/. Keep the two in sync.

// Session IDs look like `albie_<timestamp>_<rand>`. The suffix is `<rand>`.
export function sessionSuffix(sessionId: string): string {
  const parts = sessionId.split('_');
  return parts[parts.length - 1] || sessionId;
}

export function kebab(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function slugFromRow(onboardingName: string, sessionId: string): string {
  if (!sessionId) return '';
  const base = kebab(onboardingName || '');
  const suffix = sessionSuffix(sessionId);
  return base ? `${base}-${suffix}` : suffix;
}
