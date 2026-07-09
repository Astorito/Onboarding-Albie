import { useState, useImperativeHandle, forwardRef, Fragment, type Dispatch, type SetStateAction } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection, ItemCard, AddItemButton, FormActions } from '../../components/ui/layout';

export type TaxItem = {
  id: number;
  name: string;
  type: string;
  description: string;
  chargeType: string;   // "Percentage" | "Fixed Amount"
  value: string;
  quantifier: string;   // Per booking | Per room per night | Per person per night | Per stay
};

const EMPTY_FORM: Omit<TaxItem, 'id'> = {
  name: '',
  type: 'Other',
  description: '',
  chargeType: 'Percentage',
  value: '',
  quantifier: 'Per booking',
};

const taxTypes = [
  'Room Tax', 'Sales Tax', 'Value Added Tax (VAT)', 'Tourism Tax', 'Occupancy Tax',
  'State Tax', 'City Tax', 'Local Tax', 'Service Fee', 'Resort Fee', 'Package Fee',
  'Room Service Fee', 'Cleaning Fee', 'Convenience Fee', 'Destination Fee', 'Amenity Fee',
  'Environmental Fee', 'Eco Tax', 'Municipal Tax', 'Government Tax', 'Other',
];

const quantifiers = [
  'Per booking', 'Per room per night', 'Per person per night', 'Per stay',
];

interface Props {
  taxes: TaxItem[];
  setTaxes: Dispatch<SetStateAction<TaxItem[]>>;
}

export interface TaxesFeesStepHandle {
  // See RoomInformationStepHandle.commitPending for rationale.
  commitPending: () => TaxItem[] | null;
}

export const TaxesFeesStep = forwardRef<TaxesFeesStepHandle, Props>(({ taxes, setTaxes }, ref) => {
  const [showForm, setShowForm] = useState(taxes.length === 0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const update = <K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (t: TaxItem) => {
    setForm({
      name: t.name,
      type: t.type,
      description: t.description ?? '',
      chargeType: t.chargeType,
      value: t.value,
      quantifier: t.quantifier ?? 'Per booking',
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const commit = (): TaxItem[] => {
    const next = editingId !== null
      ? taxes.map((t) => (t.id === editingId ? { ...t, ...form } : t))
      : [...taxes, { id: Date.now(), ...form }];
    setTaxes(next);
    cancel();
    return next;
  };

  const saveTax = () => { commit(); };

  useImperativeHandle(ref, () => ({
    commitPending: () => {
      if (!showForm) return null;
      const hasData = form.name.trim() || form.value.trim() || form.description.trim();
      if (!hasData) return null;
      return commit();
    },
  }), [showForm, form, editingId, taxes]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-5 shrink-0">
        <h1 className="font-display-lg text-2xl text-primary font-bold">Taxes & Fees</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Define each tax or fee that should be added to bookings — VAT, tourism tax, service fees, etc.
        </p>
      </div>

      {!showForm ? (
        <div className="space-y-3">
          {taxes.map((t) => (
            <Fragment key={t.id}>
              <ItemCard
                icon="payments"
                title={t.name || t.type}
                subtitle={`${t.type} · ${t.chargeType} ${t.value}${t.chargeType === 'Percentage' ? '%' : ''} · ${t.quantifier}`}
                onEdit={() => startEdit(t)}
                onDelete={() => setTaxes((prev) => prev.filter((x) => x.id !== t.id))}
              />
            </Fragment>
          ))}
          <AddItemButton label="Add Tax or Fee" onClick={startNew} />
        </div>
      ) : (
        <ConfigSection
          title={editingId !== null ? 'Edit Tax' : 'Tax Information'}
          description="Define the type, charge method, and applicable value for this tax or fee."
          icon="payments"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <FormField label="Tax Name" required hint='Friendly name. Example: "VAT 21%" or "Copenhagen Tourism Tax".'>
              <TextInput
                placeholder="City Tourism Tax"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </FormField>

            <FormField label="Tax Type" required hint="Category for reporting and grouping.">
              <SelectInput value={form.type} onChange={(e) => update('type', e.target.value)}>
                {taxTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Description" className="col-span-2" hint="Optional — appears on the booking summary.">
              <TextareaInput
                rows={2}
                placeholder="Brief description of this tax or fee..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </FormField>

            <FormField label="Charge Type" required>
              <SelectInput value={form.chargeType} onChange={(e) => update('chargeType', e.target.value)}>
                <option>Percentage</option>
                <option>Fixed Amount</option>
              </SelectInput>
            </FormField>

            <FormField
              label={`Value ${form.chargeType === 'Percentage' ? '(%)' : '(Amount)'}`}
              required
              hint={form.chargeType === 'Percentage' ? 'A number between 1 and 100.' : 'In your property currency.'}
            >
              <TextInput
                type="number"
                placeholder={form.chargeType === 'Percentage' ? '21' : '5.00'}
                value={form.value}
                onChange={(e) => update('value', e.target.value)}
              />
            </FormField>

            <FormField label="Quantifier" required className="col-span-2" hint="How the tax is multiplied across a booking.">
              <SelectInput value={form.quantifier} onChange={(e) => update('quantifier', e.target.value)}>
                {quantifiers.map((q) => (
                  <option key={q}>{q}</option>
                ))}
              </SelectInput>
            </FormField>

            <FormActions onCancel={cancel} onSave={saveTax} saveLabel={editingId !== null ? 'Update' : 'Save'} />
          </div>
        </ConfigSection>
      )}
    </div>
  );
});
