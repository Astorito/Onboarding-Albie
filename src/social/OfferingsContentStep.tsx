import { FormField, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';

export type OfferingsPrefill = Record<string, string | null | undefined>;

export const OfferingsContentStep = ({ prefill = {} }: { prefill?: OfferingsPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Offerings & Content Priorities</h1>
      <p className="text-on-surface-variant text-xs">
        What we should be talking about — and what deserves the most visibility.
      </p>
    </div>
    <form id="form-offerings" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Products, Services & Experiences"
        description="The offerings you'd like us to communicate."
        icon="inventory_2"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField
            label="Main Products, Services & Experiences"
            required
            className="col-span-2"
            hint="List and describe the main offerings you'd like us to communicate, with any relevant details."
          >
            <TextareaInput name="offeringsDescription" rows={4} defaultValue={prefill.offeringsDescription ?? ''} key={prefill.offeringsDescription} />
          </FormField>

          <FormField label="Which offerings should receive the most visibility on social media?" className="col-span-2">
            <TextareaInput name="priorityOfferings" rows={2} defaultValue={prefill.priorityOfferings ?? ''} key={prefill.priorityOfferings} />
          </FormField>

          <FormField
            label="New or Upcoming Offerings"
            className="col-span-2"
            hint="Any new services, products, experiences, locations, or initiatives launching soon. Include expected launch dates when available."
          >
            <TextareaInput name="newOfferings" rows={2} defaultValue={prefill.newOfferings ?? ''} key={prefill.newOfferings} />
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Content Priorities"
        description="What must appear, and what should stay off the account."
        icon="topic"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="What topics should we regularly communicate about?" className="col-span-2">
            <TextareaInput name="contentTopics" rows={2} defaultValue={prefill.contentTopics ?? ''} key={prefill.contentTopics} />
          </FormField>

          <FormField label="Are there any topics, services, or messages that must appear regularly?" className="col-span-2">
            <TextareaInput name="mustCommunicateTopics" rows={2} defaultValue={prefill.mustCommunicateTopics ?? ''} key={prefill.mustCommunicateTopics} />
          </FormField>

          <FormField
            label="Topics to Avoid"
            className="col-span-2"
            hint="Any subjects, claims, words, services, people, competitors, or types of content that should not be mentioned."
          >
            <TextareaInput name="topicsToAvoid" rows={2} defaultValue={prefill.topicsToAvoid ?? ''} key={prefill.topicsToAvoid} />
          </FormField>

          <FormField label="Are there any content categories that should receive more or less emphasis?" className="col-span-2">
            <TextareaInput name="contentBalance" rows={2} defaultValue={prefill.contentBalance ?? ''} key={prefill.contentBalance} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
