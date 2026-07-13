import { useState, useImperativeHandle, forwardRef, Fragment, type Dispatch, type SetStateAction } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection, ItemCard, AddItemButton, FormActions } from '../../components/ui/layout';
import { formatBeds, type BedConfig } from '../../utils/beds';

export type RoomItem = {
  id: number;
  code: string;
  shortTitle: string;
  longTitle: string;
  description: string; // long-form room description (backwards compat: defaults to '')
  name: string;        // alias of shortTitle for backwards compat
  type: string;
  beds: BedConfig[];
  bed?: string; // legacy single bed type — only present on rooms saved before multi-bed support
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

type FormState = Omit<RoomItem, 'id' | 'name' | 'bed'> & { imageUrlsRaw: string };

const EMPTY_FORM: FormState = {
  code: '',
  shortTitle: '',
  longTitle: '',
  description: '',
  type: '',
  beds: [{ type: '', count: 1 }],
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

export interface RoomInformationStepHandle {
  // Auto-commits an open, unsaved room form when the user navigates forward
  // via the global Continue button instead of the internal "Save Room" button —
  // otherwise the in-progress room is silently discarded. Returns the updated
  // rooms array synchronously so the caller can use it immediately (setRooms
  // itself only takes effect on the next render).
  commitPending: () => RoomItem[] | null;
}

export const RoomInformationStep = forwardRef<RoomInformationStepHandle, Props>(({ rooms, setRooms }, ref) => {
  const [showForm, setShowForm] = useState(rooms.length === 0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [customFacInput, setCustomFacInput] = useState('');
  const [customFacilities, setCustomFacilities] = useState<string[]>([]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addBedRow = () =>
    setForm((f) => ({ ...f, beds: [...f.beds, { type: '', count: 1 }] }));

  const removeBedRow = (index: number) =>
    setForm((f) => ({ ...f, beds: f.beds.filter((_, i) => i !== index) }));

  const updateBedRow = (index: number, patch: Partial<BedConfig>) =>
    setForm((f) => ({
      ...f,
      beds: f.beds.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }));

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
      description: r.description ?? '',
      type: r.type,
      beds: r.beds && r.beds.length > 0
        ? r.beds
        : r.bed
          ? [{ type: r.bed, count: 1 }]
          : [{ type: '', count: 1 }],
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

  // Builds the room object from the current form, commits it into `rooms`
  // (update or insert), closes the form, and returns the new array so callers
  // that can't wait for the next render (e.g. an immediate autosave) can use
  // the fresh data right away.
  const commit = (): RoomItem[] => {
    const imageUrls = form.imageUrlsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const cleanBeds = form.beds
      .filter((b) => b.type.trim())
      .map((b) => ({ type: b.type, count: Math.max(1, Number(b.count) || 1) }));
    const base = {
      code: form.code,
      shortTitle: form.shortTitle,
      longTitle: form.longTitle,
      description: form.description,
      name: form.shortTitle || form.code || 'Room',
      type: form.type || 'Standard Room',
      beds: cleanBeds.length > 0 ? cleanBeds : [{ type: 'Queen', count: 1 }],
      bedrooms: Number(form.bedrooms) || 1,
      imageUrls,
      facilities: form.facilities,
      minAdults: form.minAdults,
      maxAdults: form.maxAdults,
      maxOccupants: form.maxOccupants,
      childrenCapacity: form.childrenCapacity,
      includedOccupancy: form.includedOccupancy,
    };
    const next = editingId !== null
      ? rooms.map((r) => (r.id === editingId ? { ...r, ...base } : r))
      : [...rooms, { id: Date.now(), ...base }];
    setRooms(next);
    cancel();
    return next;
  };

  const saveRoom = () => { commit(); };

  useImperativeHandle(ref, () => ({
    commitPending: () => {
      if (!showForm) return null;
      const hasData = form.code.trim() || form.shortTitle.trim() || form.longTitle.trim() || form.description.trim();
      if (!hasData) return null;
      return commit();
    },
  }), [showForm, form, editingId, rooms]);

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
                subtitle={`${r.code ? r.code + ' · ' : ''}${r.type} · ${formatBeds(r.beds, r.bed)} · ${r.bedrooms}br · max ${r.maxOccupants || '?'} guests`}
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

              <FormField label="Room Description" hint="Full description shown on the room detail page." className="col-span-2">
                <TextareaInput
                  rows={3}
                  placeholder="Describe the room — views, ambiance, standout amenities..."
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
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

              <FormField label="Bed Configuration" required hint="Add one row per distinct bed type in this room." className="col-span-2">
                <div className="space-y-2">
                  {form.beds.map((b, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <SelectInput
                        value={b.type}
                        onChange={(e) => updateBedRow(i, { type: e.target.value })}
                        className="flex-1"
                      >
                        <option value="">Select bed type</option>
                        {bedTypes.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </SelectInput>
                      <TextInput
                        type="number"
                        min={1}
                        value={b.count}
                        onChange={(e) => updateBedRow(i, { count: Number(e.target.value) })}
                        className="w-20"
                      />
                      <button
                        type="button"
                        onClick={() => removeBedRow(i)}
                        disabled={form.beds.length === 1}
                        className="px-2 py-2 text-xs text-on-surface-variant disabled:opacity-30 cursor-pointer hover:text-primary"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBedRow}
                    className="text-xs font-bold text-primary hover:opacity-80 cursor-pointer"
                  >
                    + Add bed type
                  </button>
                </div>
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
});
