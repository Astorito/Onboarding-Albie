import { useState, type Dispatch, type SetStateAction } from 'react';
import { Icon, Toggle } from '../../components/ui/primitives';
import { CURRENCIES } from '../../data/currencies';

export type AddonConfig = { enabled: boolean; price: string; currency?: string; unit?: string };

const CHARGE_UNITS = [
  'Per stay',
  'Per night',
  'Per person',
  'Per person, per night',
  'Per room',
  'Per booking',
  'One-time fee',
];

interface Props {
  addons: Record<string, AddonConfig>;
  setAddons: Dispatch<SetStateAction<Record<string, AddonConfig>>>;
}

export const AddOnsStep = ({ addons, setAddons }: Props) => {
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  const iconMap: Record<string, string> = {
    'Early Check-In': 'login',
    'Late Check-Out': 'logout',
    'Airport Transfer': 'local_taxi',
    'Breakfast Upgrade': 'free_breakfast',
    Parking: 'local_parking',
    'Pet Fee': 'pets',
    'Extra Child': 'child_care',
    'Infant Crib': 'crib',
    'Extra Bed': 'bed',
    'Babysitting Service': 'escalator_warning',
  };

  const toggle = (name: string) =>
    setAddons((prev) => ({ ...prev, [name]: { ...prev[name], enabled: !prev[name].enabled } }));

  const setPrice = (name: string, price: string) =>
    setAddons((prev) => ({ ...prev, [name]: { ...prev[name], price } }));

  const setCurrency = (name: string, currency: string) =>
    setAddons((prev) => ({ ...prev, [name]: { ...prev[name], currency } }));

  const setUnit = (name: string, unit: string) =>
    setAddons((prev) => ({ ...prev, [name]: { ...prev[name], unit } }));

  const addCustomService = () => {
    const name = customName.trim();
    if (!name || addons[name]) return;
    setAddons((prev) => ({ ...prev, [name]: { enabled: true, price: '' } }));
    setCustomName('');
    setAddingCustom(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Add-ons & Extra Services</h1>
        <p className="text-on-surface-variant text-xs">
          Enable optional services and configure their pricing.
        </p>
      </div>

      <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(addons).map(([name, config]) => (
            <div
              key={name}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                config.enabled ? 'border-primary/30 bg-primary/5' : 'border-outline-variant bg-white'
              }`}
            >
              <div
                className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                  config.enabled ? 'bg-secondary text-white' : 'bg-surface-container-low text-primary/40'
                }`}
              >
                <Icon name={iconMap[name] || 'room_service'} className="text-xl" />
              </div>

              <div className="flex-grow min-w-0">
                <p className={`font-bold text-sm ${config.enabled ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {name}
                </p>
                {config.enabled && (
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    <div className="flex items-center gap-1">
                      <select
                        value={config.currency ?? ''}
                        onChange={(e) => setCurrency(name, e.target.value)}
                        className="text-xs px-1.5 py-1 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-white max-w-[88px]"
                      >
                        <option value="">Currency</option>
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={config.price}
                        onChange={(e) => setPrice(name, e.target.value)}
                        placeholder="0"
                        className="w-20 px-2 py-1 text-xs border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                    <select
                      value={config.unit ?? ''}
                      onChange={(e) => setUnit(name, e.target.value)}
                      className="text-[10px] px-1.5 py-1 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="">Select charge unit</option>
                      {CHARGE_UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <Toggle checked={config.enabled} onChange={() => toggle(name)} />
            </div>
          ))}

          {/* Add Custom Service */}
          {!addingCustom ? (
            <button
              onClick={() => setAddingCustom(true)}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-outline-variant text-primary/40 hover:text-primary hover:border-primary font-bold transition-all cursor-pointer text-sm"
            >
              <Icon name="add_circle" className="text-xl" />
              Add Custom Service
            </button>
          ) : (
            <div className="flex items-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary col-span-1 md:col-span-2">
              <Icon name="room_service" className="text-xl text-primary/40 shrink-0" />
              <input
                autoFocus
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustomService();
                  if (e.key === 'Escape') { setAddingCustom(false); setCustomName(''); }
                }}
                placeholder="Service name…"
                className="flex-1 text-sm px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={addCustomService}
                disabled={!customName.trim()}
                className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg disabled:opacity-40 cursor-pointer hover:opacity-90 transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setAddingCustom(false); setCustomName(''); }}
                className="px-3 py-2 text-sm text-on-surface-variant hover:text-primary cursor-pointer transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
