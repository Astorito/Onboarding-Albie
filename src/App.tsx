/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

const Icon = ({ name, className = '' }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const inputCls =
  'w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm';

const TextInput = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${inputCls} ${className}`} />
);

const SelectInput = ({
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`${inputCls} appearance-none ${className}`}>
    {children}
  </select>
);

const TextareaInput = ({
  rows = 3,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea rows={rows} {...props} className={`${inputCls} resize-none ${className}`} />
);

const FormField = ({
  label,
  required,
  className = '',
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="font-bold text-primary text-xs flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-on-surface-variant leading-relaxed">{hint}</p>}
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${
      checked ? 'bg-secondary' : 'bg-outline-variant'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
);

// ---------------------------------------------------------------------------
// Layout components
// ---------------------------------------------------------------------------

const Header = () => (
  <header className="fixed top-0 w-full bg-surface border-b border-outline-variant flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 z-50">
    <img
      src="https://albiebytag.com/wp-content/uploads/2024/09/Albie-logo.svg"
      alt="Albie by TAG"
      className="h-8 w-auto"
    />
    <div className="flex items-center gap-stack-md">
      <button className="flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full">
        <Icon name="help" />
      </button>
      <button className="flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full">
        <Icon name="account_circle" />
      </button>
    </div>
  </header>
);

const ProgressBar = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const percentage = Math.round((currentStep / (totalSteps - 1)) * 100);
  return (
    <div className="mb-2 w-full max-w-[600px] mx-auto">
      <div className="flex justify-between items-end mb-2">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[10px]">
          Step {currentStep} of {totalSteps - 1}
        </span>
        <span className="font-label-md text-label-md text-primary font-bold text-[10px]">
          {percentage}% Complete
        </span>
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

const ConfigSection = ({
  title,
  description,
  children,
  icon = 'info',
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: string;
}) => (
  <div className="w-full bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
    <div className="w-full md:w-1/3 bg-surface-container-low/20 p-6 border-b md:border-b-0 md:border-r border-outline-variant flex flex-col gap-4">
      <div className="flex items-start gap-3 text-primary">
        <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0" />
        <div>
          <h3 className="font-bold text-base leading-tight mb-1">{title}</h3>
          <p className="text-on-surface-variant text-xs leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="mt-auto hidden md:block">
        <Icon name={icon} className="text-3xl text-primary/10" />
      </div>
    </div>
    <div className="w-full md:w-2/3 p-6 bg-white">
      {children}
    </div>
  </div>
);

// Reusable card list + add-new pattern for modules with multiple entries
const ItemCard = ({
  icon,
  title,
  subtitle,
  onEdit,
  onDelete,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) => (
  <div className="bg-white border border-outline-variant rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
        <Icon name={icon} className="text-secondary text-xl" />
      </div>
      <div>
        <p className="font-bold text-primary text-sm">{title}</p>
        <p className="text-[11px] text-on-surface-variant">{subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-1">
      {onEdit && (
        <button onClick={onEdit} className="p-2 text-primary/30 hover:text-primary transition-colors cursor-pointer">
          <Icon name="edit" className="text-sm" />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} className="p-2 text-primary/30 hover:text-red-500 transition-colors cursor-pointer">
          <Icon name="delete" className="text-sm" />
        </button>
      )}
    </div>
  </div>
);

const AddItemButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-4 border-2 border-dashed border-outline-variant rounded-2xl text-primary/40 hover:text-primary hover:border-primary font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
  >
    <Icon name="add_circle" className="text-xl" />
    {label}
  </button>
);

const FormActions = ({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: () => void;
}) => (
  <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-outline-variant/50">
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-2.5 border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer"
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onSave}
      className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
    >
      Save
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Module definitions
// ---------------------------------------------------------------------------

export const ALL_MODULES = [
  {
    id: 'general',
    title: 'General Information',
    icon: 'apartment',
    description: 'Property details, contact info, and locale settings.',
  },
  {
    id: 'brand',
    title: 'Website & Brand',
    icon: 'palette',
    description: 'Visual identity, colors, fonts, logo, and favicon.',
  },
  {
    id: 'dns',
    title: 'DNS & Tracking',
    icon: 'dns',
    description: 'Subdomain, Google Analytics, Tag Manager, and Maps.',
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policies',
    icon: 'gavel',
    description: 'Define refund windows, penalties, and conditions.',
  },
  {
    id: 'rooms',
    title: 'Room Information',
    icon: 'bed',
    description: 'Room types, beds, images, and facilities.',
  },
  {
    id: 'occupancy',
    title: 'Room Occupancy',
    icon: 'group',
    description: 'Capacity limits for adults, children, and total guests.',
  },
  {
    id: 'experiences',
    title: 'Experiences',
    icon: 'local_activity',
    description: 'Activities, tours, and curated offerings.',
  },
  {
    id: 'addons',
    title: 'Add-ons & Extras',
    icon: 'add_shopping_cart',
    description: 'Extra services: early check-in, transfers, parking, and more.',
  },
  {
    id: 'rates',
    title: 'Rates & Packages',
    icon: 'sell',
    description: 'Rate groups, pricing rules, and promotional packages.',
  },
  {
    id: 'taxes',
    title: 'Taxes & Fees',
    icon: 'payments',
    description: 'Tax types, charge settings, and fee structures.',
  },
];

const DEFAULT_ENABLED = ['general', 'brand', 'cancellation', 'rooms', 'occupancy', 'addons', 'rates', 'taxes'];

// ---------------------------------------------------------------------------
// Intro screens (new flow)
// ---------------------------------------------------------------------------

// All fields that the AI can pre-fill from a hotel website
export interface PrefillData {
  propertyName:      string | null;
  description:       string | null;
  address:           string | null;
  city:              string | null;
  stateProvince:     string | null;
  country:           string | null;
  zipCode:           string | null;
  timezone:          string | null;  // IANA id  e.g. "Europe/Madrid"
  currency:          string | null;  // ISO 4217  e.g. "EUR"
  language:          string | null;  // BCP 47    e.g. "es"
  phone:             string | null;
  notificationEmail: string | null;
  websiteUrl:        string | null;
  siteTitle:         string | null;
}

// Demo data shown in the URLAnalysisStep preview card (not used as fallback)
const MOCK_PREFILL: PrefillData = {
  propertyName:      'The Grand Pavilion Hotel',
  description:       'A luxury boutique hotel in the heart of the city, offering world-class amenities and personalised service.',
  address:           'Bredgade 34',
  city:              'Copenhagen',
  stateProvince:     'Capital Region',
  country:           'Denmark',
  zipCode:           '1260',
  timezone:          'Europe/Copenhagen',
  currency:          'DKK',
  language:          'da',
  phone:             '+45 33 00 00 00',
  notificationEmail: 'reservations@grandpavilion.com',
  websiteUrl:        'https://www.grandpavilion.com',
  siteTitle:         'The Grand Pavilion Hotel',
};

// Step 1 – Property Type
const PropertyTypeStep = ({ onSelect }: { onSelect: (type: 'independent' | 'group') => void }) => (
  <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop">
    <div className="w-full max-w-container-max-width grid md:grid-cols-12 gap-gutter items-center">

      {/* Left: heading */}
      <div className="md:col-span-5 flex flex-col gap-4 py-4">
        <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit text-xs font-bold tracking-wider uppercase">
          Step 1 of 2
        </span>
        <h2 className="font-display-lg text-4xl lg:text-5xl text-primary font-bold leading-tight">
          What type of property are you?
        </h2>
        <p className="font-body-md text-on-surface-variant max-w-sm leading-relaxed">
          Select the option that best describes your accommodation setup to personalise your onboarding.
        </p>
      </div>

      {/* Right: cards */}
      <div className="md:col-span-7 grid sm:grid-cols-2 gap-5">
        {/* Independent */}
        <button
          onClick={() => onSelect('independent')}
          className="group relative flex flex-col p-8 bg-white border-2 border-outline-variant rounded-3xl hover:border-secondary transition-all duration-200 shadow-sm hover:shadow-xl active:scale-[0.98] text-left cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 rounded-3xl transition-colors duration-200" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
              <Icon name="hotel" className="text-3xl text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Independent</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed flex-1">
              A single property with its own identity, operating on its own.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-primary font-bold text-sm group-hover:gap-3 transition-all duration-200">
              Select <Icon name="arrow_forward" className="text-base" />
            </div>
          </div>
        </button>

        {/* Group */}
        <button
          onClick={() => onSelect('group')}
          className="group relative flex flex-col p-8 bg-white border-2 border-outline-variant rounded-3xl hover:border-secondary transition-all duration-200 shadow-sm hover:shadow-xl active:scale-[0.98] text-left cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 rounded-3xl transition-colors duration-200" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
              <Icon name="domain" className="text-3xl text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Group</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed flex-1">
              Multiple properties managed together under a single group account.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-primary font-bold text-sm group-hover:gap-3 transition-all duration-200">
              Select <Icon name="arrow_forward" className="text-base" />
            </div>
          </div>
        </button>
      </div>

    </div>
  </main>
);

// Step 2 – URL Analysis
const URLAnalysisStep = ({
  onComplete,
  onSkip,
}: {
  onComplete: (data: PrefillData) => void;
  onSkip: () => void;
}) => {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [foundName, setFoundName] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setApiError(null);
    try {
      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setFoundName(data.propertyName ?? url);
      setDone(true);
      onComplete(data as PrefillData);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop">
      <div className="w-full max-w-container-max-width grid md:grid-cols-12 gap-gutter items-center">

        {/* Left: content */}
        <div className="md:col-span-6 flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-3">
            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit text-xs font-bold tracking-wider uppercase">
              Step 2 of 2
            </span>
            <h2 className="font-display-lg text-4xl lg:text-5xl text-primary font-bold leading-tight">
              Let Albie read<br />your website
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-md leading-relaxed">
              Paste your property's URL and Albie will automatically extract and pre-fill your onboarding details — saving you time.
            </p>
          </div>

          {/* Input + button */}
          <div className="flex gap-3">
            <TextInput
              type="url"
              placeholder="https://www.yourhotel.com"
              value={url}
              onChange={(e) => setUrl((e.target as HTMLInputElement).value)}
              onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleAnalyze()}
              className={`flex-1 ${done ? 'border-secondary bg-secondary-container/30' : ''}`}
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !url.trim() || done}
              className={`shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                done
                  ? 'bg-secondary text-on-secondary cursor-default'
                  : analyzing
                  ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                  : 'bg-primary text-on-primary hover:opacity-90 active:scale-95 shadow-md shadow-primary/20'
              }`}
            >
              {done ? (
                <><Icon name="check" className="text-base" /> Done</>
              ) : analyzing ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Icon name="sync" className="text-base" />
                  </motion.div>
                  Analyzing…
                </>
              ) : (
                <><Icon name="auto_awesome" className="text-base" /> Analyze</>
              )}
            </button>
          </div>

          {/* Status: analyzing */}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-2xl"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                <Icon name="travel_explore" className="text-secondary text-2xl" />
              </motion.div>
              <div>
                <p className="font-bold text-primary text-sm">Reading your website…</p>
                <p className="text-on-surface-variant text-xs">Extracting property details, contact info, and description.</p>
              </div>
            </motion.div>
          )}

          {/* Status: done */}
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-secondary-container border border-secondary/30 rounded-2xl"
            >
              <Icon name="check_circle" className="text-secondary text-2xl shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-primary text-sm">Data extracted successfully</p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  We found <strong>{foundName}</strong>. Your fields have been pre-filled — review and edit them as needed.
                </p>
              </div>
            </motion.div>
          )}

          {/* Status: error */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
            >
              <Icon name="error" className="text-red-500 text-2xl shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700 text-sm">Could not analyze the URL</p>
                <p className="text-red-600 text-xs mt-0.5">{apiError}</p>
              </div>
            </motion.div>
          )}

          {/* Skip */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSkip}
              className="font-bold text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group"
            >
              Skip for now
              <Icon name="arrow_forward" className="text-sm group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-outline-variant text-xs">— you can fill in the details manually</span>
          </div>
        </div>

        {/* Right: visual card */}
        <div className="md:col-span-6 hidden md:flex flex-col gap-4">
          <div className="bg-secondary-container rounded-3xl p-8 flex flex-col gap-5 shadow-inner">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Icon name="auto_awesome" className="text-on-primary text-xl" />
              </div>
              <div>
                <p className="font-bold text-primary text-sm">AI-powered extraction</p>
                <p className="text-on-surface-variant text-xs">Fields pre-filled from your site</p>
              </div>
            </div>
            {[
              { label: 'Property Name', value: 'The Grand Pavilion Hotel', icon: 'apartment' },
              { label: 'City', value: 'Copenhagen, Denmark', icon: 'location_on' },
              { label: 'Phone', value: '+45 33 00 00 00', icon: 'call' },
              { label: 'Email', value: 'reservations@grandpavilion.com', icon: 'mail' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 bg-white/60 rounded-xl px-4 py-3 border border-white/80">
                <Icon name={row.icon} className="text-primary/50 text-base shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{row.label}</p>
                  <p className="text-primary text-sm font-semibold truncate">{row.value}</p>
                </div>
                <Icon name="check_circle" className="text-secondary text-base ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
};

// Step 2 (Group only) – Group Members
const GroupMembersStep = ({
  members,
  setMembers,
  onContinue,
}: {
  members: { id: number; name: string; url: string }[];
  setMembers: React.Dispatch<React.SetStateAction<{ id: number; name: string; url: string }[]>>;
  onContinue: () => void;
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const addMember = () => {
    if (!name.trim()) return;
    setMembers((prev) => [...prev, { id: Date.now(), name: name.trim(), url: url.trim() }]);
    setName('');
    setUrl('');
    setShowWarning(false);
  };

  return (
    <main className="h-full flex flex-col items-center justify-center px-margin-mobile py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
              <Icon name="domain" className="text-secondary text-xl" />
            </div>
            <h2 className="font-display-lg text-2xl md:text-3xl text-primary font-bold">Group Properties</h2>
          </div>
          <p className="text-on-surface-variant text-sm">
            Add the independent properties that belong to this group. You can always add more later.
          </p>
        </div>

        {/* Member list */}
        <div className="space-y-3 mb-5">
          {members.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-outline-variant rounded-2xl text-on-surface-variant text-sm">
              No properties added yet. Add at least one below.
            </div>
          )}
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-4 p-4 bg-white border border-outline-variant rounded-2xl shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <Icon name="hotel" className="text-secondary text-lg" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-bold text-primary text-sm">{m.name}</p>
                {m.url && <p className="text-[11px] text-on-surface-variant truncate">{m.url}</p>}
              </div>
              <button
                onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))}
                className="p-2 text-primary/30 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Icon name="delete" className="text-sm" />
              </button>
            </div>
          ))}
        </div>

        {/* Add form */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-3">
          <p className="font-bold text-primary text-xs uppercase tracking-wider">Add a property</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Property Name" required>
              <TextInput
                placeholder="Hotel Montserrat"
                value={name}
                onChange={(e) => setName((e.target as HTMLInputElement).value)}
              />
            </FormField>
            <FormField label="Website URL">
              <TextInput
                type="url"
                placeholder="https://www.hotelmontserrat.com"
                value={url}
                onChange={(e) => setUrl((e.target as HTMLInputElement).value)}
              />
            </FormField>
          </div>
          <button
            onClick={addMember}
            disabled={!name.trim()}
            className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="add_circle" className="text-base" />
            Add Property
          </button>
        </div>

        {showWarning && (
          <p className="mt-3 text-xs text-amber-600 font-bold flex items-center gap-1">
            <Icon name="warning" className="text-base" />
            Please add at least one property before continuing.
          </p>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => {
              if (members.length === 0) { setShowWarning(true); return; }
              onContinue();
            }}
            className="group flex items-center gap-2 bg-secondary text-on-secondary rounded-xl px-10 py-4 font-bold hover:opacity-95 transition-all active:scale-95 duration-200 cursor-pointer shadow-xl shadow-secondary/20"
          >
            Continue
            <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </main>
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
          <h1 className="font-display-lg text-4xl lg:text-6xl text-primary leading-tight">
            Welcome to Albie
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-lg">
            Let's set up your booking engine to start receiving reservations. Our architectural
            onboarding ensures precision in every detail of your operations.
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

const SuccessStep = () => {
  useEffect(() => {
    const end = Date.now() + 3 * 1000;
    const colors = ['#5b6300', '#dfec60', '#00191a'];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <div className="h-full flex items-center justify-center px-margin-mobile bg-surface">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-3xl w-full text-center bg-white border border-outline-variant p-10 md:p-16 rounded-[40px] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-bl-full -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary-container mb-8 shadow-inner">
            <Icon name="celebration" className="text-[56px] text-secondary" />
          </div>
          <h1 className="font-display-lg text-5xl text-primary mb-4">Congratulations!</h1>
          <p className="font-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto">
            Your onboarding process has begun. Our team is already working on your personalized
            booking engine setup.
          </p>
          <div className="p-8 bg-surface-container-low border border-outline-variant rounded-3xl inline-block w-full text-left relative group">
            <Icon name="mail" className="absolute right-8 top-8 text-primary/5 text-6xl group-hover:scale-110 transition-transform duration-500" />
            <p className="font-bold text-primary uppercase text-xs tracking-widest mb-3">
              Support Channel
            </p>
            <p className="font-body-md text-on-surface mb-2">
              If you have any questions or need to make immediate adjustments, please reach out:
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

// ---------------------------------------------------------------------------
// Module step components
// ---------------------------------------------------------------------------

// 1 – General Information
const GeneralInformationStep = ({ prefill = {} }: { prefill?: Partial<PrefillData> }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">General Information</h1>
      <p className="text-on-surface-variant text-xs">
        Core property details, contact info, and locale settings.
      </p>
    </div>
    <ConfigSection
      title="Property Details"
      description="Provide general information, contact details, and regional preferences for your property."
      icon="apartment"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <FormField label="Property Name" required className="col-span-2">
          <TextInput placeholder="The Grand Pavilion Hotel" defaultValue={prefill.propertyName ?? ''} key={prefill.propertyName} />
        </FormField>

        <FormField label="Property Description" required className="col-span-2">
          <TextareaInput rows={3} placeholder="A brief description of your property..." defaultValue={prefill.description ?? ''} key={prefill.description} />
        </FormField>

        <FormField label="Address" required className="col-span-2">
          <TextInput placeholder="Bredgade 34" defaultValue={prefill.address ?? ''} key={prefill.address} />
        </FormField>

        <FormField label="City" required>
          <TextInput placeholder="Copenhagen" defaultValue={prefill.city ?? ''} key={prefill.city} />
        </FormField>

        <FormField label="State / Province" required>
          <TextInput placeholder="Capital Region" defaultValue={prefill.stateProvince ?? ''} key={prefill.stateProvince} />
        </FormField>

        <FormField label="Country" required>
          <SelectInput defaultValue={prefill.country ?? ''} key={prefill.country}>
            <option value="">Select Country</option>
            <option value="Argentina">Argentina</option>
            <option value="Australia">Australia</option>
            <option value="Austria">Austria</option>
            <option value="Belgium">Belgium</option>
            <option value="Brazil">Brazil</option>
            <option value="Canada">Canada</option>
            <option value="Chile">Chile</option>
            <option value="Colombia">Colombia</option>
            <option value="Denmark">Denmark</option>
            <option value="Finland">Finland</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Greece">Greece</option>
            <option value="Ireland">Ireland</option>
            <option value="Italy">Italy</option>
            <option value="Japan">Japan</option>
            <option value="Mexico">Mexico</option>
            <option value="Netherlands">Netherlands</option>
            <option value="New Zealand">New Zealand</option>
            <option value="Norway">Norway</option>
            <option value="Peru">Peru</option>
            <option value="Poland">Poland</option>
            <option value="Portugal">Portugal</option>
            <option value="Singapore">Singapore</option>
            <option value="South Africa">South Africa</option>
            <option value="Spain">Spain</option>
            <option value="Sweden">Sweden</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Turkey">Turkey</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United States">United States</option>
            <option value="Uruguay">Uruguay</option>
          </SelectInput>
        </FormField>

        <FormField label="ZIP / Postal Code" required>
          <TextInput placeholder="1260" defaultValue={prefill.zipCode ?? ''} key={prefill.zipCode} />
        </FormField>

        <FormField label="Timezone" required>
          <SelectInput defaultValue={prefill.timezone ?? ''} key={prefill.timezone}>
            <option value="">Select Timezone</option>
            <option value="Pacific/Honolulu">UTC−10 – Hawaii Time</option>
            <option value="America/Anchorage">UTC−9 – Alaska Time</option>
            <option value="America/Los_Angeles">UTC−8 – Pacific Time (US)</option>
            <option value="America/Denver">UTC−7 – Mountain Time (US)</option>
            <option value="America/Chicago">UTC−6 – Central Time (US)</option>
            <option value="America/New_York">UTC−5 – Eastern Time (US)</option>
            <option value="America/Santiago">UTC−4 – Chile Standard Time</option>
            <option value="America/Argentina/Buenos_Aires">UTC−3 – Argentina Time</option>
            <option value="America/Sao_Paulo">UTC−3 – Brasilia Time</option>
            <option value="Atlantic/Azores">UTC−1 – Azores Time</option>
            <option value="Europe/London">UTC±0 – Greenwich Mean Time</option>
            <option value="Europe/Lisbon">UTC±0 – Western European Time</option>
            <option value="Europe/Paris">UTC+1 – Central European Time</option>
            <option value="Europe/Copenhagen">UTC+1 – Central European Time (DK)</option>
            <option value="Europe/Madrid">UTC+1 – Central European Time (ES)</option>
            <option value="Europe/Berlin">UTC+1 – Central European Time (DE)</option>
            <option value="Europe/Rome">UTC+1 – Central European Time (IT)</option>
            <option value="Europe/Amsterdam">UTC+1 – Central European Time (NL)</option>
            <option value="Europe/Stockholm">UTC+1 – Central European Time (SE)</option>
            <option value="Europe/Oslo">UTC+1 – Central European Time (NO)</option>
            <option value="Europe/Zurich">UTC+1 – Central European Time (CH)</option>
            <option value="Europe/Athens">UTC+2 – Eastern European Time (GR)</option>
            <option value="Europe/Helsinki">UTC+2 – Eastern European Time (FI)</option>
            <option value="Europe/Istanbul">UTC+3 – Turkey Time</option>
            <option value="Asia/Dubai">UTC+4 – Gulf Standard Time</option>
            <option value="Asia/Kolkata">UTC+5:30 – India Standard Time</option>
            <option value="Asia/Singapore">UTC+8 – Singapore Time</option>
            <option value="Asia/Tokyo">UTC+9 – Japan Standard Time</option>
            <option value="Australia/Sydney">UTC+10 – Australian Eastern Time</option>
            <option value="Pacific/Auckland">UTC+12 – New Zealand Time</option>
          </SelectInput>
        </FormField>

        <FormField label="Currency" required>
          <SelectInput defaultValue={prefill.currency ?? ''} key={prefill.currency}>
            <option value="">Select Currency</option>
            <option value="AED">AED – UAE Dirham (د.إ)</option>
            <option value="ARS">ARS – Argentine Peso ($)</option>
            <option value="AUD">AUD – Australian Dollar ($)</option>
            <option value="BRL">BRL – Brazilian Real (R$)</option>
            <option value="CAD">CAD – Canadian Dollar ($)</option>
            <option value="CHF">CHF – Swiss Franc (Fr)</option>
            <option value="CLP">CLP – Chilean Peso ($)</option>
            <option value="COP">COP – Colombian Peso ($)</option>
            <option value="DKK">DKK – Danish Krone (kr)</option>
            <option value="EUR">EUR – Euro (€)</option>
            <option value="GBP">GBP – British Pound (£)</option>
            <option value="JPY">JPY – Japanese Yen (¥)</option>
            <option value="MXN">MXN – Mexican Peso ($)</option>
            <option value="NOK">NOK – Norwegian Krone (kr)</option>
            <option value="NZD">NZD – New Zealand Dollar ($)</option>
            <option value="PEN">PEN – Peruvian Sol (S/)</option>
            <option value="PLN">PLN – Polish Złoty (zł)</option>
            <option value="SEK">SEK – Swedish Krona (kr)</option>
            <option value="SGD">SGD – Singapore Dollar ($)</option>
            <option value="TRY">TRY – Turkish Lira (₺)</option>
            <option value="USD">USD – US Dollar ($)</option>
            <option value="UYU">UYU – Uruguayan Peso ($U)</option>
            <option value="ZAR">ZAR – South African Rand (R)</option>
          </SelectInput>
        </FormField>

        <FormField label="Language" required>
          <SelectInput defaultValue={prefill.language ?? ''} key={prefill.language}>
            <option value="">Select Language</option>
            <option value="ar">Arabic (العربية)</option>
            <option value="da">Danish (Dansk)</option>
            <option value="nl">Dutch (Nederlands)</option>
            <option value="en">English</option>
            <option value="fi">Finnish (Suomi)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="el">Greek (Ελληνικά)</option>
            <option value="it">Italian (Italiano)</option>
            <option value="ja">Japanese (日本語)</option>
            <option value="no">Norwegian (Norsk)</option>
            <option value="pl">Polish (Polski)</option>
            <option value="pt">Portuguese (Português)</option>
            <option value="ru">Russian (Русский)</option>
            <option value="es">Spanish (Español)</option>
            <option value="sv">Swedish (Svenska)</option>
            <option value="tr">Turkish (Türkçe)</option>
            <option value="zh">Chinese (中文)</option>
          </SelectInput>
        </FormField>

        <FormField label="Date Format" required>
          <SelectInput>
            <option value="">Select Format</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </SelectInput>
        </FormField>

        <FormField label="Phone Number" required>
          <TextInput type="tel" placeholder="+45 000 000 000" defaultValue={prefill.phone ?? ''} key={prefill.phone} />
        </FormField>

        <FormField label="Notification Email" required>
          <TextInput type="email" placeholder="reservations@yourhotel.com" defaultValue={prefill.notificationEmail ?? ''} key={prefill.notificationEmail} />
        </FormField>

        <FormField label="Website URL" required className="col-span-2">
          <TextInput type="url" placeholder="https://www.yourhotel.com" defaultValue={prefill.websiteUrl ?? ''} key={prefill.websiteUrl} />
        </FormField>

        <FormField label="Property Terms & Conditions" required className="col-span-2">
          <TextareaInput
            rows={4}
            placeholder="Enter your property's full terms and conditions..."
          />
        </FormField>
      </div>
    </ConfigSection>
  </div>
);

// 2 – Website & Brand Customization
const WebsiteBrandStep = ({ prefill = {} }: { prefill?: Partial<PrefillData> }) => {
  const fonts = [
    'Hanken Grotesk',
    'Inter',
    'Playfair Display',
    'Montserrat',
    'Lato',
    'Georgia',
    'DM Sans',
    'Plus Jakarta Sans',
  ];
  const buttonStyles = ['Rounded (lg)', 'Pill (full)', 'Square', 'Outlined'];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Website & Brand</h1>
        <p className="text-on-surface-variant text-xs">
          Define the visual identity for your guest-facing booking engine.
        </p>
      </div>
      <ConfigSection
        title="Brand Identity"
        description="Upload your logo, set brand colors, and choose typography for the booking experience."
        icon="palette"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Site Title" required className="col-span-2">
            <TextInput
              placeholder="The Grand Pavilion – Official Booking"
              defaultValue={prefill.siteTitle ?? ''}
              key={prefill.siteTitle}
            />
          </FormField>

          <FormField label="Primary Color" required>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue="#5b6300"
                className="h-10 w-12 rounded-lg border border-outline-variant cursor-pointer p-0.5 shrink-0"
              />
              <TextInput placeholder="#5b6300" />
            </div>
          </FormField>

          <FormField label="Secondary Color" required>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue="#dfec60"
                className="h-10 w-12 rounded-lg border border-outline-variant cursor-pointer p-0.5 shrink-0"
              />
              <TextInput placeholder="#dfec60" />
            </div>
          </FormField>

          <FormField label="Accent Color" required>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue="#00191a"
                className="h-10 w-12 rounded-lg border border-outline-variant cursor-pointer p-0.5 shrink-0"
              />
              <TextInput placeholder="#00191a" />
            </div>
          </FormField>

          <FormField label="Font Family" required>
            <SelectInput>
              {fonts.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Button Style">
            <SelectInput>
              {buttonStyles.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Logo Upload" required>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors group">
              <Icon name="upload" className="text-2xl text-primary/40 group-hover:text-primary mb-1" />
              <span className="text-xs text-on-surface-variant font-bold">Click to upload</span>
              <span className="text-[10px] text-on-surface-variant">SVG, PNG or JPG (max 2MB)</span>
              <input type="file" className="hidden" accept=".svg,.png,.jpg,.jpeg" />
            </label>
          </FormField>

          <FormField label="Favicon Upload" required>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors group">
              <Icon name="upload" className="text-2xl text-primary/40 group-hover:text-primary mb-1" />
              <span className="text-xs text-on-surface-variant font-bold">Click to upload</span>
              <span className="text-[10px] text-on-surface-variant">ICO or PNG 32×32px</span>
              <input type="file" className="hidden" accept=".ico,.png" />
            </label>
          </FormField>
        </div>
      </ConfigSection>
    </div>
  );
};

// 3 – DNS & Tracking
const DnsTrackingStep = () => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">DNS & Tracking</h1>
      <p className="text-on-surface-variant text-xs">
        Configure your subdomain and connect analytics integrations.
      </p>
    </div>
    <ConfigSection
      title="Domain & Analytics"
      description="Set your booking engine subdomain and connect third-party tracking tools."
      icon="dns"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <FormField label="Subdomain Name" required className="col-span-2">
          <div className="flex items-center">
            <TextInput placeholder="reservations" className="rounded-r-none border-r-0" />
            <span className="px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-r-lg text-sm font-bold text-on-surface-variant whitespace-nowrap">
              .albie.com
            </span>
          </div>
        </FormField>

        <FormField label="Google Tag Manager ID">
          <TextInput placeholder="GTM-XXXXXXX" />
        </FormField>

        <FormField label="Google Analytics 4 Measurement ID">
          <TextInput placeholder="G-XXXXXXXXXX" />
        </FormField>

        <FormField label="Google Map ID" className="col-span-2">
          <TextInput placeholder="Enter your Google Maps API key or Map ID" />
        </FormField>

        <div className="col-span-2 mt-2 p-4 bg-secondary-container/30 rounded-xl flex items-start gap-3">
          <Icon name="info" className="text-secondary text-lg shrink-0 mt-0.5" />
          <p className="text-xs text-on-surface-variant leading-relaxed">
            After saving, point your DNS CNAME record to{' '}
            <strong className="text-primary">booking.albie.com</strong>. Propagation may take up to
            48 hours.
          </p>
        </div>
      </div>
    </ConfigSection>
  </div>
);

// 4 – Cancellation Policies
const CancellationPoliciesStep = () => {
  const [policies, setPolicies] = useState([
    { id: 1, name: 'Flexible Policy', window: '24', penalty: 'No penalty', isDefault: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [penaltyType, setPenaltyType] = useState('No penalty');

  const savePolicy = () => {
    setPolicies((prev) => [
      ...prev,
      { id: Date.now(), name: 'New Policy', window: '48', penalty: penaltyType, isDefault: false },
    ]);
    setShowForm(false);
    setPenaltyType('No penalty');
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Cancellation Policies</h1>
        <p className="text-on-surface-variant text-xs">
          Define refund windows and penalty conditions for your reservations.
        </p>
      </div>

      {!showForm ? (
        <div className="space-y-3">
          {policies.map((p) => (
            <ItemCard
              key={p.id}
              icon="gavel"
              title={
                p.name + (p.isDefault ? ' · Default' : '')
              }
              subtitle={`Cancellation window: ${p.window}h · Penalty: ${p.penalty}`}
              onEdit={() => {}}
              onDelete={() => setPolicies((prev) => prev.filter((x) => x.id !== p.id))}
            />
          ))}
          <AddItemButton label="Add Cancellation Policy" onClick={() => setShowForm(true)} />
        </div>
      ) : (
        <ConfigSection
          title="New Policy"
          description="Define the conditions and penalty structure for this cancellation policy."
          icon="gavel"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Policy Name" required className="col-span-2">
              <TextInput placeholder="Flexible Policy" />
            </FormField>

            <FormField label="Policy Description" required className="col-span-2">
              <TextareaInput
                rows={3}
                placeholder={`e.g. Guests can cancel free of charge up to 24 hours before arrival.\nLate cancellations will incur a charge of the first night's stay.`}
              />
            </FormField>

            <FormField label="Cancellation Window" required>
              <div className="flex items-center gap-2">
                <TextInput type="number" placeholder="24" className="flex-1" />
                <span className="text-sm text-on-surface-variant font-bold shrink-0">hours</span>
              </div>
            </FormField>

            <FormField label="Penalty Applied" required>
              <SelectInput
                value={penaltyType}
                onChange={(e) => setPenaltyType(e.target.value)}
              >
                <option>No penalty</option>
                <option>Value of First Night</option>
                <option>Percentage of Total</option>
                <option>Fixed Amount</option>
              </SelectInput>
            </FormField>

            {(penaltyType === 'Percentage of Total' || penaltyType === 'Fixed Amount') && (
              <FormField
                label={`Value ${penaltyType === 'Percentage of Total' ? '(%)' : '(Amount)'}`}
                required
              >
                <TextInput
                  type="number"
                  placeholder={penaltyType === 'Percentage of Total' ? '25' : '150.00'}
                />
              </FormField>
            )}

            <FormField label="Additional Notes" className="col-span-2">
              <TextareaInput
                rows={2}
                placeholder="Please include any special rules, exceptions, or additional cancellation conditions..."
              />
            </FormField>

            <FormActions onCancel={() => setShowForm(false)} onSave={savePolicy} />
          </div>
        </ConfigSection>
      )}
    </div>
  );
};

