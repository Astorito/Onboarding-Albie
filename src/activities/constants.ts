// Step catalogue for the OnActivities onboarding. Separate from
// src/constants.ts (the hotel flow's) on purpose — nothing here is shared, so
// changing one product's steps can never shift the other's.

export interface ActivitiesModule {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export const ACTIVITIES_MODULES: ActivitiesModule[] = [
  {
    id: 'general',
    title: 'General Information',
    icon: 'storefront',
    description: 'Property details, contact info, and locale settings.',
  },
  {
    id: 'brand',
    title: 'Website & Brand',
    icon: 'palette',
    description: 'Visual identity, colors, fonts, logo, and favicon.',
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policies',
    icon: 'gavel',
    description: 'Refund windows and charges, reusable across activities.',
  },
  {
    id: 'taxes',
    title: 'Taxes',
    icon: 'payments',
    description: 'Taxes that can apply to each activity, and how they are calculated.',
  },
  {
    id: 'activities',
    title: 'Activities',
    icon: 'local_activity',
    description: 'Each experience you sell: pricing, capacity, and availability.',
  },
];

// Cancellation and taxes deliberately come BEFORE activities: each activity
// picks from those lists, so they need to exist by the time the client gets
// there.
export const ACTIVITIES_ENABLED = ACTIVITIES_MODULES.map((m) => m.id);
