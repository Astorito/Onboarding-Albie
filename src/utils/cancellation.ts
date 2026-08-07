// Formats a cancellation policy's window for display. Rooms saved before this
// feature only have a numeric `window` in hours (no `windowUnit`) — this
// treats absence of `windowUnit` as 'hours', preserving exactly what those
// values already meant. Never reinterprets an existing value as days.
export function formatCancellationWindow(p: {
  window?: string | number;
  windowUnit?: 'days' | 'hours';
  cutoffTime?: string;
}): string {
  const value = p.window;
  if (value === undefined || value === null || value === '') return '—';
  const unit = p.windowUnit ?? 'hours';
  const base = `${value} ${unit}`;
  if (unit === 'days' && p.cutoffTime) {
    return `${base} (until ${p.cutoffTime})`;
  }
  return base;
}
