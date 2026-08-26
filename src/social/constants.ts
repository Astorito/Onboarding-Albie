export const SOCIAL_MODULES = [
  {
    id: 'company',
    title: 'Company & Social Profiles',
    icon: 'business_center',
    description: 'Who you are, what you do, and where you already show up online.',
  },
  {
    id: 'goals',
    title: 'Goals & Audience',
    icon: 'track_changes',
    description: 'What organic social should achieve, and who it should reach.',
  },
  {
    id: 'offerings',
    title: 'Offerings & Content Priorities',
    icon: 'inventory_2',
    description: 'What to talk about — and what to avoid.',
  },
  {
    id: 'brand',
    title: 'Brand Voice & Visual Identity',
    icon: 'palette',
    description: 'Tone of voice, visual style, and brand materials.',
  },
  {
    id: 'assets',
    title: 'Assets & Content Creation',
    icon: 'photo_library',
    description: 'What photo/video exists today, and how new content will get to us.',
  },
  {
    id: 'competitors',
    title: 'Competitors & References',
    icon: 'compare_arrows',
    description: 'Who else is out there, and what inspires you.',
  },
];

export const DEFAULT_ENABLED = SOCIAL_MODULES.map(m => m.id);
