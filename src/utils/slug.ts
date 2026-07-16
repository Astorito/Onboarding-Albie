// Readable onboarding slug for shareable links, e.g. /o/pigs-paradise-antigua-3r76dh
//
// The slug is DERIVED, never stored: it combines a kebab-case of the onboarding
// name (human-readable, shows the property) with the unique random suffix of the
// Session ID (guarantees uniqueness + lets the server resolve it back to the row).
// The real row key is still the Session ID — the slug is only an alias.
//
// IMPORTANT: this logic is duplicated verbatim in api/_slug.ts (separate build
// context). Keep the two in sync.

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

// Build the slug for a row. Returns '' if we lack the pieces to build one.
export function slugFromRow(onboardingName: string, sessionId: string): string {
  if (!sessionId) return '';
  const base = kebab(onboardingName || '');
  const suffix = sessionSuffix(sessionId);
  return base ? `${base}-${suffix}` : suffix;
}
