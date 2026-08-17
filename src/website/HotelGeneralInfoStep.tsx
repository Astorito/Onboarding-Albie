import { FormField, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from './SelectableCard';
import { OtherReveal } from './OtherReveal';

export type HotelGeneralPrefill = Record<string, string | null | undefined>;

const PROPERTY_TYPES = [
  { value: 'collection_hotel', label: 'Collection hotel' },
  { value: 'individual_hotel', label: 'Individual hotel' },
  { value: 'boutique_hotel', label: 'Boutique hotel' },
  { value: 'lodge', label: 'Lodge' },
  { value: 'resort', label: 'Resort' },
  { value: 'vacation_rental', label: 'Vacation rental' },
];

const PROPERTY_FEATURES = [
  { name: 'featureExperiences', label: 'Experiences' },
  { name: 'featureActivities', label: 'Activities' },
  { name: 'featureWeddingsEvents', label: 'Weddings & events' },
  { name: 'featureDining', label: 'Dining' },
  { name: 'featureAmenities', label: 'Amenities' },
  { name: 'featureAccommodations', label: 'Accommodations' },
  { name: 'featureOffersPackages', label: 'Offers & packages' },
];

export const HotelGeneralInfoStep = ({ prefill = {} }: { prefill?: HotelGeneralPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Hotel / Hospitality — General Information</h1>
      <p className="text-on-surface-variant text-xs">
        Please complete this section only if your project is related to hospitality.
      </p>
    </div>
    <form id="form-hotelGeneral" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Property Details"
        description="Tell us about the property itself."
        icon="apartment"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="Property Type">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 group/other">
              {PROPERTY_TYPES.map(p => (
                <SelectableCard key={p.value} name="propertyType" value={p.value} defaultChecked={prefill.propertyType === p.value}>
                  {p.label}
                </SelectableCard>
              ))}
              <SelectableCard name="propertyType" value="other" defaultChecked={prefill.propertyType === 'other'}>
                Other
              </SelectableCard>
              <div className="md:col-span-2">
                <OtherReveal name="propertyTypeOther" defaultValue={prefill.propertyTypeOther ?? ''} />
              </div>
            </div>
          </FormField>

          <FormField label="Location(s)">
            <TextareaInput name="hotelLocations" rows={2} defaultValue={prefill.hotelLocations ?? ''} key={prefill.hotelLocations} />
          </FormField>

          <FormField label="Number of Room Types / Room Categories">
            <TextareaInput name="roomTypesCount" rows={2} defaultValue={prefill.roomTypesCount ?? ''} key={prefill.roomTypesCount} />
          </FormField>

          <FormField label="Hotel / Property Features">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {PROPERTY_FEATURES.map(f => (
                <SelectableCard key={f.name} type="checkbox" name={f.name} defaultChecked={prefill[f.name] === 'on'}>
                  {f.label}
                </SelectableCard>
              ))}
            </div>
          </FormField>

          <FormField label="Amenities or Activities to Highlight">
            <TextareaInput name="amenitiesHighlight" rows={2} defaultValue={prefill.amenitiesHighlight ?? ''} key={prefill.amenitiesHighlight} />
          </FormField>

          <FormField label="Do you have access to professional photography?">
            <div className="flex flex-col sm:flex-row gap-2">
              <SelectableCard name="professionalPhotography" value="yes" defaultChecked={prefill.professionalPhotography === 'yes'}>
                Yes
              </SelectableCard>
              <SelectableCard name="professionalPhotography" value="no" defaultChecked={prefill.professionalPhotography === 'no'}>
                No
              </SelectableCard>
              <SelectableCard name="professionalPhotography" value="planned" defaultChecked={prefill.professionalPhotography === 'planned'}>
                Planned
              </SelectableCard>
            </div>
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
