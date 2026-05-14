/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// Re-using the naming from your design (using Material Symbols as provided in your HTML)
const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const Header = () => (
  <header className="fixed top-0 w-full bg-surface border-b border-outline-variant flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 z-50">
    <div className="font-headline-lg text-headline-lg font-bold text-primary">Albie</div>
    <div className="flex items-center gap-stack-md">
      <button className="flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full transition-all">
        <Icon name="help" />
      </button>
      <button className="flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full transition-all">
        <Icon name="account_circle" />
      </button>
    </div>
  </header>
);

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const percentage = Math.round((currentStep / (totalSteps - 1)) * 100);
  return (
    <div className="mb-2 w-full max-w-[600px] mx-auto text-[10px]">
      <div className="flex justify-between items-end mb-2">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
          Step {currentStep} of {totalSteps - 1}
        </span>
        <span className="font-label-md text-label-md text-primary font-bold">{percentage}% Complete</span>
      </div>
      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="h-full bg-secondary transition-all duration-500"
        />
      </div>
    </div>
  );
};

const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile">
    <div className="max-w-container-max-width w-full grid md:grid-cols-12 gap-gutter items-center">
      <div className="md:col-span-6 flex flex-col items-start gap-6 py-4">
        <div className="flex flex-col gap-2">
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit">
            ESTIMATE TIME: 8 MINUTES
          </span>
          <h1 className="font-display-lg text-4xl lg:text-6xl text-primary leading-tight">Welcome to Albie</h1>
          <p className="font-body-md text-on-surface-variant max-w-lg">
            Let's set up your booking engine to start receiving reservations. Our architectural onboarding ensures precision in every detail of your operations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
          <button
            onClick={onNext}
            className="bg-primary text-on-primary font-body-md px-10 py-4 rounded-lg shadow-sm hover:opacity-90 transition-all active:scale-95 duration-200 cursor-pointer font-bold"
          >
            Start Onboarding
          </button>
          <button className="bg-transparent border border-primary text-primary font-body-md px-10 py-4 rounded-lg hover:bg-surface-container-low transition-all active:scale-95 duration-200 cursor-pointer font-bold">
            Watch Demo
          </button>
        </div>
      </div>
      <div className="md:col-span-6 hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-[450px]">
        <div className="col-span-1 row-span-2 rounded-2xl overflow-hidden border border-outline-variant shadow-lg">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000"
            alt="Hotel Exterior"
          />
        </div>
        <div className="col-span-1 row-span-1 border border-outline-variant rounded-2xl overflow-hidden shadow-md">
           <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000"
            alt="Hotel Lobby"
          />
        </div>
        <div className="col-span-1 row-span-1 rounded-2xl border border-outline-variant bg-secondary-container p-6 flex flex-col justify-center shadow-md">
          <Icon name="rocket_launch" className="text-secondary text-4xl mb-2" />
          <h3 className="font-headline-sm text-xl text-primary font-bold">Rapid Launch</h3>
          <p className="font-body-sm text-on-secondary-fixed-variant">Ready in 8 minutes.</p>
        </div>
      </div>
    </div>
  </main>
);

const RoleSelectionStep = ({ onSelect }: { onSelect: (role: 'admin' | 'client') => void }) => (
  <main className="h-full flex flex-col items-center justify-center px-margin-mobile">
    <div className="text-center mb-10">
      <div className="font-headline-lg text-headline-lg font-bold text-primary mb-2">Albie</div>
      <h2 className="font-display-lg text-3xl md:text-5xl text-primary mb-2">Identify your session</h2>
      <p className="text-on-surface-variant max-w-md mx-auto">Choose your profile to continue with the architectural experience.</p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
      <button 
        onClick={() => onSelect('admin')}
        className="group relative flex flex-col items-center p-10 bg-white border-2 border-outline-variant rounded-[40px] hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95 text-left overflow-hidden cursor-pointer"
      >
        <div className="w-20 h-20 bg-secondary-container rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
          <Icon name="design_services" className="text-4xl text-secondary" />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-2">Administrator</h3>
        <p className="text-center text-on-surface-variant text-sm leading-relaxed mb-4">
          Exclusive access for the design team and technical management of the platform.
        </p>
        <div className="mt-auto flex items-center gap-2 text-primary font-bold text-sm">
          Enter Design Suite <Icon name="arrow_forward" className="text-sm" />
        </div>
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
      </button>

      <button 
        onClick={() => onSelect('client')}
        className="group relative flex flex-col items-center p-10 bg-white border-2 border-outline-variant rounded-[40px] hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95 text-left overflow-hidden cursor-pointer"
      >
        <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform">
          <Icon name="person" className="text-4xl text-secondary" />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-2">Client</h3>
        <p className="text-center text-on-surface-variant text-sm leading-relaxed mb-4">
          Start the onboarding process to configure your personalized booking engine.
        </p>
        <div className="mt-auto flex items-center gap-2 text-primary font-bold text-sm">
          Get Started <Icon name="arrow_forward" className="text-sm" />
        </div>
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-secondary/5 rounded-full blur-2xl"></div>
      </button>
    </div>
  </main>
);

