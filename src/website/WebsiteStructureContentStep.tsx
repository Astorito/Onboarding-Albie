import { FormField, TextInput, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from './SelectableCard';
import { OtherReveal } from './OtherReveal';

export type StructurePrefill = Record<string, string | null | undefined>;

const PAGES = [
  { name: 'pageHome', label: 'Home' },
  { name: 'pageAboutUs', label: 'About Us' },
  { name: 'pageServicesProducts', label: 'Services / Products' },
  { name: 'pageBlogNews', label: 'Blog / News' },
  { name: 'pageContact', label: 'Contact' },
  { name: 'pageTestimonials', label: 'Testimonials / Case Studies' },
];

export const WebsiteStructureContentStep = ({ prefill = {} }: { prefill?: StructurePrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Website Structure & Content</h1>
      <p className="text-on-surface-variant text-xs">
        Pages, content, and the story behind your business.
      </p>
    </div>
    <form id="form-structure" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Pages & Structure"
        description="What pages should this website include?"
        icon="account_tree"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Estimated Number of Pages" className="col-span-2">
            <TextInput name="estimatedPages" placeholder="e.g. 6" defaultValue={prefill.estimatedPages ?? ''} key={prefill.estimatedPages} />
          </FormField>

          <FormField label="Requested Pages" className="col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 group/other">
              {PAGES.map(p => (
                <SelectableCard key={p.name} type="checkbox" name={p.name} defaultChecked={prefill[p.name] === 'on'}>
                  {p.label}
                </SelectableCard>
              ))}
              <SelectableCard type="checkbox" name="pageOtherEnabled" value="other" defaultChecked={!!prefill.pageOther}>
                Other
              </SelectableCard>
              <div className="md:col-span-2">
                <OtherReveal name="pageOther" defaultValue={prefill.pageOther ?? ''} />
              </div>
            </div>
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Your Story & Content"
        description="The content and narrative we'll build the site around."
        icon="auto_stories"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="One-Sentence Description of Your Company">
            <TextareaInput name="oneSentenceDescription" rows={2} defaultValue={prefill.oneSentenceDescription ?? ''} key={prefill.oneSentenceDescription} />
          </FormField>

          <FormField label="Can you describe your ideal customer?" hint="e.g. industry, target audience, key needs">
            <TextareaInput name="idealCustomer" rows={2} defaultValue={prefill.idealCustomer ?? ''} key={prefill.idealCustomer} />
          </FormField>

          <FormField label="Where is your business located?">
            <TextInput name="businessLocation" defaultValue={prefill.businessLocation ?? ''} key={prefill.businessLocation} />
          </FormField>

          <FormField label="Tell us the story of your company">
            <TextareaInput name="companyStory" rows={3} defaultValue={prefill.companyStory ?? ''} key={prefill.companyStory} />
          </FormField>

          <FormField label="Brief Description of Your Main Services or Products">
            <TextareaInput name="servicesDescription" rows={3} defaultValue={prefill.servicesDescription ?? ''} key={prefill.servicesDescription} />
          </FormField>

          <FormField label="Brand Story / Core Values" required>
            <TextareaInput name="brandStoryValues" rows={3} defaultValue={prefill.brandStoryValues ?? ''} key={prefill.brandStoryValues} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
