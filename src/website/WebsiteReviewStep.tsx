import { Icon } from '../components/ui/primitives';
import { WEBSITE_MODULES } from './constants';

export interface WebsiteReviewData {
  company: Record<string, string>;
  brand: Record<string, string>;
  structure: Record<string, string>;
  inspiration: Record<string, string>;
  hotelGate: Record<string, string>;
  hotelGeneral: Record<string, string>;
  hotelTechnical: Record<string, string>;
  features: Record<string, string>;
}

const FIELD_LABELS: Record<string, string> = {
  companyName: 'Company / Brand Name',
  industry: 'Industry / Market',
  industryOther: 'Industry (Other)',
  existingWebsiteUrl: 'Existing Website URL',
  contactPerson: 'Main Contact Person',
  email: 'Email Address',
  goalBrandAwareness: 'Goal: Brand Awareness',
  goalLeadGeneration: 'Goal: Lead Generation',
  goalSalesEcommerce: 'Goal: Sales / E-commerce',
  goalInformational: 'Goal: Informational',
  goalOther: 'Goal (Other)',
  hasBrandIdentity: 'Has Brand Identity / Guidelines',
  resourceLogo: 'Resource: Logo',
  resourceTypography: 'Resource: Typography / Brand Fonts',
  resourceColors: 'Resource: Colors',
  resourceGuidelines: 'Resource: Brand Guidelines',
  resourceOther: 'Resource (Other)',
  brandDescriptionWords: 'Brand in 3-5 Words',
  estimatedPages: 'Estimated Number of Pages',
  pageHome: 'Page: Home',
  pageAboutUs: 'Page: About Us',
  pageServicesProducts: 'Page: Services / Products',
  pageBlogNews: 'Page: Blog / News',
  pageContact: 'Page: Contact',
  pageTestimonials: 'Page: Testimonials / Case Studies',
  pageOther: 'Page (Other)',
  oneSentenceDescription: 'One-Sentence Description',
  idealCustomer: 'Ideal Customer',
  businessLocation: 'Business Location',
  companyStory: 'Company Story',
  servicesDescription: 'Main Services / Products',
  brandStoryValues: 'Brand Story / Core Values',
  referenceWebsites: 'Reference Websites',
  likesAboutReferences: 'Likes About References',
  dislikesToAvoid: 'Dislikes / What to Avoid',
  competitors: 'Competitors',
  isHotelProject: 'Hotel / Hospitality Project',
  propertyType: 'Property Type',
  propertyTypeOther: 'Property Type (Other)',
  hotelLocations: 'Location(s)',
  roomTypesCount: 'Room Types / Categories',
  featureExperiences: 'Feature: Experiences',
  featureActivities: 'Feature: Activities',
  featureWeddingsEvents: 'Feature: Weddings & Events',
  featureDining: 'Feature: Dining',
  featureAmenities: 'Feature: Amenities',
  featureAccommodations: 'Feature: Accommodations',
  featureOffersPackages: 'Feature: Offers & Packages',
  amenitiesHighlight: 'Amenities/Activities to Highlight',
  professionalPhotography: 'Professional Photography Access',
  hasActiveBookingEngine: 'Has Active Booking Engine',
  bookingEngine: 'Booking Engine',
  bookingEngineOther: 'Booking Engine (Other)',
  pms: 'PMS',
  channelManager: 'Channel Manager',
  featureContactForms: 'Feature: Contact Forms',
  featureNewsletter: 'Feature: Newsletter Subscriptions',
  featureBookingSystem: 'Feature: Booking System',
  featureEcommerce: 'Feature: E-commerce',
  featureBlogDynamic: 'Feature: Blog / Dynamic Content',
  featureThirdPartyIntegrations: 'Feature: Third-Party Integrations',
  featureOther: 'Feature (Other)',
  seoGoals: 'SEO Goals / Priority Keywords',
  domainProperty: 'Domain Property',
  domainPropertyOther: 'Domain Property (Other)',
  hostingProvider: 'Hosting Provider',
  hostingProviderOther: 'Hosting Provider (Other)',
  additionalInfo: 'Additional Info',
  desiredTimeline: 'Desired Timeline / Deadline',
};

const friendly = (key: string) => FIELD_LABELS[key] ?? key;

const display = (key: string, val: string) => {
  if (key.endsWith('Enabled')) return val === 'other' ? 'Selected' : val;
  if (/^(goal|page|resource|feature)[A-Z]/.test(key) && !key.endsWith('Other')) return val === 'on' ? 'Selected' : val;
  if (key === 'hasBrandIdentity' || key === 'isHotelProject' || key === 'hasActiveBookingEngine') {
    return val === 'yes' ? 'Yes' : val === 'no' ? 'No' : val;
  }
  return val;
};

const Section = ({ moduleId, data }: { moduleId: string; data: Record<string, string> }) => {
  const entries = Object.entries(data).filter(([, v]) => v && String(v).trim() !== '');
  const mod = WEBSITE_MODULES.find(m => m.id === moduleId)!;
  return (
    <div className="w-full bg-white border border-outline-variant rounded-2xl p-6 mb-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Icon name={mod.icon} className="text-secondary text-2xl" />
        <h3 className="font-bold text-primary">{mod.title}</h3>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-on-surface-variant italic">No information provided.</p>
      ) : (
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
          {entries.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <dt className="font-bold text-primary text-[10px] uppercase tracking-wider">{friendly(k)}</dt>
              <dd className="text-on-surface-variant break-words">{display(k, v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

export const WebsiteReviewStep = ({ reviewData }: { reviewData: WebsiteReviewData }) => {
  const isHotelProject = reviewData.hotelGate.isHotelProject === 'yes';
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Review Your Answers</h1>
        <p className="text-on-surface-variant text-xs">
          Double-check everything before submitting your Website Project onboarding.
        </p>
      </div>
      <Section moduleId="company" data={reviewData.company} />
      <Section moduleId="brand" data={reviewData.brand} />
      <Section moduleId="structure" data={reviewData.structure} />
      <Section moduleId="inspiration" data={reviewData.inspiration} />
      <Section moduleId="hotelGate" data={reviewData.hotelGate} />
      {isHotelProject && (
        <>
          <Section moduleId="hotelGeneral" data={reviewData.hotelGeneral} />
          <Section moduleId="hotelTechnical" data={reviewData.hotelTechnical} />
        </>
      )}
      <Section moduleId="features" data={reviewData.features} />
    </div>
  );
};
