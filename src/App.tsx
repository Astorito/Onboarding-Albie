/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Icon } from './components/ui/primitives';
import { ProgressBar } from './components/ui/layout';

import { WelcomeStep } from './steps/intro/WelcomeStep';
import { PropertyTypeStep } from './steps/intro/PropertyTypeStep';
import { URLAnalysisStep } from './steps/intro/URLAnalysisStep';
import { GroupMembersStep } from './steps/intro/GroupMembersStep';

import { GeneralInformationStep } from './steps/modules/GeneralInformationStep';
import { WebsiteBrandStep } from './steps/modules/WebsiteBrandStep';
import { DnsTrackingStep } from './steps/modules/DnsTrackingStep';
import { CancellationPoliciesStep, CancellationPolicy } from './steps/modules/CancellationPoliciesStep';
import { RoomInformationStep, RoomItem } from './steps/modules/RoomInformationStep';
import { ExperiencesStep } from './steps/modules/ExperiencesStep';
import { AddOnsStep, AddonConfig } from './steps/modules/AddOnsStep';
import { RatesPackagesStep, RatesData } from './steps/modules/RatesPackagesStep';
import { TaxesFeesStep, TaxItem } from './steps/modules/TaxesFeesStep';

import { ReviewStep } from './steps/ReviewStep';
import { SuccessStep } from './steps/SuccessStep';

import { PrefillData, GroupMember } from './types';
import { DEFAULT_ENABLED } from './constants';

// ─── Default add-ons list ─────────────────────────────────────────────────────
const DEFAULT_ADDONS: Record<string, AddonConfig> = {
  'Early Check-In':      { enabled: true,  price: '30' },
  'Late Check-Out':      { enabled: true,  price: '30' },
  'Airport Transfer':    { enabled: false, price: '' },
  'Breakfast Upgrade':   { enabled: true,  price: '25' },
  'Parking':             { enabled: false, price: '' },
  'Pet Fee':             { enabled: false, price: '' },
  'Extra Child':         { enabled: true,  price: '20' },
  'Infant Crib':         { enabled: false, price: '' },
  'Extra Bed':           { enabled: false, price: '' },
  'Babysitting Service': { enabled: false, price: '' },
};

const DEFAULT_POLICIES: CancellationPolicy[] = [
  {
    id: 1,
    name: 'Flexible Policy',
    description: 'Guests can cancel free of charge up to 24 hours before arrival.',
    window: '24',
    penaltyType: 'No penalty',
    penaltyValue: '',
    notes: '',
    isDefault: true,
  },
];

const DEFAULT_TAXES: TaxItem[] = [
  {
    id: 1,
    name: 'VAT',
    type: 'Value Added Tax (VAT)',
    description: '',
    chargeType: 'Percentage',
    value: '21',
    quantifier: 'Per booking',
  },
];

