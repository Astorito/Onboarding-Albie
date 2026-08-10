import { FormField, TextInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { AccountAccessField } from './AccountAccessField';

export type AccountsPrefill = Record<string, string | null | undefined>;

// Shared "connect your accounts" instructions sheet linked from every Yes/No
// question in the source form (Google Ads, GTM, GA4, Facebook).
const ACCOUNT_INSTRUCTIONS_URL =
  'https://docs.google.com/spreadsheets/d/1MxvMNbvYEBFT3AAT2I2dasCjYI88lYRnqzbZj63uNVY/edit?usp=sharing';

export const AccountsAssetsStep = ({ prefill = {} }: { prefill?: AccountsPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Accounts & Assets</h1>
      <p className="text-on-surface-variant text-xs">
        Creation of Google Ads, Google Analytics 4, and Google Tag Manager accounts if needed.
      </p>
    </div>
    <form id="form-accounts" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Platform Access"
        description="Let us know which advertising accounts already exist."
        icon="link"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <AccountAccessField
            name="googleAdsAccount"
            label="Do you have a Google Ads account?"
            instructionsUrl={ACCOUNT_INSTRUCTIONS_URL}
            defaultValue={prefill.googleAdsAccount ?? undefined}
          />
          <AccountAccessField
            name="gtmAccount"
            label="Do you have a Google Tag Manager account?"
            instructionsUrl={ACCOUNT_INSTRUCTIONS_URL}
            defaultValue={prefill.gtmAccount ?? undefined}
          />
          <AccountAccessField
            name="ga4Account"
            label="Do you have a Google Analytics 4 account?"
            instructionsUrl={ACCOUNT_INSTRUCTIONS_URL}
            defaultValue={prefill.ga4Account ?? undefined}
          />
          <AccountAccessField
            name="facebookAccount"
            label="Do you have a Facebook account/page?"
            instructionsUrl={ACCOUNT_INSTRUCTIONS_URL}
            defaultValue={prefill.facebookAccount ?? undefined}
          />
        </div>
      </ConfigSection>

      <ConfigSection
        title="Creative Assets"
        description="Share where we can find your brand materials and video content."
        icon="perm_media"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            label="Can you share a drive folder including images, logos and video (if available)?"
            required
            className="col-span-2"
            hint="Please remember to share access with our team or with digital@theanythinggroup.com"
          >
            <TextInput name="driveFolderUrl" type="url" placeholder="https://drive.google.com/..." defaultValue={prefill.driveFolderUrl ?? ''} key={prefill.driveFolderUrl} />
          </FormField>

          <FormField label="Do you have a YouTube channel with video content? If so, please share the link below" className="col-span-2">
            <TextInput name="youtubeUrl" type="url" placeholder="https://youtube.com/@yourbusiness" defaultValue={prefill.youtubeUrl ?? ''} key={prefill.youtubeUrl} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
