import { FormField, TextInput, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from '../components/ui/SelectableCard';

export type AssetsPrefill = Record<string, string | null | undefined>;

const ASSET_TYPES = [
  { name: 'assetProfessionalPhotography', label: 'Professional photography' },
  { name: 'assetProfessionalVideo', label: 'Professional video' },
  { name: 'assetUserGenerated', label: 'User-generated content' },
  { name: 'assetTeamPhotos', label: 'Team photos' },
  { name: 'assetProductPhotos', label: 'Product photos' },
  { name: 'assetPropertyPhotos', label: 'Property or location photos' },
  { name: 'assetEventPhotos', label: 'Event photos' },
  { name: 'assetLifestylePhotography', label: 'Lifestyle photography' },
  { name: 'assetDroneFootage', label: 'Drone footage' },
  { name: 'assetInterviews', label: 'Interviews' },
  { name: 'assetTestimonials', label: 'Testimonials' },
  { name: 'assetGraphicAssets', label: 'Graphic assets' },
  { name: 'assetStockPhotography', label: 'Stock photography' },
  { name: 'assetNoCurrentAssets', label: 'No current visual assets' },
];

export const AssetsProductionStep = ({ prefill = {} }: { prefill?: AssetsPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Assets & Content Creation</h1>
      <p className="text-on-surface-variant text-xs">
        What visual assets already exist, and how new ones will reach us.
      </p>
    </div>
    <form id="form-assets" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Available Photo & Video Assets"
        description="Select every type of asset you currently have."
        icon="photo_library"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {ASSET_TYPES.map(a => (
              <SelectableCard key={a.name} type="checkbox" name={a.name} defaultChecked={prefill[a.name] === 'on'}>
                {a.label}
              </SelectableCard>
            ))}
          </div>

          <FormField
            label="Asset Library"
            required
            className="col-span-2"
            hint="Link to the main folder or platform where images, videos, logos, and other creative assets are stored."
          >
            <TextInput name="assetLibraryUrl" type="url" placeholder="https://drive.google.com/..." defaultValue={prefill.assetLibraryUrl ?? ''} key={prefill.assetLibraryUrl} />
          </FormField>

          <label className="flex items-start gap-2.5 text-sm text-on-surface cursor-pointer col-span-2">
            <input
              type="checkbox"
              name="assetLibraryPermissionConfirmed"
              defaultChecked={prefill.assetLibraryPermissionConfirmed === 'on'}
              className="mt-1 accent-primary w-4 h-4"
              required
            />
            I confirm TAG has permission to access, edit, and use the shared materials on social media.
          </label>

          <FormField
            label="Restricted Assets"
            className="col-span-2"
            hint="Any images, videos, people, locations, products, or materials that should not be used."
          >
            <TextareaInput name="restrictedAssets" rows={2} defaultValue={prefill.restrictedAssets ?? ''} key={prefill.restrictedAssets} />
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Content Creation & New Assets"
        description="How ongoing photos, videos, and updates will reach our team."
        icon="movie"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="Will your team regularly provide new photos, videos, updates, and information?" required>
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
              <SelectableCard name="willProvideNewContent" value="yes" defaultChecked={prefill.willProvideNewContent === 'yes'} required>
                Yes
              </SelectableCard>
              <SelectableCard name="willProvideNewContent" value="no" defaultChecked={prefill.willProvideNewContent === 'no'} required>
                No
              </SelectableCard>
              <SelectableCard name="willProvideNewContent" value="occasionally" defaultChecked={prefill.willProvideNewContent === 'occasionally'} required>
                Occasionally
              </SelectableCard>
              <SelectableCard name="willProvideNewContent" value="tbc" defaultChecked={prefill.willProvideNewContent === 'tbc'} required>
                To be confirmed
              </SelectableCard>
            </div>
          </FormField>

          <FormField
            label="Internal Content Contact (POC)"
            required
            className="col-span-2"
            hint="Who should TAG contact when new photos, videos, event details, menus, promotions, or business updates are needed?"
          >
            <TextInput name="contentContactPerson" placeholder="Name, role, and contact info" defaultValue={prefill.contentContactPerson ?? ''} key={prefill.contentContactPerson} />
          </FormField>

          <FormField label="Is there someone on-site who can capture additional photos or videos when needed?">
            <div className="flex flex-col sm:flex-row gap-2">
              <SelectableCard name="onSiteContentCapture" value="yes" defaultChecked={prefill.onSiteContentCapture === 'yes'}>
                Yes
              </SelectableCard>
              <SelectableCard name="onSiteContentCapture" value="no" defaultChecked={prefill.onSiteContentCapture === 'no'}>
                No
              </SelectableCard>
              <SelectableCard name="onSiteContentCapture" value="sometimes" defaultChecked={prefill.onSiteContentCapture === 'sometimes'}>
                Sometimes
              </SelectableCard>
            </div>
          </FormField>

          <FormField label="On-Site Contact" hint="If yes above, please provide their name and contact information.">
            <TextInput name="onSiteContactInfo" defaultValue={prefill.onSiteContactInfo ?? ''} key={prefill.onSiteContactInfo} />
          </FormField>

          <FormField label="Are you interested in professional photography or video production as an additional service?" className="col-span-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <SelectableCard name="interestedInProduction" value="yes" defaultChecked={prefill.interestedInProduction === 'yes'}>
                Yes
              </SelectableCard>
              <SelectableCard name="interestedInProduction" value="no" defaultChecked={prefill.interestedInProduction === 'no'}>
                No
              </SelectableCard>
              <SelectableCard name="interestedInProduction" value="possibly" defaultChecked={prefill.interestedInProduction === 'possibly'}>
                Possibly in the future
              </SelectableCard>
            </div>
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