export default function App() {
  // ── Session ID — magic link token takes priority, then localStorage, then new ─
  const [sessionId] = useState(() => {
    const STORAGE_KEY = 'albie_session_id';
    // ?token=xyz in URL → magic link sent by sales team
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      localStorage.setItem(STORAGE_KEY, urlToken);
      // Clean the token from the URL bar (no reload, just cosmetic)
      const clean = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', clean);
      return urlToken;
    }
    // Returning visitor — reuse their stored session
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    // First-time visitor without a magic link
    const newId = `albie_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  });

  // ── Auto-save indicator ───────────────────────────────────────────────────
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Intro state ───────────────────────────────────────────────────────────
  const [propertyType, setPropertyType] = useState<'independent' | 'group' | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [prefillData, setPrefillData] = useState<Partial<PrefillData>>({});

  // ── Lifted module state (persists across step navigation) ─────────────────
  const [cancellationPolicies, setCancellationPolicies] = useState<CancellationPolicy[]>(DEFAULT_POLICIES);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [addons, setAddons] = useState<Record<string, AddonConfig>>(DEFAULT_ADDONS);
  const [rates, setRates] = useState<RatesData>({});
  const [taxes, setTaxes] = useState<TaxItem[]>(DEFAULT_TAXES);

  // ── Saved simple-form data (collected via FormData on navigation) ─────────
  const [savedForms, setSavedForms] = useState<Record<string, Record<string, string>>>({});

  // ── Review & submit state ─────────────────────────────────────────────────
  const [verifiedModules, setVerifiedModules] = useState<Set<string>>(new Set());
  const [showVerifyWarning, setShowVerifyWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);

  // ── Step index arithmetic ─────────────────────────────────────────────────
  const groupOffset = propertyType === 'group' ? 1 : 0;
  const firstModule = 3 + groupOffset;
  const reviewStep  = firstModule + DEFAULT_ENABLED.length;
  const successStep = reviewStep + 1;

  const isModuleStep = currentStep >= firstModule && currentStep < reviewStep;
  const isNavigable  = currentStep >= firstModule && currentStep < successStep;
  const currentModuleId = isModuleStep ? DEFAULT_ENABLED[currentStep - firstModule] : null;

  const progressCurrent = isModuleStep
    ? currentStep - firstModule + 1
    : DEFAULT_ENABLED.length + 1;
  const progressTotal = DEFAULT_ENABLED.length + 2;

  // ── Collect current uncontrolled form's data before navigating away ───────
  const collectCurrentForm = () => {
    if (!isModuleStep || !currentModuleId) return;
    const formEl = document.getElementById(`form-${currentModuleId}`) as HTMLFormElement | null;
    if (!formEl) return;
    const fd = new FormData(formEl);
    const data: Record<string, string> = {};
    fd.forEach((val, key) => { data[key] = val as string; });
    setSavedForms((prev) => ({ ...prev, [currentModuleId]: data }));
  };

  const goNext = () => {
    // Collect the current form's data synchronously so we can pass it to the save
    // (can't rely on setSavedForms having flushed yet)
    let freshForms = savedForms;
    if (isModuleStep && currentModuleId) {
      const formEl = document.getElementById(`form-${currentModuleId}`) as HTMLFormElement | null;
      if (formEl) {
        const fd = new FormData(formEl);
        const data: Record<string, string> = {};
        fd.forEach((val, key) => { data[key] = val as string; });
        freshForms = { ...savedForms, [currentModuleId]: data };
        setSavedForms(freshForms);
      }
    }
    window.scrollTo(0, 0);
    setCurrentStep((s) => s + 1);
    // Fire-and-forget save with the freshest data
    if (propertyType) saveInBackground(buildPayload(freshForms));
  };
  const goBack = () => { window.scrollTo(0, 0); setCurrentStep((s) => s - 1); };

  // ── Build full submit payload ─────────────────────────────────────────────
  const buildPayload = (
    extraForms?: Record<string, Record<string, string>>,
    overrides?: { propertyType?: 'independent' | 'group' },
  ) => {
    const forms = extraForms ?? savedForms;
    const g = forms.general ?? {};
    const b = forms.brand   ?? {};
    const d = forms.dns     ?? {};
    const pt = overrides?.propertyType ?? propertyType ?? 'independent';

    return {
      sessionId,
      propertyType: pt,
      general: {
        propertyName:      g.propertyName      || prefillData.propertyName      || '',
        description:       g.description       || prefillData.description       || '',
        address:           g.address           || prefillData.address           || '',
        city:              g.city              || prefillData.city              || '',
        stateProvince:     g.stateProvince     || prefillData.stateProvince     || '',
        country:           g.country           || prefillData.country           || '',
        zipCode:           g.zipCode           || prefillData.zipCode           || '',
        timezone:          g.timezone          || prefillData.timezone          || '',
        currency:          g.currency          || prefillData.currency          || '',
        language:          g.language          || prefillData.language          || '',
        phone:             g.phone             || prefillData.phone             || '',
        notificationEmail: g.notificationEmail || prefillData.notificationEmail || '',
        websiteUrl:        g.websiteUrl        || prefillData.websiteUrl        || '',
      },
      brand: {
        siteTitle:      b.siteTitle      || prefillData.siteTitle || '',
        primaryColor:   b.primaryColor   || '',
        secondaryColor: b.secondaryColor || '',
        accentColor:    b.accentColor    || '',
        fontFamily:     b.fontFamily     || '',
        buttonStyle:    b.buttonStyle    || '',
        logoUrl:        b.logoUrl        || '',
        faviconUrl:     b.faviconUrl     || '',
      },
      dns: {
        subdomain: d.subdomain || '',
        gtmId:     d.gtmId     || '',
        ga4Id:     d.ga4Id     || '',
        mapId:     d.mapId     || '',
      },
      cancellationPolicies,
      rooms,
      addons,
      rates,
      taxes,
      groupMembers,
    };
  };

  // ── Background auto-save (fire-and-forget, shows subtle indicator) ───────
  const saveInBackground = useCallback((payload: ReturnType<typeof buildPayload>) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        setSaveStatus(data.success ? 'saved' : 'error');
      })
      .catch(() => setSaveStatus('error'))
      .finally(() => {
        // Reset to idle after 2 seconds
        saveTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
      });
  }, []);

  // ── Submit to Google Sheets + trigger PDF email ──────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const finalPayload = buildPayload();
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');

      // Fire-and-forget — email failure shouldn't block the success state
      fetch('/api/send-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      }).catch((e) => console.warn('[send-onboarding] failed:', e));

      window.scrollTo(0, 0);
      setCurrentStep(successStep);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === reviewStep) {
      if (verifiedModules.size < DEFAULT_ENABLED.length) {
        setShowVerifyWarning(true);
        return;
      }
      handleSubmit();
      return;
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

  // ── Module component map ──────────────────────────────────────────────────
  const moduleComponents: Record<string, ReactNode> = {
    general:      <GeneralInformationStep prefill={prefillData} />,
    brand:        <WebsiteBrandStep prefill={prefillData} />,
    dns:          <DnsTrackingStep />,
    cancellation: <CancellationPoliciesStep policies={cancellationPolicies} setPolicies={setCancellationPolicies} />,
    rooms:        <RoomInformationStep rooms={rooms} setRooms={setRooms} />,
    experiences:  <ExperiencesStep />,
    addons:       <AddOnsStep addons={addons} setAddons={setAddons} />,
    rates:        <RatesPackagesStep rates={rates} setRates={setRates} rooms={rooms} />,
    taxes:        <TaxesFeesStep taxes={taxes} setTaxes={setTaxes} />,
  };

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
            <motion.div key="welcome" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="h-full">
              <WelcomeStep onNext={goNext} />
            </motion.div>
          )}

          {/* Step 1 – Property Type */}
          {currentStep === 1 && (
            <motion.div key="property-type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <PropertyTypeStep onSelect={(type) => {
                setPropertyType(type);
                goNext();
                // Save immediately — creates the Sheets row before any form is filled
                saveInBackground(buildPayload(undefined, { propertyType: type }));
              }} />
            </motion.div>
          )}

          {/* Step 2 – URL Analysis */}
          {currentStep === 2 && (
            <motion.div key="url-analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <URLAnalysisStep onComplete={(data) => { setPrefillData(data); goNext(); }} onSkip={goNext} />
            </motion.div>
          )}

          {/* Step 3 – Group Members (group path only) */}
          {currentStep === 3 && propertyType === 'group' && (
            <motion.div key="group-members" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full overflow-y-auto custom-scrollbar">
              <GroupMembersStep members={groupMembers} setMembers={setGroupMembers} onContinue={goNext} />
            </motion.div>
          )}

          {/* Module steps + Review */}
          {currentStep >= firstModule && currentStep < successStep && (
            <motion.div key="stepper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow overflow-y-auto custom-scrollbar">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-4 pb-3 px-margin-mobile md:px-margin-desktop">
                <div className="flex items-center mb-3">
                  <img
                    src="/albie-logo-dark.svg"
                    alt="Albie by TAG"
                    className="h-8 w-auto"
                  />
                </div>
                <ProgressBar currentStep={progressCurrent} totalSteps={progressTotal} />
              </div>

              <div className="px-margin-mobile md:px-margin-desktop pb-28">
                <AnimatePresence mode="wait">
                  {isModuleStep && currentModuleId && (
                    <motion.div key={`module-${currentModuleId}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      {moduleComponents[currentModuleId]}
                    </motion.div>
                  )}

                  {currentStep === reviewStep && (
                    <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <ReviewStep
                        clientModules={DEFAULT_ENABLED}
                        onEdit={handleEditModule}
                        verified={verifiedModules}
                        onToggleVerify={handleToggleVerify}
                        reviewData={{
                          general: savedForms.general ?? {},
                          brand:   savedForms.brand   ?? {},
                          dns:     savedForms.dns     ?? {},
                          cancellationPolicies,
                          rooms,
                          addons,
                          rates,
                          taxes,
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {currentStep === successStep && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full"
              onAnimationStart={() => localStorage.removeItem('albie_session_id')}
            >
              <SuccessStep />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Verify warning modal */}
      {showVerifyWarning && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <Icon name="warning" className="text-amber-500 text-xl" />
              </div>
              <h2 className="font-bold text-primary text-lg leading-tight">Verification required</h2>
            </div>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              You must verify all modules by clicking the checkmark before continuing.
            </p>
            <button onClick={() => setShowVerifyWarning(false)} className="w-full bg-primary text-on-primary rounded-xl py-3 font-bold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer">
              Got it
            </button>
          </motion.div>
        </div>
      )}

      {/* Auto-save status indicator */}
      {saveStatus !== 'idle' && (
        <div className={`fixed top-4 right-4 z-[90] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all ${
          saveStatus === 'saving' ? 'bg-white border border-outline-variant text-on-surface-variant' :
          saveStatus === 'saved'  ? 'bg-green-50 border border-green-200 text-green-700' :
                                    'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {saveStatus === 'saving' && (
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {saveStatus === 'saved'  && <Icon name="check_circle" className="text-sm" />}
          {saveStatus === 'error'  && <Icon name="error" className="text-sm" />}
          {saveStatus === 'saving' ? 'Guardando…' : saveStatus === 'saved' ? 'Guardado' : 'Error al guardar'}
        </div>
      )}

      {/* Submit error toast */}
      {submitError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl text-sm font-bold flex items-center gap-2 max-w-md">
          <Icon name="error" className="text-lg shrink-0" />
          <span className="truncate">{submitError}</span>
          <button onClick={() => setSubmitError(null)} className="ml-2 opacity-70 hover:opacity-100 shrink-0">✕</button>
        </div>
      )}

      {/* Floating navigation */}
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
            disabled={isSubmitting}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group flex items-center gap-2 bg-secondary text-on-secondary rounded-xl px-10 py-4 font-bold hover:opacity-95 transition-all active:scale-95 duration-200 cursor-pointer shadow-xl shadow-secondary/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving…
              </>
            ) : currentStep === reviewStep ? (
              <>
                Complete
                <Icon name="check_circle" className="group-hover:scale-110 transition-transform" />
              </>
            ) : (
              <>
                Continue
                <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