// 5 – Room Basic Information
const RoomInformationStep = () => {
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Standard King', type: 'Standard Room', bed: 'King', bedrooms: 1 },
  ]);
  const [showForm, setShowForm] = useState(true);
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
      { id: Date.now(), name: 'New Room', type: 'Standard Room', bed: 'Queen', bedrooms: 1 },
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
            <ItemCard
              key={r.id}
              icon="bed"
              title={r.name}
              subtitle={`${r.type} · ${r.bed} bed · ${r.bedrooms} bedroom(s)`}
              onEdit={() => {}}
              onDelete={() => setRooms((prev) => prev.filter((x) => x.id !== r.id))}
            />
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

// 6 – Room Occupancy & Capacity
const RoomOccupancyStep = () => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Room Occupancy & Capacity</h1>
      <p className="text-on-surface-variant text-xs">
        Set occupancy limits for adults, children, and total guests per room.
      </p>
    </div>
    <ConfigSection
      title="Capacity Settings"
      description="Define the minimum and maximum occupancy rules that apply across your room inventory."
      icon="group"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <FormField label="Minimum Adults" required>
          <TextInput type="number" min={1} placeholder="1" />
        </FormField>

        <FormField label="Maximum Adults" required>
          <TextInput type="number" min={1} placeholder="2" />
        </FormField>

        <FormField label="Maximum Total Occupants" required>
          <TextInput type="number" min={1} placeholder="3" />
        </FormField>

        <FormField label="Children Capacity" required>
          <TextInput type="number" min={0} placeholder="1" />
        </FormField>

        <FormField
          label="Included Occupancy"
          className="col-span-2"
          hint="Number of guests included in the base rate without additional charges."
        >
          <TextInput type="number" min={1} placeholder="2" />
        </FormField>
      </div>
    </ConfigSection>
  </div>
);

