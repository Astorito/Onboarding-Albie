// Step catalogue for the Banking Information onboarding — a short ops form,
// independent from every other product's step definitions.

export interface BankingModule {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export const BANKING_MODULES: BankingModule[] = [
  {
    id: 'general',
    title: 'Property & Contact',
    icon: 'contact_page',
    description: 'Who we should reach out to, and which property this is for.',
  },
  {
    id: 'banking',
    title: 'Banking Details',
    icon: 'account_balance',
    description: 'Domestic account details, plus SWIFT details for international wires.',
  },
];

export const BANKING_ENABLED = BANKING_MODULES.map((m) => m.id);
