import { FormField, TextInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';

export type BankingGeneralPrefill = Record<string, string | null | undefined>;

export const BankingGeneralStep = ({ prefill = {} }: { prefill?: BankingGeneralPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Property & Contact</h1>
      <p className="text-on-surface-variant text-xs">
        Who we should reach out to, and which property this is for.
      </p>
    </div>
    <form id="form-general" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Property & Point of Contact"
        description="The property this banking information belongs to, and who to contact with questions."
        icon="contact_page"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Property / Client Name" required className="col-span-2">
            <TextInput name="propertyName" placeholder="Patagonia Adventure Tours" defaultValue={prefill.propertyName ?? ''} key={prefill.propertyName} />
          </FormField>

          <FormField label="Point of Contact — First & Last Name" required className="col-span-2">
            <TextInput name="contactName" placeholder="Jane Doe" defaultValue={prefill.contactName ?? ''} key={prefill.contactName} />
          </FormField>

          <FormField label="Point of Contact Email" required>
            <TextInput name="contactEmail" type="email" placeholder="jane@yourbusiness.com" defaultValue={prefill.contactEmail ?? ''} key={prefill.contactEmail} />
          </FormField>

          <FormField label="Point of Contact Phone" required>
            <TextInput name="contactPhone" type="tel" placeholder="+1 000 000 0000" defaultValue={prefill.contactPhone ?? ''} key={prefill.contactPhone} />
          </FormField>

          <FormField label="Property Country" required className="col-span-2">
            <TextInput name="country" placeholder="Argentina" defaultValue={prefill.country ?? ''} key={prefill.country} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
