export const MARKETING_MODULES = [
  {
    id: 'basics',
    title: 'Business Basics',
    icon: 'business_center',
    description: 'Contact info and your paid advertising experience so far.',
  },
  {
    id: 'accounts',
    title: 'Accounts & Assets',
    icon: 'link',
    description: 'Google Ads, Tag Manager, Analytics, Facebook, and creative assets.',
  },
  {
    id: 'strategy',
    title: 'Strategy & Budget',
    icon: 'insights',
    description: 'Campaign goals, competitors, targeting, approvals, and budget.',
  },
];

export const DEFAULT_ENABLED = MARKETING_MODULES.map(m => m.id);
