import { FormField, TextInput, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';

export type StrategyPrefill = Record<string, string | null | undefined>;

const GOALS = [
  { name: 'goalBrandAwareness', label: 'Brand awareness' },
  { name: 'goalTraffic', label: 'Traffic' },
  { name: 'goalLeads', label: 'Leads' },
  { name: 'goalPurchasesBookings', label: 'Purchases/bookings' },
];

export const StrategyBudgetStep = ({ prefill = {} }: { prefill?: StrategyPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Strategy & Budget</h1>
      <p className="text-on-surface-variant text-xs">
        Campaign goals, targeting, approvals, and spend so we can plan the right strategy.
      </p>
    </div>
    <form id="form-strategy" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Campaign Goals"
        description="What is your main goal with the campaigns?"
        icon="track_changes"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {GOALS.map(g => (
            <label key={g.name} className="flex items-center gap-2.5 text-sm text-on-surface cursor-pointer col-span-1">
              <input type="checkbox" name={g.name} defaultChecked={prefill[g.name] === 'on'} className="accent-primary w-4 h-4" />
              {g.label}
            </label>
          ))}
          <FormField label="Other" className="col-span-2">
            <TextInput name="goalOther" placeholder="Describe another goal..." defaultValue={prefill.goalOther ?? ''} key={prefill.goalOther} />
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Targeting"
        description="Who and where should the campaigns target?"
        icon="my_location"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Which are your main competitors? Please list them below" className="col-span-2">
            <TextareaInput name="competitors" rows={2} placeholder="Competitor 1, Competitor 2..." defaultValue={prefill.competitors ?? ''} key={prefill.competitors} />
          </FormField>

          <FormField label="Are there any specific locations you'd like to target?" className="col-span-2">
            <TextareaInput name="targetLocations" rows={2} placeholder="e.g. Buenos Aires, national, specific radius..." defaultValue={prefill.targetLocations ?? ''} key={prefill.targetLocations} />
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Approvals & Budget"
        description="A few operational details before campaigns go live."
        icon="payments"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            label="Do you want to approve the ad copy before campaigns go live?"
            required
            className="col-span-2"
            hint="Ad copy: text to be included in your ads that's designed to grab attention, communicate key messages, and persuade users to take action."
          >
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2.5 text-sm text-on-surface cursor-pointer">
                <input type="radio" name="approveAdCopy" value="yes" defaultChecked={prefill.approveAdCopy === 'yes'} className="accent-primary" required />
                Yes
              </label>
              <label className="flex items-center gap-2.5 text-sm text-on-surface cursor-pointer">
                <input type="radio" name="approveAdCopy" value="no" defaultChecked={prefill.approveAdCopy === 'no'} className="accent-primary" required />
                No
              </label>
            </div>
          </FormField>

          <FormField
            label="What monthly budget would you like to allocate for ad spend?"
            required
            className="col-span-2"
            hint="Only if you are a monthly client."
          >
            <TextInput name="monthlyBudget" placeholder="e.g. $1,500 USD/month" defaultValue={prefill.monthlyBudget ?? ''} key={prefill.monthlyBudget} />
          </FormField>

          <FormField label="Are you going to use your own credit card to pay for ad spend in the platforms we will be managing?" required className="col-span-2">
            <div className="flex flex-col gap-2">
              <label className="flex items-start gap-2.5 text-sm text-on-surface cursor-pointer">
                <input type="radio" name="ownCreditCard" value="yes" defaultChecked={prefill.ownCreditCard === 'yes'} className="mt-1 accent-primary" required />
                <span>Yes, please share with our team the number, name, expiration date, CVV and zip code related to the card.</span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-on-surface cursor-pointer">
                <input type="radio" name="ownCreditCard" value="no" defaultChecked={prefill.ownCreditCard === 'no'} className="mt-1 accent-primary" required />
                <span>No, please inform the team if you have arranged some other payment method for ad spend.</span>
              </label>
            </div>
          </FormField>

          <FormField label="Do you have a desired launch date in mind?" required className="col-span-2" hint="Our onboarding process typically takes 1-3 weeks, but knowing your ideal timeline will help us plan accordingly and do our best to meet your expectations.">
            <TextInput name="launchDate" type="date" defaultValue={prefill.launchDate ?? ''} key={prefill.launchDate} />
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Additional Context"
        description="Anything else that will help us understand your customer and business."
        icon="lightbulb"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="Do you have any information or insights about your ideal customer that you'd like to share?">
            <TextareaInput name="idealCustomerInsights" rows={3} defaultValue={prefill.idealCustomerInsights ?? ''} key={prefill.idealCustomerInsights} />
          </FormField>

          <FormField
            label="Please feel free to share any additional information you think we should keep in mind"
            hint="For example: seasonal trends, recent brand changes, customer demographics and behaviors, USPs, unique selling points, upcoming events, offers, or promotions."
          >
            <TextareaInput name="additionalInfo" rows={3} defaultValue={prefill.additionalInfo ?? ''} key={prefill.additionalInfo} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
