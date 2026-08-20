import { FormField, TextInput, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from '../components/ui/SelectableCard';

export type CompanyPrefill = Record<string, string | null | undefined>;

export const CompanyProfilesStep = ({ prefill = {} }: { prefill?: CompanyPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Company & Social Profiles</h1>
      <p className="text-on-surface-variant text-xs">
        Tell us about your business, and share every social account you already have — even the
        ones you're not actively using.
      </p>
    </div>
    <form id="form-company" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Company Information"
        description="Who you are, what you offer, and who you serve."
        icon="business_center"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Email" required className="col-span-2">
            <TextInput name="email" type="email" placeholder="you@yourbusiness.com" defaultValue={prefill.email ?? ''} key={prefill.email} />
          </FormField>

          <FormField label="Company or Brand Name" required className="col-span-2">
            <TextInput name="companyName" placeholder="Your Company or Brand Name" defaultValue={prefill.companyName ?? ''} key={prefill.companyName} />
          </FormField>

          <FormField label="Do you have an active website?" required>
            <div className="flex flex-col sm:flex-row gap-2">
              <SelectableCard name="hasWebsite" value="yes" defaultChecked={prefill.hasWebsite === 'yes'} required>
                Yes
              </SelectableCard>
              <SelectableCard name="hasWebsite" value="no" defaultChecked={prefill.hasWebsite === 'no'} required>
                No
              </SelectableCard>
              <SelectableCard name="hasWebsite" value="in_development" defaultChecked={prefill.hasWebsite === 'in_development'} required>
                In development
              </SelectableCard>
            </div>
          </FormField>

          <FormField label="Website URL" hint="If you have one, or one is in development.">
            <TextInput name="websiteUrl" type="url" placeholder="https://www.yourbusiness.com" defaultValue={prefill.websiteUrl ?? ''} key={prefill.websiteUrl} />
          </FormField>

          <FormField
            label="Industry"
            required
            className="col-span-2"
            hint="Be as specific as possible. Examples: hotel or resort, restaurant or bar, independent medical practice, wellness, travel, technology, professional services, real estate, retail."
          >
            <TextInput name="industry" placeholder="e.g. Boutique hotel" defaultValue={prefill.industry ?? ''} key={prefill.industry} />
          </FormField>

          <FormField label="Location(s)" required className="col-span-2" hint="City, state or region, and country. List all locations if you have more than one.">
            <TextareaInput name="location" rows={2} defaultValue={prefill.location ?? ''} key={prefill.location} />
          </FormField>

          <FormField
            label="Business Description"
            required
            className="col-span-2"
            hint="What your business does, what you offer, who you serve, what makes you different, and why customers choose you."
          >
            <TextareaInput name="businessDescription" rows={4} defaultValue={prefill.businessDescription ?? ''} key={prefill.businessDescription} />
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Social Media Profiles"
        description="Every active or existing account, even if it's unused today."
        icon="share"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Instagram">
            <TextInput name="instagramUrl" placeholder="Profile URL or @handle" defaultValue={prefill.instagramUrl ?? ''} key={prefill.instagramUrl} />
          </FormField>
          <FormField label="Facebook">
            <TextInput name="facebookUrl" type="url" placeholder="Page URL" defaultValue={prefill.facebookUrl ?? ''} key={prefill.facebookUrl} />
          </FormField>
          <FormField label="LinkedIn">
            <TextInput name="linkedinUrl" type="url" placeholder="Page or profile URL" defaultValue={prefill.linkedinUrl ?? ''} key={prefill.linkedinUrl} />
          </FormField>
          <FormField label="TikTok">
            <TextInput name="tiktokUrl" placeholder="Profile URL or @handle" defaultValue={prefill.tiktokUrl ?? ''} key={prefill.tiktokUrl} />
          </FormField>
          <FormField label="YouTube" className="col-span-2">
            <TextInput name="youtubeUrl" type="url" placeholder="Channel URL" defaultValue={prefill.youtubeUrl ?? ''} key={prefill.youtubeUrl} />
          </FormField>

          <FormField
            label="Other Platforms"
            className="col-span-2"
            hint="Pinterest, X, Threads, Snapchat, Yelp, TripAdvisor, Google Business Profile, or any other industry-specific platform. Please provide all relevant links."
          >
            <TextareaInput name="otherPlatforms" rows={2} defaultValue={prefill.otherPlatforms ?? ''} key={prefill.otherPlatforms} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
