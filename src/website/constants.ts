export const WEBSITE_MODULES = [
  {
    id: 'company',
    title: 'Company Information',
    icon: 'business_center',
    description: 'Tell us about your business and what this website needs to achieve.',
  },
  {
    id: 'brand',
    title: 'Brand Identity',
    icon: 'palette',
    description: 'Your existing brand identity and visual assets.',
  },
  {
    id: 'structure',
    title: 'Website Structure & Content',
    icon: 'account_tree',
    description: 'Pages, content, and the story behind your business.',
  },
  {
    id: 'inspiration',
    title: 'Inspiration & References',
    icon: 'lightbulb',
    description: 'Websites you like, and who you compete with.',
  },
  {
    id: 'hotelGate',
    title: 'Hotel / Hospitality',
    icon: 'hotel',
    description: 'Please indicate if your project is related to hospitality.',
  },
  {
    id: 'hotelGeneral',
    title: 'Hotel / Hospitality — General Information',
    icon: 'apartment',
    description: 'Please complete this section only if your project is related to hospitality.',
  },
  {
    id: 'hotelTechnical',
    title: 'Hotel / Hospitality — Technical Information',
    icon: 'dns',
    description: 'Booking engine, PMS, and channel manager details.',
  },
  {
    id: 'features',
    title: 'Features & Infrastructure',
    icon: 'settings',
    description: 'Required features, SEO, and domain/hosting status.',
  },
];

// Modules shown regardless of the hotel/hospitality branch.
export const BASE_MODULES = ['company', 'brand', 'structure', 'inspiration', 'hotelGate'];
// Only inserted when the client confirms their project is hotel/hospitality related.
export const HOTEL_MODULES = ['hotelGeneral', 'hotelTechnical'];
export const FINAL_MODULE = 'features';
