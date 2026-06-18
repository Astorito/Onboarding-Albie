export const ALL_MODULES = [
  {
    id: 'general',
    title: 'General Information',
    icon: 'apartment',
    description: 'Property details, contact info, and locale settings.',
  },
  {
    id: 'brand',
    title: 'Website & Brand',
    icon: 'palette',
    description: 'Visual identity, colors, fonts, logo, and favicon.',
  },
  {
    id: 'dns',
    title: 'DNS & Tracking',
    icon: 'dns',
    description: 'Subdomain, Google Analytics, Tag Manager, and Maps.',
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policies',
    icon: 'gavel',
    description: 'Define refund windows, penalties, and conditions.',
  },
  {
    id: 'rooms',
    title: 'Room Information',
    icon: 'bed',
    description: 'Room types, beds, images, facilities, and occupancy.',
  },
  {
    id: 'experiences',
    title: 'Experiences',
    icon: 'local_activity',
    description: 'Activities, tours, and curated offerings.',
  },
  {
    id: 'addons',
    title: 'Add-ons & Extras',
    icon: 'add_shopping_cart',
    description: 'Extra services: early check-in, transfers, parking, and more.',
  },
  {
    id: 'rates',
    title: 'Rates & Packages',
    icon: 'sell',
    description: 'Rate groups, pricing rules, and promotional packages.',
  },
  {
    id: 'taxes',
    title: 'Taxes & Fees',
    icon: 'payments',
    description: 'Tax types, charge settings, and fee structures.',
  },
];

export const DEFAULT_ENABLED = ['general', 'brand', 'cancellation', 'rooms', 'addons', 'rates', 'taxes'];
