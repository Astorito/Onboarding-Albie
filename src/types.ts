// All fields that the AI can pre-fill from a hotel website
export interface PrefillData {
  propertyName:      string | null;
  description:       string | null;
  address:           string | null;
  city:              string | null;
  stateProvince:     string | null;
  country:           string | null;
  zipCode:           string | null;
  timezone:          string | null;  // IANA id  e.g. "Europe/Madrid"
  currency:          string | null;  // ISO 4217  e.g. "EUR"
  language:          string | null;  // BCP 47    e.g. "es"
  phone:             string | null;
  notificationEmail: string | null;
  websiteUrl:        string | null;
  siteTitle:         string | null;
}

export type GroupMember = { id: number; name: string; url: string };

// Loose prefill bag passed to uncontrolled form steps. Merges server prefill
// (PrefillData) with values the user already typed (savedForms), so fields
// like dateFormat / colors / dns ids that aren't in PrefillData still restore.
export type StepPrefill = Record<string, string | null | undefined>;
