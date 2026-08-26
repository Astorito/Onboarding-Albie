import { FormField, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from '../components/ui/SelectableCard';
import { OtherReveal } from '../components/ui/OtherReveal';

export type GoalsPrefill = Record<string, string | null | undefined>;

const GOALS = [
  { name: 'goalBrandAwareness', label: 'Increase brand awareness' },
  { name: 'goalBrandPositioning', label: 'Improve brand positioning' },
  { name: 'goalGrowAudience', label: 'Grow the social media audience' },
  { name: 'goalEngagement', label: 'Increase engagement' },
  { name: 'goalConversion', label: 'Increase conversion' },
  { name: 'goalWebsiteTraffic', label: 'Drive traffic to the website' },
  { name: 'goalLeads', label: 'Generate leads or inquiries' },
  { name: 'goalBookings', label: 'Increase bookings or reservations' },
  { name: 'goalPromoteServices', label: 'Promote specific services or products' },
  { name: 'goalPromoteEvents', label: 'Promote events or experiences' },
  { name: 'goalTrust', label: 'Build trust and credibility' },
  { name: 'goalEducate', label: 'Educate the audience' },
  { name: 'goalCustomerExperience', label: 'Showcase the customer experience' },
  { name: 'goalRecruitment', label: 'Support recruitment or employer branding' },
  { name: 'goalCompanyNews', label: 'Communicate company news' },
  { name: 'goalExistingRelationships', label: 'Strengthen relationships with existing customers' },
];

export const GoalsAudienceStep = ({ prefill = {} }: { prefill?: GoalsPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Goals & Audience</h1>
      <p className="text-on-surface-variant text-xs">
        What organic social media should achieve for you, and who it needs to reach.
      </p>
    </div>
    <form id="form-goals" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Social Media Goals"
        description="Select every goal that applies."
        icon="track_changes"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="flex flex-col gap-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 group/other">
            {GOALS.map(g => (
              <SelectableCard key={g.name} type="checkbox" name={g.name} defaultChecked={prefill[g.name] === 'on'}>
                {g.label}
              </SelectableCard>
            ))}
            <SelectableCard type="checkbox" name="goalOtherEnabled" value="other" defaultChecked={!!prefill.goalOther}>
              Other
            </SelectableCard>
            <div className="md:col-span-2">
              <OtherReveal name="goalOther" defaultValue={prefill.goalOther ?? ''} />
            </div>
          </div>

          <FormField label="Of the goals selected above, which is the most important and why?" required>
            <TextareaInput name="primaryGoal" rows={2} defaultValue={prefill.primaryGoal ?? ''} key={prefill.primaryGoal} />
          </FormField>

          <FormField
            label="What would make this service feel successful to you?"
            hint="Describe the results, improvements, or outcomes you'd like to see."
          >
            <TextareaInput name="successDefinition" rows={3} defaultValue={prefill.successDefinition ?? ''} key={prefill.successDefinition} />
          </FormField>

          <FormField
            label="Inspiration Brands & References"
            hint="Brands, competitors, or accounts that in your opinion are successful, or that inspire you."
          >
            <TextareaInput name="inspirationBrands" rows={2} defaultValue={prefill.inspirationBrands ?? ''} key={prefill.inspirationBrands} />
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Target Audience"
        description="Who your content needs to speak to."
        icon="groups"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="flex flex-col gap-y-4">
          <FormField
            label="Who is your primary target audience?"
            required
            hint="Age range, location, interests, profession, lifestyle, travel or purchasing behavior, needs or challenges, why they'd choose you, local/national/international, and whether you target consumers, businesses, or both."
          >
            <TextareaInput name="primaryAudience" rows={4} defaultValue={prefill.primaryAudience ?? ''} key={prefill.primaryAudience} />
          </FormField>

          <FormField label="Are there any additional audiences you'd like to reach?">
            <TextareaInput name="secondaryAudiences" rows={2} defaultValue={prefill.secondaryAudiences ?? ''} key={prefill.secondaryAudiences} />
          </FormField>

          <FormField label="Who are your current customers, guests, patients, clients, visitors, or users?">
            <TextareaInput name="currentCustomerProfile" rows={2} defaultValue={prefill.currentCustomerProfile ?? ''} key={prefill.currentCustomerProfile} />
          </FormField>

          <FormField
            label="Audience Misconceptions"
            hint="Any common misconceptions, concerns, or questions your audience has about your business or services."
          >
            <TextareaInput name="audienceMisconceptions" rows={2} defaultValue={prefill.audienceMisconceptions ?? ''} key={prefill.audienceMisconceptions} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