const AdminDashboardStep = ({ onCreate }: { onCreate: () => void }) => {
  const [selectedModules, setSelectedModules] = useState<string[]>(['Address', 'Rooms']);
  const [analyzing, setAnalyzing] = useState(false);

  const modules = [
    { id: 'Address', icon: 'location_on', label: 'Address', completed: true },
    { id: 'Taxes', icon: 'payments', label: 'Taxes', completed: false },
    { id: 'Rooms', icon: 'bed', label: 'Rooms', completed: true },
    { id: 'Rates', icon: 'sell', label: 'Rates', completed: false },
    { id: 'Activities', icon: 'local_activity', label: 'Activities', completed: false },
  ];

  const handleToggle = (id: string) => {
    setSelectedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-center py-6 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Data Extraction */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">Data Extraction</h2>
            <p className="text-on-surface-variant">Upload documents or requests to train Albie.</p>
          </div>
          
          <div className="border-2 border-dashed border-outline-variant rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 bg-white/50 hover:border-primary transition-colors group cursor-pointer">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="upload_file" className="text-3xl text-primary" />
            </div>
            <div>
              <p className="font-bold text-primary">Drop files here</p>
              <p className="text-xs text-on-surface-variant">PDF, DOCX or Images up to 20MB</p>
            </div>
            <button className="mt-2 text-primary font-bold text-sm underline underline-offset-4">Browse files</button>
          </div>

          <button 
            onClick={() => {
                setAnalyzing(true);
                setTimeout(() => setAnalyzing(false), 2000);
            }}
            disabled={analyzing}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                analyzing 
                ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' 
                : 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]'
            }`}
          >
            {analyzing ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Icon name="sync" className="text-xl" />
                </motion.div>
                Analyzing with Albie...
              </>
            ) : (
              <>
                <Icon name="auto_awesome" className="text-xl" />
                Analyze with Albie
              </>
            )}
          </button>
        </div>

        {/* Right Column: Modules */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">Onboarding Modules</h2>
            <p className="text-on-surface-variant">Select components to include in the client flow.</p>
          </div>

          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => handleToggle(m.id)}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all duration-300 gap-4 relative overflow-hidden group w-full ${
                  selectedModules.includes(m.id)
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-outline-variant bg-white hover:border-primary/50'
                }`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                    m.completed ? 'bg-secondary text-white' : 'bg-surface-container-low text-primary'
                }`}>
                  <Icon name={m.icon} className="text-xl" />
                </div>
                <span className={`font-bold text-lg transition-colors ${selectedModules.includes(m.id) ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {m.label}
                </span>
                
                {m.completed && (
                  <div className="ml-auto text-secondary flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ready</span>
                    <Icon name="check_circle" className="text-lg" />
                  </div>
                )}
                
                {!m.completed && selectedModules.includes(m.id) && (
                    <div className="ml-auto text-primary">
                        <Icon name="radio_button_checked" className="text-lg" />
                    </div>
                )}

                {!m.completed && !selectedModules.includes(m.id) && (
                    <div className="ml-auto text-outline-variant">
                        <Icon name="radio_button_unchecked" className="text-lg" />
                    </div>
                )}
              </button>
            ))}
          </div>

          <button 
            onClick={onCreate}
            className="w-full mt-4 py-5 bg-secondary text-on-secondary rounded-2xl font-bold text-lg shadow-xl shadow-secondary/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            Create Onboarding
            <Icon name="rocket_launch" className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfigSection = ({ title, description, children, icon = "info" }: { title: string; description: string; children: React.ReactNode; icon?: string }) => (
  <div className="w-full bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
    {/* Info Sidebar */}
    <div className="w-full md:w-1/3 bg-surface-container-low/20 p-6 border-b md:border-b-0 md:border-r border-outline-variant flex flex-col gap-4">
      <div className="flex items-start gap-3 text-primary">
        <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0" />
        <div>
          <h3 className="font-bold text-base leading-tight mb-1">{title}</h3>
          <p className="text-on-surface-variant text-xs leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-auto hidden md:block">
         <Icon name={icon} className="text-3xl text-primary/10" />
      </div>
    </div>
    {/* Configuration Content */}
    <div className="w-full md:w-2/3 p-6 bg-white overflow-y-auto max-h-[60vh] md:max-h-none">
      {children}
    </div>
  </div>
);

