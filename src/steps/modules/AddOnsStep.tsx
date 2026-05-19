import { useState } from 'react';
import { Icon, Toggle } from '../../components/ui/primitives';

type AddonConfig = { enabled: boolean; price: string };

export const AddOnsStep = () => {
  const [addons, setAddons] = useState<Record<string, AddonConfig>>({
    'Early Check-In': { enabled: true, price: '30' },
    'Late Check-Out': { enabled: true, price: '30' },
    'Airport Transfer': { enabled: false, price: '' },
    'Breakfast Upgrade': { enabled: true, price: '25' },
    Parking: { enabled: false, price: '' },
    'Pet Fee': { enabled: false, price: '' },
    'Extra Child': { enabled: true, price: '20' },
    'Infant Crib': { enabled: false, price: '' },
    'Extra Bed': { enabled: false, price: '' },
    'Babysitting Service': { enabled: false, price: '' },
  });

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
                <Icon name={iconMap[name] || 'add'} className="text-xl" />
              </div>

              <div className="flex-grow min-w-0">
                <p className={`font-bold text-sm ${config.enabled ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {name}
                </p>
                {config.enabled && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-xs text-on-surface-variant font-bold">€</span>
                    <input
                      type="number"
                      value={config.price}
                      onChange={(e) => setPrice(name, e.target.value)}
                      placeholder="0"
                      className="w-20 px-2 py-1 text-xs border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                    />
                    <span className="text-[10px] text-on-surface-variant">per stay</span>
                  </div>
                )}
              </div>

              <Toggle checked={config.enabled} onChange={() => toggle(name)} />
            </div>
          ))}

          <button className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-outline-variant text-primary/40 hover:text-primary hover:border-primary font-bold transition-all cursor-pointer text-sm">
            <Icon name="add_circle" className="text-xl" />
            Add Custom Service
          </button>
        </div>
      </div>
    </div>
  );
};
