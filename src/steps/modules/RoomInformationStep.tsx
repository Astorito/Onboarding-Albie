import { useState, Fragment, type Dispatch, type SetStateAction } from 'react';
import { FormField, TextInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection, ItemCard, AddItemButton, FormActions } from '../../components/ui/layout';

export type RoomItem = {
  id: number;
  code: string;
  shortTitle: string;
  longTitle: string;
  name: string;        // alias of shortTitle for backwards compat
  type: string;
  bed: string;
  bedrooms: number;
  imageUrls: string[];
  facilities: string[];
  // Per-room occupancy (moved from the old global Occupancy step)
  minAdults: string;
  maxAdults: string;
  maxOccupants: string;
  childrenCapacity: string;
  includedOccupancy: string;
};

type FormState = Omit<RoomItem, 'id' | 'name'> & { imageUrlsRaw: string };

const EMPTY_FORM: FormState = {
  code: '',
  shortTitle: '',
  longTitle: '',
  type: '',
  bed: '',
  bedrooms: 1,
  imageUrls: [],
  imageUrlsRaw: '',
  facilities: ['WiFi', 'Smart TV', 'Air Conditioning'],
  minAdults: '1',
  maxAdults: '2',
  maxOccupants: '3',
  childrenCapacity: '1',
  includedOccupancy: '2',
};

const roomTypes = [
  'Standard Room', 'Deluxe Room', 'Superior Room', 'Junior Suite', 'Suite',
  'Executive Room', 'Family Room', 'Studio', 'Villa', 'Apartment', 'Penthouse',
  'Dormitory', 'Bungalow', 'Cabin', 'Loft', 'Connecting Room', 'Accessible Room',
  'Ocean View Room', 'Garden View Room',
];

const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Super King', 'Sofa Bed', 'Bunk Bed', 'Twin Bed'];

const facilityList = [
  'Air Conditioning', 'Heating', 'WiFi', 'Smart TV', 'Cable TV', 'Streaming Services',
  'Telephone', 'Desk', 'Office Chair', 'USB Ports', 'Safe Box', 'Wardrobe / Closet',
  'Iron', 'Ironing Board', 'Blackout Curtains', 'Fan', 'Soundproof Windows',
];

interface Props {
  rooms: RoomItem[];
  setRooms: Dispatch<SetStateAction<RoomItem[]>>;
}

