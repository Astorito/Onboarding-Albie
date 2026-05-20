import { useState, Fragment, type Dispatch, type SetStateAction } from 'react';
import { Icon, FormField, TextInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection, ItemCard, AddItemButton, FormActions } from '../../components/ui/layout';

export type RoomItem = {
  id: number;
  name: string;
  type: string;
  bed: string;
  bedrooms: number;
  facilities?: string[];
};

interface Props {
  rooms: RoomItem[];
  setRooms: Dispatch<SetStateAction<RoomItem[]>>;
}

export const RoomInformationStep = ({ rooms, setRooms }: Props) => {
  const [showForm, setShowForm] = useState(rooms.length === 0);
  const [facilities, setFacilities] = useState<string[]>(['WiFi', 'Smart TV', 'Air Conditioning']);

  const facilityList = [
    'Air Conditioning', 'Heating', 'WiFi', 'Smart TV', 'Cable TV', 'Streaming Services',
    'Telephone', 'Desk', 'Office Chair', 'USB Ports', 'Safe Box', 'Wardrobe / Closet',
    'Iron', 'Ironing Board', 'Blackout Curtains', 'Fan', 'Soundproof Windows',
  ];

  const roomTypes = [
    'Standard Room', 'Deluxe Room', 'Superior Room', 'Junior Suite', 'Suite',
    'Executive Room', 'Family Room', 'Studio', 'Villa', 'Apartment', 'Penthouse',
    'Dormitory', 'Bungalow', 'Cabin', 'Loft', 'Connecting Room', 'Accessible Room',
    'Ocean View Room', 'Garden View Room',
  ];

  const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Super King', 'Sofa Bed', 'Bunk Bed', 'Twin Bed'];

  const toggleFacility = (f: string) =>
    setFacilities((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const saveRoom = () => {
    setRooms((prev) => [
      ...prev,
      { id: Date.now(), name: 'New Room', type: 'Standard Room', bed: 'Queen', bedrooms: 1, facilities },
    ]);
    setShowForm(false);
    setFacilities(['WiFi', 'Smart TV', 'Air Conditioning']);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Room Information</h1>
        <p className="text-on-surface-variant text-xs">
          Define your room categories, types, images, and facilities.
        </p>
      </div>

      {!showForm ? (
        <div className="space-y-3">
          {rooms.map((r) => (
            <Fragment key={r.id}>
              <ItemCard
                icon="bed"
                title={r.name}
                subtitle={`${r.type} · ${r.bed} bed · ${r.bedrooms} bedroom(s)`}
                onEdit={() => {}}
                onDelete={() => setRooms((prev) => prev.filter((x) => x.id !== r.id))}
              />
            </Fragment>
          ))}
          <AddItemButton label="Add Room Type" onClick={() => setShowForm(true)} />
        </div>
      ) : (
        <ConfigSection
          title="Room Details"
          description="Enter the basic information, bed configuration, images, and facilities for this room."
          icon="bed"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Room Code" required>
              <TextInput placeholder="STD-KG-01" />
            </FormField>

            <FormField label="Room Short Title" required hint="Max 30 characters">
              <TextInput placeholder="Standard King Room" maxLength={30} />
            </FormField>

            <FormField label="Room Long Title" required hint="Max 50 characters" className="col-span-2">
              <TextInput
                placeholder="Comfortable Standard King Room with City View"
                maxLength={50}
              />
            </FormField>

            <FormField label="Room Type" required>
              <SelectInput>
                <option value="">Select type</option>
                {roomTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Bed Type" required>
              <SelectInput>
                <option value="">Select bed type</option>
                {bedTypes.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Number of Bedrooms" required>
              <TextInput type="number" min={1} placeholder="1" />
            </FormField>

            <FormField label="Room Images" required>
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors group">
                <Icon name="add_photo_alternate" className="text-2xl text-primary/40 group-hover:text-primary mb-1" />
                <span className="text-xs text-on-surface-variant font-bold">Upload images</span>
                <span className="text-[10px] text-on-surface-variant">JPG, PNG up to 5MB each</span>
                <input type="file" className="hidden" accept="image/*" multiple />
              </label>
            </FormField>

            <div className="col-span-2">
              <label className="font-bold text-primary text-xs uppercase tracking-wider block mb-3">
                Room Facilities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {facilityList.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFacility(f)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-[11px] font-bold cursor-pointer text-left ${
                      facilities.includes(f)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <FormActions onCancel={() => setShowForm(false)} onSave={saveRoom} />
          </div>
        </ConfigSection>
      )}
    </div>
  );
};