const PropertyDetailsStep = () => {
  const [propertyType, setPropertyType] = useState('Hotel');

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-center py-4">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
           <h1 className="font-display-lg text-xl text-primary font-bold">Create Organization</h1>
           <p className="text-on-surface-variant text-xs">Fill in the primary details of your property.</p>
        </div>
        <div className="hidden lg:flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primary/40">
           <span>Profile</span> <Icon name="chevron_right" className="text-sm" /> <span>Organization</span>
        </div>
      </div>

      <ConfigSection 
        title="Organization" 
        description="Provide the organization's details, including name, domain, and contact info. The primary email will create the organization admin."
        icon="apartment"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="font-bold text-primary text-xs flex items-center gap-1" htmlFor="p-name">Name <span className="text-red-500">*</span></label>
            <input
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-sm text-sm"
              id="p-name"
              placeholder="Casa Collection"
              type="text"
            />
          </div>
          
          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="font-bold text-primary text-xs flex items-center gap-1" htmlFor="p-email">Email <span className="text-red-500">*</span></label>
            <input
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-sm text-sm"
              id="p-email"
              placeholder="projects@albie.com"
              type="email"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="font-bold text-primary text-xs flex items-center gap-1" htmlFor="p-phone">Phone Number <span className="text-red-500">*</span></label>
            <input
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-sm text-sm"
              id="p-phone"
              placeholder="+45 000 000"
              type="tel"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="font-bold text-primary text-xs flex items-center gap-1" htmlFor="p-domain">Primary Domain <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-sm text-sm pr-10"
                id="p-domain"
                placeholder="https://www.example.com"
                type="url"
              />
              <Icon name="help" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/20 text-lg cursor-help" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="font-bold text-primary text-xs flex items-center gap-1" htmlFor="p-address">Address <span className="text-red-500">*</span></label>
            <input
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-sm text-sm"
              id="p-address"
              placeholder="Search or enter physical location"
              type="text"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="font-bold text-primary text-xs flex items-center gap-1">Country <span className="text-red-500">*</span></label>
            <select className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-sm text-sm appearance-none">
              <option>Select Country</option>
              <option>United Kingdom</option>
              <option>Denmark</option>
              <option>Spain</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="font-bold text-primary text-xs flex items-center gap-1">State <span className="text-red-500">*</span></label>
            <select className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-sm text-sm appearance-none">
              <option>Select State</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="font-bold text-primary text-xs flex items-center gap-1" htmlFor="p-city">City <span className="text-red-500">*</span></label>
            <input
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-sm text-sm"
              id="p-city"
              placeholder="London"
              type="text"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="font-bold text-primary text-xs flex items-center gap-1" htmlFor="p-zip">Zip Code <span className="text-red-500">*</span></label>
            <input
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-sm text-sm"
              id="p-zip"
              placeholder="SW1A 1AA"
              type="text"
            />
          </div>
        </div>
      </ConfigSection>
    </div>
  );
};

