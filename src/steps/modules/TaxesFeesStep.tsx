import { useState, Fragment, type Dispatch, type SetStateAction } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection, ItemCard, AddItemButton, FormActions } from '../../components/ui/layout';

export type TaxItem = {
  id: number;
  name: string;
  type: string;
  chargeType: string;
  value: string;
};

interface Props {
  taxes: TaxItem[];
  setTaxes: Dispatch<SetStateAction<TaxItem[]>>;
}

export const TaxesFeesStep = ({ taxes, setTaxes }: Props) => {
  const [showForm, setShowForm] = useState(taxes.length === 0);
  const [chargeType, setChargeType] = useState('Percentage');

  const taxTypes = [
    'Room Tax', 'Sales Tax', 'Value Added Tax (VAT)', 'Tourism Tax', 'Occupancy Tax',
    'State Tax', 'City Tax', 'Local Tax', 'Service Fee', 'Resort Fee', 'Package Fee',
    'Room Service Fee', 'Cleaning Fee', 'Convenience Fee', 'Destination Fee', 'Amenity Fee',
    'Environmental Fee', 'Eco Tax', 'Municipal Tax', 'Government Tax', 'Other',
  ];

  const quantifiers = [
    'Per booking', 'Per room per night', 'Per person per night', 'Per stay',
  ];

  const saveTax = () => {
    setTaxes((prev) => [
      ...prev,
      { id: Date.now(), name: 'New Tax', type: 'Other', chargeType, value: '0' },
    ]);
    setShowForm(false);
    setChargeType('Percentage');
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Taxes & Fees</h1>
        <p className="text-on-surface-variant text-xs">
          Define tax types, charge settings, and fee structures.
        </p>
      </div>

      {!showForm ? (
        <div className="space-y-3">
          {taxes.map((t) => (
            <Fragment key={t.id}>
              <ItemCard
                icon="payments"
                title={t.name}
                subtitle={`${t.type} · ${t.chargeType} ${t.value}${t.chargeType === 'Percentage' ? '%' : ''}`}
                onEdit={() => {}}
                onDelete={() => setTaxes((prev) => prev.filter((x) => x.id !== t.id))}
              />
            </Fragment>
          ))}
          <AddItemButton label="Add Tax or Fee" onClick={() => setShowForm(true)} />
        </div>
      ) : (
        <ConfigSection
          title="Tax Information"
          description="Define the tax type, charge method, and applicable value."
          icon="payments"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Tax Name" required>
              <TextInput placeholder="City Tourism Tax" />
            </FormField>

            <FormField label="Tax Type" required>
              <SelectInput>
                {taxTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Tax Description" className="col-span-2">
              <TextareaInput rows={2} placeholder="Brief description of this tax or fee..." />
            </FormField>

            <FormField label="Charge Type" required>
              <SelectInput value={chargeType} onChange={(e) => setChargeType(e.target.value)}>
                <option>Percentage</option>
                <option>Fixed Amount</option>
              </SelectInput>
            </FormField>

            <FormField
              label={`Tax Value ${chargeType === 'Percentage' ? '(%)' : '(Amount)'}`}
              required
            >
              <TextInput
                type="number"
                placeholder={chargeType === 'Percentage' ? '21' : '5.00'}
              />
            </FormField>

            <FormField label="Quantifier" required className="col-span-2">
              <SelectInput>
                {quantifiers.map((q) => (
                  <option key={q}>{q}</option>
                ))}
              </SelectInput>
            </FormField>

            <FormActions onCancel={() => setShowForm(false)} onSave={saveTax} />
          </div>
        </ConfigSection>
      )}
    </div>
  );
};
