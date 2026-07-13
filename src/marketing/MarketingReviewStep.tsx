import { Icon } from '../components/ui/primitives';
import { MARKETING_MODULES } from './constants';

export interface MarketingReviewData {
  basics: Record<string, string>;
  accounts: Record<string, string>;
  strategy: Record<string, string>;
}

const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  businessName: 'Business Name',
  pastCampaigns: 'Past Paid Campaigns',
  googleAdsAccount: 'Google Ads Account',
  gtmAccount: 'Google Tag Manager Account',
  ga4Account: 'Google Analytics 4 Account',
  facebookAccount: 'Facebook Account/Page',
  driveFolderUrl: 'Drive Folder',
  youtubeUrl: 'YouTube Channel',
  goalBrandAwareness: 'Goal: Brand Awareness',
  goalTraffic: 'Goal: Traffic',
  goalLeads: 'Goal: Leads',
  goalPurchasesBookings: 'Goal: Purchases/Bookings',
  goalOther: 'Other Goal',
  competitors: 'Main Competitors',
  targetLocations: 'Target Locations',
  approveAdCopy: 'Approve Ad Copy Before Launch',
  monthlyBudget: 'Monthly Ad Spend Budget',
  ownCreditCard: 'Using Own Credit Card',
  launchDate: 'Desired Launch Date',
  idealCustomerInsights: 'Ideal Customer Insights',
  additionalInfo: 'Additional Info',
};

const friendly = (key: string) => FIELD_LABELS[key] ?? key;

const yesNo = (key: string, val: string) => {
  if (key === 'googleAdsAccount' || key === 'gtmAccount' || key === 'ga4Account' || key === 'facebookAccount' || key === 'approveAdCopy') {
    return val === 'yes' ? 'Yes' : val === 'no' ? 'No' : val;
  }
  if (key === 'ownCreditCard') return val === 'yes' ? 'Yes, sharing card details' : val === 'no' ? 'No, other payment method' : val;
  if (key.startsWith('goal') && key !== 'goalOther') return val === 'on' ? 'Selected' : val;
  return val;
};

const Section = ({ moduleId, data }: { moduleId: string; data: Record<string, string> }) => {
  const entries = Object.entries(data).filter(([, v]) => v && String(v).trim() !== '');
  const mod = MARKETING_MODULES.find(m => m.id === moduleId)!;
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
              <dd className="text-on-surface-variant break-words">{yesNo(k, v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

export const MarketingReviewStep = ({ reviewData }: { reviewData: MarketingReviewData }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Review Your Answers</h1>
      <p className="text-on-surface-variant text-xs">
        Double-check everything before submitting your Digital Advertising onboarding.
      </p>
    </div>
    <Section moduleId="basics" data={reviewData.basics} />
    <Section moduleId="accounts" data={reviewData.accounts} />
    <Section moduleId="strategy" data={reviewData.strategy} />
  </div>
);