const RoomSetupStep = () => {
    const [amenities, setAmenities] = useState<string[]>(['Wifi', 'TV']);
    const toggleAmenity = (name: string) => {
        setAmenities(prev => prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]);
    };

    const categories = [
        { name: 'Standard King', icon: 'king_bed', price: '€120', count: 12 },
        { name: 'Executive Suite', icon: 'room_service', price: '€250', count: 4 },
        { name: 'Penthouse Loft', icon: 'villa', price: '€600', count: 1 }
    ];

    return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-start md:justify-center py-4 overflow-y-auto custom-scrollbar">
             <div className="mb-4 shrink-0">
                <h1 className="font-display-lg text-xl text-primary font-bold">Operations Setup</h1>
                <p className="text-on-surface-variant text-xs">Define your inventory architecture and base services.</p>
            </div>

            <ConfigSection 
              title="Inventory" 
              description="Configure room categories, unit availability across your organization's sites, and primary nightly rates."
              icon="bed"
            >
              <div className="space-y-6">
                  <div className="space-y-3">
                      <label className="font-bold text-primary text-xs uppercase tracking-wider">Room Categories</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categories.map((cat) => (
                              <div key={cat.name} className="flex items-center justify-between p-4 bg-white border border-outline-variant rounded-xl group shadow-sm hover:border-primary transition-all">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-surface-container-low rounded-lg flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors">
                                          <Icon name={cat.icon} className="text-xl" />
                                      </div>
                                      <div>
                                          <p className="font-bold text-primary text-sm">{cat.name}</p>
                                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">{cat.price} starting</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <span className="font-bold text-sm text-primary bg-surface-container-low px-3 py-1 rounded-full">{cat.count} units</span>
                                      <button className="p-1.5 text-primary/30 hover:text-primary transition-colors cursor-pointer"><Icon name="edit" className="text-sm" /></button>
                                  </div>
                              </div>
                          ))}
                          <button className="flex flex-col items-center justify-center p-4 border border-dashed border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 text-primary/40 hover:text-primary transition-all gap-1 cursor-pointer">
                             <Icon name="add_circle" className="text-2xl" />
                             <span className="text-xs font-bold uppercase tracking-wider">Add Category</span>
                          </button>
                      </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant">
                      <label className="font-bold text-primary text-xs uppercase tracking-wider block mb-3">Organization Amenities</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {['Wifi', 'TV', 'Minibar', 'AC', 'Coffee', 'Safe', 'Desk', 'Kitchen'].map((item) => (
                              <button
                                  key={item}
                                  onClick={() => toggleAmenity(item)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-[11px] font-bold cursor-pointer ${
                                      amenities.includes(item)
                                      ? 'bg-primary text-white border-primary shadow-sm'
                                      : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                                  }`}
                              >
                                  <Icon name={
                                      item === 'Wifi' ? 'wifi' : 
                                      item === 'TV' ? 'tv' : 
                                      item === 'Minibar' ? 'wine_bar' :
                                      item === 'AC' ? 'ac_unit' :
                                      item === 'Coffee' ? 'coffee' :
                                      item === 'Safe' ? 'lock' :
                                      item === 'Desk' ? 'desk' : 'kitchen'
                                  } className="text-base" />
                                  {item}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
            </ConfigSection>
        </div>
    );
};

const BookingPoliciesStep = () => {
  const [selected, setSelected] = useState('Flexible');

  const policies = [
    { id: 'Flexible', title: 'Flexible (24h)', icon: 'verified_user', desc: 'Full refund for cancellations made at least 24 hours prior to check-in.', meta: 'Standard' },
    { id: 'Moderate', title: 'Moderate (72h)', icon: 'history', desc: 'Full refund if cancelled up to 3 days before arrival.', meta: 'Safety' },
    { id: 'Strict', title: 'Non-Refundable', icon: 'lock', desc: 'Guests will not receive any refund regardless of when they cancel.', meta: 'Protected' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-start md:justify-center py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Policy Management</h1>
        <p className="text-on-surface-variant text-xs">Define the cancellation framework and global booking rules.</p>
      </div>

      <ConfigSection 
        title="Cancellation Policy" 
        description="Select the default cancellation environment for your reservations. This can be overriden at the rate level later."
        icon="gavel"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {policies.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`group border transition-all duration-300 p-5 cursor-pointer rounded-xl flex items-center justify-between gap-4 ${
                  selected === p.id 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                  : 'bg-white border-outline-variant hover:border-primary'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg flex items-center justify-center ${selected === p.id ? 'bg-primary text-white' : 'bg-surface-container-low text-primary'}`}>
                    <Icon name={p.icon} className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-sm flex items-center gap-2">
                       {p.title}
                       <span className="text-[8px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full uppercase tracking-tighter">{p.meta}</span>
                    </h3>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed max-w-md">{p.desc}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected === p.id ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                  {selected === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center text-primary bg-surface-container-low">
                      <Icon name="verified" className="text-xl" />
                  </div>
                  <div>
                      <p className="font-bold text-sm text-primary">Compliance Verified</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Standards aligned with EU-regulations</p>
                  </div>
              </div>
              <button className="text-primary font-bold text-xs underline underline-offset-4 cursor-pointer">Preview Legal Text</button>
          </div>
        </div>
      </ConfigSection>
    </div>
  );
};

const ReviewStep = ({ onEdit }: { onEdit: (step: number) => void }) => {
  const categories = [
    { name: 'Standard King', units: '12', price: '€120' },
    { name: 'Executive Suite', units: '4', price: '€250' },
    { name: 'Penthouse Loft', units: '1', price: '€600' }
  ];

  const amenities = ['Wifi', 'TV', 'Minibar', 'AC', 'Coffee'];

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-start md:justify-center py-4 overflow-y-auto custom-scrollbar">
      <div className="mb-6 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Review Configuration</h1>
        <p className="text-on-surface-variant text-xs">Verify your architectural setup before initializing the engine.</p>
      </div>

      <div className="space-y-6 pb-20 md:pb-10">
        {/* Section: Organization */}
        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-surface-container-low/30 px-6 py-4 border-b border-outline-variant flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icon name="apartment" className="text-primary text-xl" />
              <h2 className="font-bold text-primary text-sm uppercase tracking-wider">Organization Details</h2>
            </div>
            <button 
              onClick={() => onEdit(2)}
              className="text-[10px] font-bold text-primary underline underline-offset-4 hover:text-secondary transition-colors cursor-pointer"
            >
              EDIT SECTION
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Property Name</p>
              <p className="font-bold text-primary text-sm">The Albie Pavilion & Suites</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Contact Email</p>
              <p className="font-bold text-primary text-sm">projects@albie.com</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Phone Number</p>
              <p className="font-bold text-primary text-sm">+45 000 000 000</p>
            </div>
            <div className="md:col-span-3 pt-4 border-t border-outline-variant/50 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Primary Domain</p>
                <p className="font-bold text-secondary text-sm">https://albie.luxury.com</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Physical Address</p>
                <p className="font-bold text-primary text-sm">Bredgade 34, 1260 København K, Denmark</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section: Inventory */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="bg-surface-container-low/30 px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Icon name="bed" className="text-primary text-xl" />
                <h2 className="font-bold text-primary text-sm uppercase tracking-wider">Inventory Setup</h2>
              </div>
              <button 
                onClick={() => onEdit(3)}
                className="text-[10px] font-bold text-primary underline underline-offset-4 hover:text-secondary transition-colors cursor-pointer"
              >
                EDIT
              </button>
            </div>
            <div className="p-6 flex-grow space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Room Categories</p>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.name} className="flex justify-between items-center p-3 bg-surface-container-low/50 rounded-xl border border-outline-variant/30">
                      <div className="flex items-center gap-3">
                        <Icon name="check_circle" className="text-secondary text-sm" />
                        <span className="font-bold text-primary text-xs">{cat.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-white px-2 py-0.5 rounded shadow-sm">{cat.units} units</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Base Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {amenities.map(a => (
                    <span key={a} className="text-[9px] font-bold bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Policies */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="bg-surface-container-low/30 px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Icon name="gavel" className="text-primary text-xl" />
                <h2 className="font-bold text-primary text-sm uppercase tracking-wider">Policy Framework</h2>
              </div>
              <button 
                onClick={() => onEdit(4)}
                className="text-[10px] font-bold text-primary underline underline-offset-4 hover:text-secondary transition-colors cursor-pointer"
              >
                EDIT
              </button>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <div className="bg-secondary/5 border border-secondary/10 p-5 rounded-2xl mb-4 relative overflow-hidden group">
                 <Icon name="verified_user" className="absolute -right-2 -bottom-2 text-secondary/10 text-6xl group-hover:scale-110 transition-transform" />
                 <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Selected Cancellation</p>
                 <h3 className="text-xl font-bold text-primary mb-2">Flexible (24h)</h3>
                 <p className="text-xs text-on-surface-variant leading-relaxed">Full refund for cancellations made at least 24 hours prior to check-in.</p>
              </div>
              
              <div className="mt-auto space-y-3">
                 <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                    <Icon name="payments" className="text-primary" />
                    <div>
                       <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter leading-none">Tax Logic</p>
                       <p className="text-[11px] font-bold text-primary uppercase">Standard EU Vat (Included)</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                    <Icon name="history" className="text-primary" />
                    <div>
                       <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter leading-none">Session Persistence</p>
                       <p className="text-[11px] font-bold text-primary uppercase">Active for 30 days</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessStep = () => {
  useEffect(() => {
    const end = Date.now() + 3 * 1000;
    const colors = ['#5b6300', '#dfec60', '#00191a'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  return (
    <div className="h-full flex items-center justify-center px-margin-mobile bg-surface">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-3xl w-full text-center bg-white border border-outline-variant p-10 md:p-16 rounded-[40px] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-bl-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary-container mb-8 shadow-inner">
                <Icon name="celebration" className="text-[56px] text-secondary" />
            </div>
            <h1 className="font-display-lg text-5xl text-primary mb-4">Congratulations!</h1>
            <p className="font-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto">
                Your onboarding process has begun. Our team is already working on your personalized booking engine setup.
            </p>
            
            <div className="p-8 bg-surface-container-low border border-outline-variant rounded-3xl inline-block w-full text-left relative group">
                <Icon name="mail" className="absolute right-8 top-8 text-primary/5 text-6xl group-hover:scale-110 transition-transform duration-500" />
                <p className="font-bold text-primary uppercase text-xs tracking-widest mb-3">Support Channel</p>
                <p className="font-body-md text-on-surface mb-2">
                    If you have any questions or need to make immediate adjustments, please reach out to our architectural support team:
                </p>
                <a 
                    href="mailto:support@theanythinggroup.com" 
                    className="font-headline-sm text-2xl text-primary hover:text-secondary transition-colors underline decoration-secondary/30 underline-offset-8"
                >
                    support@theanythinggroup.com
                </a>
            </div>
            
            <button 
                onClick={() => window.location.reload()}
                className="mt-12 bg-primary text-on-primary px-12 py-5 rounded-2xl font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xl hover:shadow-primary/20"
            >
                Go to Dashboard
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 7; // 0: Role Selection, 1: Welcome, 2: Details, 3: Inventory, 4: Policy, 5: Review, 6: Success

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleRoleSelect = (role: 'admin' | 'client') => {
    if (role === 'client') {
      setCurrentStep(1); // Go to Welcome
    } else {
      setCurrentStep(10); // Go to Admin Dashboard
    }
  };

  // Step 6 is the standalone success page
  const isNavigable = currentStep > 1 && currentStep < 6;

  return (
    <div className="h-screen overflow-hidden bg-background text-on-background font-hanken antialiased flex flex-col">
      {/* Top Left Global Back Button */}
      {currentStep > 0 && (
        <button
          onClick={() => setCurrentStep(0)}
          className="fixed top-6 left-6 z-50 p-3 flex items-center justify-center text-primary hover:bg-surface-container-low transition-all rounded-full opacity-40 hover:opacity-100 cursor-pointer shadow-sm hover:shadow-md bg-white/50 backdrop-blur-sm"
        >
          <Icon name="arrow_back" className="text-2xl" />
        </button>
      )}

      <div className="flex-grow flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="role"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <RoleSelectionStep onSelect={handleRoleSelect} />
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full"
            >
              <WelcomeStep onNext={handleNext} />
            </motion.div>
          )}

          {currentStep === 10 && (
            <motion.div
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
            >
                <AdminDashboardStep onCreate={() => setCurrentStep(1)} />
            </motion.div>
          )}

          {currentStep > 1 && currentStep < 6 && (
            <motion.div
              key="stepper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col pt-8 pb-4 px-margin-mobile md:px-margin-desktop w-full max-h-full overflow-hidden"
            >
              <div className="pt-2 shrink-0">
                <ProgressBar currentStep={currentStep - 1} totalSteps={totalSteps - 2} />
              </div>

              <div className="flex-grow flex flex-col items-center justify-start md:justify-center overflow-y-auto custom-scrollbar pt-4">
                <AnimatePresence mode="wait">
                    {currentStep === 2 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full h-full flex flex-col items-center justify-center">
                        <PropertyDetailsStep />
                    </motion.div>
                    )}
                    {currentStep === 3 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full h-full flex flex-col items-center justify-center">
                        <RoomSetupStep />
                    </motion.div>
                    )}
                    {currentStep === 4 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full h-full flex flex-col items-center justify-center">
                        <BookingPoliciesStep />
                    </motion.div>
                    )}
                    {currentStep === 5 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full h-full flex flex-col items-center justify-center">
                        <ReviewStep onEdit={setCurrentStep} />
                    </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <SuccessStep />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isNavigable && (
        <div className="contents">
          <button
            onClick={handleBack}
            className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 group flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-primary text-primary rounded-xl px-6 py-3 font-bold hover:bg-surface-container-low transition-all active:scale-95 duration-200 font-label-md cursor-pointer shadow-lg"
          >
            <Icon name="arrow_back" className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group flex items-center gap-2 bg-secondary text-on-secondary rounded-xl px-10 py-4 font-bold hover:opacity-95 transition-all active:scale-95 duration-200 font-label-md cursor-pointer shadow-xl shadow-secondary/20"
          >
            {currentStep === 5 ? 'Complete' : 'Continue'}
            <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
