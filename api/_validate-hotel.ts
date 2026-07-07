// Pure validation function — no I/O, no side effects.
// Called by scrape-hotel.ts between Gemini extraction and Sheet write.
// Fail-open contract: caller must catch any thrown error and treat it as 'complete'.

export type ValidationStatus = 'complete' | 'needs_review';

export interface ValidationResult {
  status: ValidationStatus;
  missingFields: string[];
  reason?: string;
}

const REQUIRED_FIELDS = ['propertyName', 'country', 'city', 'address'] as const;

export function validateHotelData(
  data: Record<string, string | null | undefined>,
): ValidationResult {
  const missingFields = (REQUIRED_FIELDS as readonly string[]).filter(
    f => !data[f] || (data[f] as string).trim() === '',
  );

  if (missingFields.length > 0) {
    return {
      status: 'needs_review',
      missingFields,
      reason: `Faltan campos obligatorios: ${missingFields.join(', ')}`,
    };
  }

  const hasContact = !!(data.phone?.trim() || data.notificationEmail?.trim());
  if (!hasContact) {
    return {
      status: 'needs_review',
      missingFields: [],
      reason: 'Sin datos de contacto (phone o notificationEmail)',
    };
  }

  return { status: 'complete', missingFields: [] };
}