export const RoomInformationStep = ({ rooms, setRooms }: Props) => {
  const [showForm, setShowForm] = useState(rooms.length === 0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [customFacInput, setCustomFacInput] = useState('');
  const [customFacilities, setCustomFacilities] = useState<string[]>([]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleFacility = (f: string) =>
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }));

  const addCustomFacility = () => {
    const name = customFacInput.trim();
    if (!name || customFacilities.includes(name) || facilityList.includes(name)) return;
    setCustomFacilities((prev) => [...prev, name]);
    setForm((prev) => ({ ...prev, facilities: [...prev.facilities, name] }));
    setCustomFacInput('');
  };

  const startNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (r: RoomItem) => {
    setForm({
      code: r.code ?? '',
      shortTitle: r.shortTitle ?? r.name ?? '',
      longTitle: r.longTitle ?? '',
      type: r.type,
      bed: r.bed,
      bedrooms: r.bedrooms,
      imageUrls: r.imageUrls ?? [],
      imageUrlsRaw: (r.imageUrls ?? []).join(', '),
      facilities: r.facilities ?? [],
      minAdults: r.minAdults ?? '1',
      maxAdults: r.maxAdults ?? '2',
      maxOccupants: r.maxOccupants ?? '3',
      childrenCapacity: r.childrenCapacity ?? '1',
      includedOccupancy: r.includedOccupancy ?? '2',
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const saveRoom = () => {
    const imageUrls = form.imageUrlsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const base = {
      code: form.code,
      shortTitle: form.shortTitle,
      longTitle: form.longTitle,
      name: form.shortTitle || form.code || 'Room',
      type: form.type || 'Standard Room',
      bed: form.bed || 'Queen',
      bedrooms: Number(form.bedrooms) || 1,
      imageUrls,
      facilities: form.facilities,
      minAdults: form.minAdults,
      maxAdults: form.maxAdults,
      maxOccupants: form.maxOccupants,
      childrenCapacity: form.childrenCapacity,
      includedOccupancy: form.includedOccupancy,
    };
    if (editingId !== null) {
      setRooms((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...base } : r)));
    } else {
      setRooms((prev) => [...prev, { id: Date.now(), ...base }]);
    }
    cancel();
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-5 shrink-0">
        <h1 className="font-display-lg text-2xl text-primary font-bold">Room Information</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Add each room category with its bed configuration, capacity, images, and amenities.
        </p>
      </div>

      {!showForm ? (
        <div className="space-y-3">
          {rooms.map((r) => (
            <Fragment key={r.id}>
              <ItemCard
                icon="bed"
                title={r.shortTitle || r.name}
                subtitle={`${r.type} · ${r.bed} bed · ${r.bedrooms}br · max ${r.maxOccupants || '?'} guests`}
                onEdit={() => startEdit(r)}
                onDelete={() => setRooms((prev) => prev.filter((x) => x.id !== r.id))}
              />
            </Fragment>
          ))}
          <AddItemButton label="Add Room Type" onClick={startNew} />
        </div>
      ) : (
        <>
          <ConfigSection
            title={editingId !== null ? 'Edit Room' : 'Room Details'}
            description="Basic identification and bed configuration. The short title is what guests see in search results."
            icon="bed"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <FormField label="Room Code" required hint='Internal code like "STD-KG-01".'>
                <TextInput
                  placeholder="STD-KG-01"
                  value={form.code}
                  onChange={(e) => update('code', e.target.value)}
                />
              </FormField>

              <FormField label="Short Title" required hint="Max 30 chars — appears in the room card.">
                <TextInput
                  placeholder="Standard King Room"
                  maxLength={30}
                  value={form.shortTitle}
                  onChange={(e) => update('shortTitle', e.target.value)}
                />
              </FormField>

              <FormField label="Long Title" hint="Max 50 chars — appears on the room detail page." className="col-span-2">
                <TextInput
                  placeholder="Comfortable Standard King Room with City View"
                  maxLength={50}
                  value={form.longTitle}
                  onChange={(e) => update('longTitle', e.target.value)}
                />
              </FormField>

              <FormField label="Room Type" required>
                <SelectInput value={form.type} onChange={(e) => update('type', e.target.value)}>
                  <option value="">Select type</option>
                  {roomTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField label="Bed Type" required>
                <SelectInput value={form.bed} onChange={(e) => update('bed', e.target.value)}>
                  <option value="">Select bed type</option>
                  {bedTypes.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField label="Number of Bedrooms" required>
                <TextInput
                  type="number"
                  min={1}
                  placeholder="1"
                  value={form.bedrooms}
                  onChange={(e) => update('bedrooms', Number(e.target.value) as FormState['bedrooms'])}
                />
              </FormField>

              <FormField label="Image URLs" hint="Paste public image URLs separated by commas." className="col-span-2">
                <TextInput
                  placeholder="https://cdn.com/room1.jpg, https://cdn.com/room2.jpg"
                  value={form.imageUrlsRaw}
                  onChange={(e) => update('imageUrlsRaw', e.target.value)}
                />
              </FormField>
            </div>
          </ConfigSection>

          <ConfigSection
            title="Occupancy & Capacity"
            description="Capacity rules specific to this room type — older guests, kids, and what's included in the base rate."
            icon="group"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <FormField label="Minimum Adults" required>
                <TextInput
                  type="number"
                  min={1}
                  placeholder="1"
                  value={form.minAdults}
                  onChange={(e) => update('minAdults', e.target.value)}
                />
              </FormField>

              <FormField label="Maximum Adults" required>
                <TextInput
                  type="number"
                  min={1}
                  placeholder="2"
                  value={form.maxAdults}
                  onChange={(e) => update('maxAdults', e.target.value)}
                />
              </FormField>

              <FormField label="Maximum Total Occupants" required hint="Adults + children combined.">
                <TextInput
                  type="number"
                  min={1}
                  placeholder="3"
                  value={form.maxOccupants}
                  onChange={(e) => update('maxOccupants', e.target.value)}
                />
              </FormField>

              <FormField label="Children Capacity" required>
                <TextInput
                  type="number"
                  min={0}
                  placeholder="1"
                  value={form.childrenCapacity}
                  onChange={(e) => update('childrenCapacity', e.target.value)}
                />
              </FormField>

              <FormField
                label="Included Occupancy"
                required
                className="col-span-2"
                hint="Number of guests included in the base rate — extras pay the per-person surcharge."
              >
                <TextInput
                  type="number"
                  min={1}
                  placeholder="2"
                  value={form.includedOccupancy}
                  onChange={(e) => update('includedOccupancy', e.target.value)}
                />
              </FormField>
            </div>
          </ConfigSection>

          <ConfigSection
            title="Facilities"
            description="In-room amenities. Toggle each facility this room offers."
            icon="bathtub"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 col-span-2">
              {[...facilityList, ...customFacilities].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFacility(f)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-[11px] font-bold cursor-pointer text-left ${
                    form.facilities.includes(f)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Add custom facility */}
            <div className="col-span-2 flex gap-2 mt-1">
              <input
                type="text"
                value={customFacInput}
                onChange={(e) => setCustomFacInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomFacility(); } }}
                placeholder="Agregar facility personalizada…"
                className="flex-1 text-xs px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-white"
              />
              <button
                type="button"
                onClick={addCustomFacility}
                disabled={!customFacInput.trim()}
                className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg disabled:opacity-40 cursor-pointer hover:opacity-90 transition"
              >
                Agregar
              </button>
            </div>

            <div className="mt-6">
              <FormActions onCancel={cancel} onSave={saveRoom} saveLabel={editingId !== null ? 'Update Room' : 'Save Room'} />
            </div>
          </ConfigSection>
        </>
      )}
    </div>
  );
};
