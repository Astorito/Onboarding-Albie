import { FormField } from '../components/ui/primitives';

// "Do you have a Google Ads account?" style Yes/No radio, shared across the
// Accounts & Assets step (Google Ads, GTM, GA4, Facebook all follow this pattern).
export const AccountAccessField = ({
  name,
  label,
  instructionsUrl,
  defaultValue,
}: {
  name: string;
  label: string;
  instructionsUrl: string;
  defaultValue?: string;
}) => (
  <FormField label={label} required className="col-span-2">
    <div className="flex flex-col gap-2">
      <label className="flex items-start gap-2.5 text-sm text-on-surface cursor-pointer">
        <input type="radio" name={name} value="yes" defaultChecked={defaultValue === 'yes'} className="mt-1 accent-primary" required />
        <span>
          Yes. Please follow{' '}
          <a href={instructionsUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            these instructions
          </a>
          .
        </span>
      </label>
      <label className="flex items-start gap-2.5 text-sm text-on-surface cursor-pointer">
        <input type="radio" name={name} value="no" defaultChecked={defaultValue === 'no'} className="mt-1 accent-primary" required />
        <span>No, I need TAG to create it.</span>
      </label>
    </div>
  </FormField>
);