// 7 – Experiences
const ExperiencesStep = () => {
  const [experiences, setExperiences] = useState([
    { id: 1, group: 'Wellness', description: 'Spa & Relaxation Package' },
  ]);
  const [showForm, setShowForm] = useState(false);

  const saveExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { id: Date.now(), group: 'New Group', description: 'New Experience' },
    ]);
    setShowForm(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Experiences</h1>
        <p className="text-on-surface-variant text-xs">
          Add activities, tours, and curated experiences for your guests.
        </p>
      </div>

      {!showForm ? (
        <div className="space-y-3">
          {experiences.map((e) => (
            <ItemCard
              key={e.id}
              icon="local_activity"
              title={e.description}
              subtitle={`Group: ${e.group}`}
              onEdit={() => {}}
              onDelete={() => setExperiences((prev) => prev.filter((x) => x.id !== e.id))}
            />
          ))}
          <AddItemButton label="Add Experience" onClick={() => setShowForm(true)} />
        </div>
      ) : (
        <ConfigSection
          title="New Experience"
          description="Add details about this activity or experience for your guests."
          icon="local_activity"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Experience Group">
              <TextInput placeholder="Wellness, Adventure, Dining..." />
            </FormField>

            <FormField label="Availability">
              <SelectInput>
                <option>Daily</option>
                <option>Weekdays Only</option>
                <option>Weekends Only</option>
                <option>On Request</option>
                <option>Seasonal</option>
              </SelectInput>
            </FormField>

            <FormField label="Description" className="col-span-2">
              <TextareaInput rows={3} placeholder="Describe this experience..." />
            </FormField>

            <FormField label="Terms & Conditions" className="col-span-2">
              <TextareaInput rows={2} placeholder="Cancellation terms, age restrictions, etc." />
            </FormField>

            <FormField label="Max Attendees">
              <TextInput type="number" min={1} placeholder="10" />
            </FormField>

            <FormField label="Price per Person">
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-surface-container-low border border-outline-variant border-r-0 rounded-l-lg text-sm font-bold text-on-surface-variant">
                  €
                </span>
                <TextInput type="number" placeholder="75.00" className="rounded-l-none border-l-0" />
              </div>
            </FormField>

            <FormField label="Set Max Quantity" className="col-span-2">
              <TextInput type="number" min={1} placeholder="5" />
            </FormField>

            <FormActions onCancel={() => setShowForm(false)} onSave={saveExperience} />
          </div>
        </ConfigSection>
      )}
    </div>
  );
};

