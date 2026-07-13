export type BedConfig = { type: string; count: number };

// Rooms saved before multi-bed support only have a single `bed: string` field.
// Reads both shapes so old onboarding data keeps displaying correctly.
export function formatBeds(beds?: BedConfig[], legacyBed?: string): string {
  if (beds && beds.length > 0) {
    return beds
      .map((b) => (b.count > 1 ? `${b.count}× ${b.type}` : b.type))
      .join(', ');
  }
  return legacyBed || '—';
}