// 8 – Add-ons & Extra Services
type AddonConfig = { enabled: boolean; price: string };

const AddOnsStep = () => {
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

// 9 – Rates & Packages
const RatesPackagesStep = () => {
  const [activeTab, setActiveTab] = useState('create');

  const tabs = [
    { id: 'create', label: 'Create Rate', icon: 'add_circle' },
    { id: 'visibility', label: 'Visibility', icon: 'visibility' },
    { id: 'descriptions', label: 'Descriptions', icon: 'description' },
    { id: 'images', label: 'Images', icon: 'image' },
    { id: 'tags', label: 'Tags & Messages', icon: 'label' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Rates & Packages</h1>
        <p className="text-on-surface-variant text-xs">
          Configure pricing rules, rate groups, and promotional packages.
        </p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-white border border-outline-variant text-on-surface-variant hover:border-primary'
            }`}
          >
            <Icon name={t.icon} className="text-sm" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Rate Group" required>
              <SelectInput>
                <option value="">Select or create group</option>
                <option>Leisure</option>
                <option>Business</option>
                <option>Corporate</option>
                <option>Promotions</option>
              </SelectInput>
            </FormField>

            <FormField label="Parent Rate">
              <SelectInput>
                <option>None (standalone rate)</option>
                <option>Best Available Rate</option>
              </SelectInput>
            </FormField>

            <FormField label="Linked Rates" className="col-span-2">
              <TextInput placeholder="Search and link existing rates..." />
            </FormField>

            <FormField label="Attach Add-Ons to Rate" className="col-span-2">
              <TextInput placeholder="Search add-ons to attach to this rate..." />
            </FormField>

            <FormField label="Experiences" className="col-span-2">
              <TextInput placeholder="Search experiences to include in this rate..." />
            </FormField>

            <div className="col-span-2 p-4 bg-secondary-container/30 rounded-xl flex items-start gap-3">
              <Icon name="auto_awesome" className="text-secondary text-lg shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-primary text-xs mb-1">Package Builder</p>
                <p className="text-[11px] text-on-surface-variant">
                  Combine a base rate with add-ons and experiences to create a promotional package
                  with a bundled price.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visibility' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Status" required>
              <SelectInput>
                <option>Active</option>
                <option>Inactive</option>
                <option>Draft</option>
              </SelectInput>
            </FormField>

            <FormField label="Order Index">
              <TextInput type="number" placeholder="1" />
            </FormField>

            <FormField label="Availability From" required>
              <TextInput type="date" />
            </FormField>

            <FormField label="Availability To" required>
              <TextInput type="date" />
            </FormField>
          </div>
        )}

        {activeTab === 'descriptions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Rate Code" required>
              <TextInput placeholder="BAR-2025" />
            </FormField>

            <FormField label="Assign Rate Group" required>
              <SelectInput>
                <option value="">Select group</option>
                <option>Leisure</option>
                <option>Business</option>
                <option>Promotions</option>
              </SelectInput>
            </FormField>

            <FormField label="Short Title" required>
              <TextInput placeholder="Best Available Rate" />
            </FormField>

            <FormField label="Long Title" required>
              <TextInput placeholder="Best Available Rate – Flexible Booking" />
            </FormField>

            <FormField label="Rate Description" required className="col-span-2">
              <TextareaInput rows={3} placeholder="Describe what this rate includes..." />
            </FormField>

            <FormField label="Terms & Conditions" className="col-span-2">
              <TextareaInput rows={3} placeholder="Conditions, restrictions, and legal notes..." />
            </FormField>
          </div>
        )}

        {activeTab === 'images' && (
          <FormField label="Rate Images">
            <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors group">
              <Icon name="add_photo_alternate" className="text-4xl text-primary/40 group-hover:text-primary mb-2" />
              <span className="text-sm text-on-surface-variant font-bold">Upload Rate Images</span>
              <span className="text-xs text-on-surface-variant">JPG, PNG up to 5MB each</span>
              <input type="file" className="hidden" accept="image/*" multiple />
            </label>
          </FormField>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-4">
            <FormField label="Tags">
              <TextInput placeholder="e.g. summer, promotion, non-refundable..." />
              <p className="text-[10px] text-on-surface-variant mt-1">
                Add existing or custom tags separated by commas.
              </p>
            </FormField>
            <FormField label="Sales Messages">
              <TextareaInput
                rows={3}
                placeholder='Create a promotional message, e.g. "Book now and save 20%!"'
              />
            </FormField>
          </div>
        )}
      </div>
    </div>
  );
};

// 10 – Taxes & Fees
const TaxesFeesStep = () => {
  const [taxes, setTaxes] = useState([
    { id: 1, name: 'VAT', type: 'Value Added Tax (VAT)', chargeType: 'Percentage', value: '21' },
  ]);
  const [showForm, setShowForm] = useState(true);
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
            <ItemCard
              key={t.id}
              icon="payments"
              title={t.name}
              subtitle={`${t.type} · ${t.chargeType} ${t.value}${t.chargeType === 'Percentage' ? '%' : ''}`}
              onEdit={() => {}}
              onDelete={() => setTaxes((prev) => prev.filter((x) => x.id !== t.id))}
            />
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

// ---------------------------------------------------------------------------
// Review Step – dynamic, based on active modules
// ---------------------------------------------------------------------------

const ReviewStep = ({
  clientModules,
  onEdit,
  verified,
  onToggleVerify,
}: {
  clientModules: string[];
  onEdit: (moduleId: string) => void;
  verified: Set<string>;
  onToggleVerify: (id: string) => void;
}) => {
  const activeModules = ALL_MODULES.filter((m) => clientModules.includes(m.id));
  const allVerified = activeModules.every((m) => verified.has(m.id));

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-6 shrink-0 flex items-end justify-between">
        <div>
          <h1 className="font-display-lg text-xl text-primary font-bold">Review Configuration</h1>
          <p className="text-on-surface-variant text-xs">
            Click the checkmark on each module to confirm it's ready.
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          allVerified
            ? 'bg-green-100 text-green-700'
            : 'bg-surface-container-highest text-on-surface-variant'
        }`}>
          {verified.size} / {activeModules.length} verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-28">
        {activeModules.map((m) => {
          const isVerified = verified.has(m.id);
          return (
            <div
              key={m.id}
              className={`bg-white border-2 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all duration-300 ${
                isVerified ? 'border-green-400' : 'border-outline-variant'
              }`}
            >
              <div className="bg-surface-container-low/30 px-5 py-4 border-b border-outline-variant flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Icon name={m.icon} className="text-primary text-lg" />
                  <h2 className="font-bold text-primary text-xs uppercase tracking-wider">
                    {m.title}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(m.id)}
                    className="text-[10px] font-bold text-primary underline underline-offset-4 hover:text-secondary transition-colors cursor-pointer"
                  >
                    EDIT
                  </button>
                  {/* Verify checkmark button */}
                  <button
                    onClick={() => onToggleVerify(m.id)}
                    title={isVerified ? 'Mark as unverified' : 'Mark as verified'}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      isVerified
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-outline-variant text-transparent hover:border-primary'
                    }`}
                  >
                    <Icon name="check" className="text-sm" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex-grow flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isVerified ? 'bg-green-100' : 'bg-surface-container-low'
                }`}>
                  <Icon name={isVerified ? 'check_circle' : m.icon} className={`text-base ${isVerified ? 'text-green-500' : 'text-primary/30'}`} />
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{m.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Root App
// ---------------------------------------------------------------------------

export default function App() {
  // Property type selection
  const [propertyType, setPropertyType] = useState<'independent' | 'group' | null>(null);
  // Group member properties
  const [groupMembers, setGroupMembers] = useState<{ id: number; name: string; url: string }[]>([]);
  // AI-pre-filled data from URL analysis
  const [prefillData, setPrefillData] = useState<Partial<PrefillData>>({});
  // Review step verification
  const [verifiedModules, setVerifiedModules] = useState<Set<string>>(new Set());
  const [showVerifyWarning, setShowVerifyWarning] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  // Step encoding:
  //   0              → WelcomeStep
  //   1              → PropertyTypeStep
  //   2              → URLAnalysisStep
  //   3 (group only) → GroupMembersStep
  //   firstModule…   → Module steps (DEFAULT_ENABLED)
  //   reviewStep     → ReviewStep
  //   successStep    → SuccessStep
  const groupOffset = propertyType === 'group' ? 1 : 0;
  const firstModule = 3 + groupOffset;       // 3 (independent) or 4 (group)
  const reviewStep  = firstModule + DEFAULT_ENABLED.length;
  const successStep = reviewStep + 1;

  // Module components (inside App so `general` can close over prefillData)
  const moduleComponents: Record<string, React.ReactNode> = {
    general: <GeneralInformationStep prefill={prefillData} />,
    brand: <WebsiteBrandStep prefill={prefillData} />,
    dns: <DnsTrackingStep />,
    cancellation: <CancellationPoliciesStep />,
    rooms: <RoomInformationStep />,
    occupancy: <RoomOccupancyStep />,
    experiences: <ExperiencesStep />,
    addons: <AddOnsStep />,
    rates: <RatesPackagesStep />,
    taxes: <TaxesFeesStep />,
  };

  const goNext = () => { window.scrollTo(0, 0); setCurrentStep((s) => s + 1); };
  const goBack = () => { window.scrollTo(0, 0); setCurrentStep((s) => s - 1); };

  const handleNext = () => {
    if (currentStep === reviewStep) {
      if (verifiedModules.size < DEFAULT_ENABLED.length) {
        setShowVerifyWarning(true);
        return;
      }
    }
    if (currentStep < successStep) goNext();
  };

  const handleToggleVerify = (id: string) => {
    setVerifiedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleEditModule = (moduleId: string) => {
    const idx = DEFAULT_ENABLED.indexOf(moduleId);
    if (idx !== -1) setCurrentStep(firstModule + idx);
  };

  const isModuleStep = currentStep >= firstModule && currentStep < reviewStep;
  // Show floating nav buttons from the first module step through review
  const isNavigable  = currentStep >= firstModule && currentStep < successStep;
  const currentModuleId = isModuleStep ? DEFAULT_ENABLED[currentStep - firstModule] : null;

  // ProgressBar: 1-indexed from first module to review (= DEFAULT_ENABLED.length+1)
  const progressCurrent = isModuleStep
    ? currentStep - firstModule + 1
    : DEFAULT_ENABLED.length + 1;
  const progressTotal = DEFAULT_ENABLED.length + 2; // gives 100% at review

  return (
    <div className="h-screen overflow-hidden bg-background text-on-background font-hanken antialiased flex flex-col">
      {/* Small back button for intro steps 1–(firstModule-1) */}
      {currentStep >= 1 && currentStep < firstModule && (
        <button
          onClick={goBack}
          className="fixed top-6 left-6 z-50 p-3 flex items-center justify-center text-primary hover:bg-surface-container-low transition-all rounded-full opacity-40 hover:opacity-100 cursor-pointer shadow-sm hover:shadow-md bg-white/50 backdrop-blur-sm"
        >
          <Icon name="arrow_back" className="text-2xl" />
        </button>
      )}

      <div className="flex-grow flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">

          {/* Step 0 – Welcome */}
          {currentStep === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full"
            >
              <WelcomeStep onNext={goNext} />
            </motion.div>
          )}

          {/* Step 1 – Property Type */}
          {currentStep === 1 && (
            <motion.div
              key="property-type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <PropertyTypeStep
                onSelect={(type) => { setPropertyType(type); goNext(); }}
              />
            </motion.div>
          )}

          {/* Step 2 – URL Analysis */}
          {currentStep === 2 && (
            <motion.div
              key="url-analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <URLAnalysisStep
                onComplete={(data) => { setPrefillData(data); goNext(); }}
                onSkip={goNext}
              />
            </motion.div>
          )}

          {/* Step 3 – Group Members (group path only) */}
          {currentStep === 3 && propertyType === 'group' && (
            <motion.div
              key="group-members"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              <GroupMembersStep
                members={groupMembers}
                setMembers={setGroupMembers}
                onContinue={goNext}
              />
            </motion.div>
          )}

          {/* Module steps + Review */}
          {currentStep >= firstModule && currentStep < successStep && (
            <motion.div
              key="stepper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow overflow-y-auto custom-scrollbar"
            >
              {/* Progress bar — sticky at top */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-6 pb-3 px-margin-mobile md:px-margin-desktop">
                <ProgressBar currentStep={progressCurrent} totalSteps={progressTotal} />
              </div>

              {/* Content — scrolls freely, padding-bottom for nav buttons */}
              <div className="px-margin-mobile md:px-margin-desktop pb-28">
                <AnimatePresence mode="wait">
                  {isModuleStep && currentModuleId && (
                    <motion.div
                      key={`module-${currentModuleId}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {moduleComponents[currentModuleId]}
                    </motion.div>
                  )}

                  {currentStep === reviewStep && (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ReviewStep
                        clientModules={DEFAULT_ENABLED}
                        onEdit={handleEditModule}
                        verified={verifiedModules}
                        onToggleVerify={handleToggleVerify}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {currentStep === successStep && (
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

      {/* Verify warning modal */}
      {showVerifyWarning && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <Icon name="warning" className="text-amber-500 text-xl" />
              </div>
              <h2 className="font-bold text-primary text-lg leading-tight">Verification required</h2>
            </div>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              You must verify all modules by clicking the checkmark before continuing.
            </p>
            <button
              onClick={() => setShowVerifyWarning(false)}
              className="w-full bg-primary text-on-primary rounded-xl py-3 font-bold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}

      {/* Floating navigation (Back / Continue) */}
      {isNavigable && (
        <div className="contents">
          <button
            onClick={goBack}
            className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 group flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-primary text-primary rounded-xl px-6 py-3 font-bold hover:bg-surface-container-low transition-all active:scale-95 duration-200 cursor-pointer shadow-lg"
          >
            <Icon name="arrow_back" className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group flex items-center gap-2 bg-secondary text-on-secondary rounded-xl px-10 py-4 font-bold hover:opacity-95 transition-all active:scale-95 duration-200 cursor-pointer shadow-xl shadow-secondary/20"
          >
            {currentStep === reviewStep ? 'Complete' : 'Continue'}
            <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
