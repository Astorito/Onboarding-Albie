/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Icon } from './components/ui/primitives';
import { ProgressBar } from './components/ui/layout';

import { WelcomeStep } from './steps/intro/WelcomeStep';
import { PropertyTypeStep } from './steps/intro/PropertyTypeStep';
import { GroupMembersStep } from './steps/intro/GroupMembersStep';

import { GeneralInformationStep } from './steps/modules/GeneralInformationStep';
import { WebsiteBrandStep } from './steps/modules/WebsiteBrandStep';
import { DnsTrackingStep } from './steps/modules/DnsTrackingStep';
import { CancellationPoliciesStep, CancellationPolicy, CancellationPoliciesStepHandle } from './steps/modules/CancellationPoliciesStep';
import { RoomInformationStep, RoomItem, RoomInformationStepHandle } from './steps/modules/RoomInformationStep';
import { ExperiencesStep } from './steps/modules/ExperiencesStep';
import { AddOnsStep, AddonConfig } from './steps/modules/AddOnsStep';
import { RatesPackagesStep, RatesData } from './steps/modules/RatesPackagesStep';
import { TaxesFeesStep, TaxItem, TaxesFeesStepHandle } from './steps/modules/TaxesFeesStep';

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
  // ── Session ID resolution ──────────────────────────────────────────────────
  // Three ways a visitor arrives, in priority order:
  //   1. /o/<slug>       readable link (preferred). The slug is an ALIAS; the real
  //                      Session ID is unknown until we resolve it server-side, so
  //                      sessionId starts null and is set by the load effect below.
  //   2. ?token=<id>     legacy magic link — the token IS the Session ID.
  //   3. neither         returning visitor reuses their stored id, or a new one.
  // The old behaviour stripped the URL to "/" (losing the token if copied from the
  // address bar → the source of the "wrong onboarding opens" bug). We now keep a
  // readable /o/<slug> in the address bar instead (set once we know the slug).
  const STORAGE_KEY = 'albie_session_id';
  const slugMatch = window.location.pathname.match(/^\/o\/(.+)$/);
  const initialSlug = slugMatch ? decodeURIComponent(slugMatch[1]) : null;

  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (initialSlug) return null; // resolved async via /api/session?slug=
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      localStorage.setItem(STORAGE_KEY, urlToken);
      return urlToken;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
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
  // Name the admin assigned to this onboarding (shown on the welcome slide).
  const [onboardingName, setOnboardingName] = useState<string | null>(null);

  // ── Load server-side session data (admin pre-fill) ────────────────────────
  // Fires once on mount. Resolves the row by slug (readable link) or by token
  // (legacy link / stored id), loads any admin-filled data, learns the real
  // Session ID (needed to save), and puts a readable /o/<slug> in the address bar.
  useEffect(() => {
    // In slug mode sessionId is still null here — query by slug. Otherwise query
    // by the known token. A brand-new anonymous visitor (no slug, has a fresh id)
    // will just 404 and keep local defaults.
    const query = initialSlug
      ? `slug=${encodeURIComponent(initialSlug)}`
      : sessionId
        ? `token=${encodeURIComponent(sessionId)}`
        : null;
    if (!query) return;

    fetch(`/api/session?${query}`)
      .then(r => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        // Learn the real Session ID (essential when we arrived via ?slug=) and
        // persist it so saves target the right row.
        if (data.sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem(STORAGE_KEY, data.sessionId);
        }
        // Show a readable, shareable URL — and keep the token out of the bar.
        if (data.slug) {
          window.history.replaceState(null, '', `/o/${data.slug}`);
        }
        setOnboardingName(data.onboardingName ?? null);
        const g = data.general ?? {};
        const b = data.brand   ?? {};
        const d = data.dns     ?? {};

        setPrefillData({
          propertyName:      g.propertyName      || null,
          description:       g.description       || null,
          address:           g.address           || null,
          city:              g.city              || null,
          stateProvince:     g.stateProvince     || null,
          country:           g.country           || null,
          zipCode:           g.zipCode           || null,
          timezone:          g.timezone          || null,
          currency:          g.currency          || null,
          language:          g.language          || null,
          phone:             g.phone             || null,
          notificationEmail: g.notificationEmail || null,
          websiteUrl:        g.websiteUrl        || null,
          siteTitle:         b.siteTitle         || null,
        });

        // Pre-populate savedForms so buildPayload returns correct data
        // even before the hotel visits each step.
        const formsUpdate: Record<string, Record<string, string>> = {};
        if (Object.values(g).some(Boolean)) {
          formsUpdate.general = {
            propertyName:      g.propertyName      || '',
            description:       g.description       || '',
            address:           g.address           || '',
            city:              g.city              || '',
            stateProvince:     g.stateProvince     || '',
            country:           g.country           || '',
            zipCode:           g.zipCode           || '',
            timezone:          g.timezone          || '',
            currency:          g.currency          || '',
            language:          g.language          || '',
            phone:             g.phone             || '',
            notificationEmail: g.notificationEmail || '',
            websiteUrl:        g.websiteUrl        || '',
          };
        }
        if (Object.values(b).some(Boolean)) {
          formsUpdate.brand = {
            siteTitle:      b.siteTitle      || '',
            primaryColor:   b.primaryColor   || '',
            secondaryColor: b.secondaryColor || '',
            accentColor:    b.accentColor    || '',
            fontFamily:     b.fontFamily     || '',
            buttonStyle:    b.buttonStyle    || '',
            logoUrl:        b.logoUrl        || '',
            faviconUrl:     b.faviconUrl     || '',
          };
        }
        if (Object.values(d).some(Boolean)) {
          formsUpdate.dns = {
            subdomain: d.subdomain || '',
            gtmId:     d.gtmId     || '',
            ga4Id:     d.ga4Id     || '',
            mapId:     d.mapId     || '',
          };
        }
        if (Object.keys(formsUpdate).length) {
          setSavedForms(prev => ({ ...prev, ...formsUpdate }));
        }

        // Load complex state (rooms, policies, addons, rates, taxes)
        if (data.rooms?.length)                setRooms(data.rooms);
        if (data.cancellationPolicies?.length) setCancellationPolicies(data.cancellationPolicies);
        if (data.addons && Object.keys(data.addons).length) setAddons(data.addons);
        if (data.rates  && Object.keys(data.rates).length)  setRates(data.rates);
        if (data.taxes?.length)                setTaxes(data.taxes);
      })
      .catch(() => {});
  // Runs once on mount. Intentionally NOT keyed on sessionId: in slug mode we set
  // sessionId inside this effect, and we don't want a second run to re-apply the
  // prefill over any edits the user may have started.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Lifted module state (persists across step navigation) ─────────────────
  const [cancellationPolicies, setCancellationPolicies] = useState<CancellationPolicy[]>(DEFAULT_POLICIES);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [addons, setAddons] = useState<Record<string, AddonConfig>>(DEFAULT_ADDONS);
  const [rates, setRates] = useState<RatesData>({});
  const [taxes, setTaxes] = useState<TaxItem[]>(DEFAULT_TAXES);

  // Refs into the card-based steps (open form + internal Save button, distinct
  // from the global Continue button). Used to auto-commit an in-progress,
  // unsaved entry when the user navigates forward without clicking that
  // internal Save button — otherwise the entry is silently discarded.
  const roomsStepRef = useRef<RoomInformationStepHandle>(null);
  const cancellationStepRef = useRef<CancellationPoliciesStepHandle>(null);
  const taxesStepRef = useRef<TaxesFeesStepHandle>(null);

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
  const firstModule = 2 + groupOffset;
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
  // Returns the fresh savedForms (state update is async, so callers that need
  // the latest data immediately use the return value).
  const collectCurrentForm = (base = savedForms) => {
    if (!isModuleStep || !currentModuleId) return base;
    const formEl = document.getElementById(`form-${currentModuleId}`) as HTMLFormElement | null;
    if (!formEl) return base;
    const fd = new FormData(formEl);
    const data: Record<string, string> = {};
    fd.forEach((val, key) => { data[key] = val as string; });
    const next = { ...base, [currentModuleId]: data };
    setSavedForms(next);
    return next;
  };

  const goNext = () => {
    // Collect the current form's data synchronously so we can pass it to the save
    // (can't rely on setSavedForms having flushed yet)
    const freshForms = collectCurrentForm();
    // Auto-commit an open, unsaved entry in card-based steps (Rooms,
    // Cancellation, Taxes) — otherwise clicking this global Continue button
    // (instead of the step's own internal Save button) silently discards it.
    // Only one of these refs is ever mounted at a time; the rest resolve to null.
    const freshRooms      = roomsStepRef.current?.commitPending()       ?? rooms;
    const freshPolicies   = cancellationStepRef.current?.commitPending() ?? cancellationPolicies;
    const freshTaxes      = taxesStepRef.current?.commitPending()       ?? taxes;
    window.scrollTo(0, 0);
    setCurrentStep((s) => s + 1);
    // Fire-and-forget save with the freshest data
    if (propertyType) {
      saveInBackground(buildPayload(freshForms, undefined, {
        rooms: freshRooms,
        cancellationPolicies: freshPolicies,
        taxes: freshTaxes,
      }));
    }
  };
  const goBack = () => {
    // Persist the current form before leaving so the data survives the round-trip
    collectCurrentForm();
    window.scrollTo(0, 0);
    setCurrentStep((s) => s - 1);
  };

  // ── Build full submit payload ─────────────────────────────────────────────
  const buildPayload = (
    extraForms?: Record<string, Record<string, string>>,
    overrides?: { propertyType?: 'independent' | 'group' },
    stateOverrides?: {
      rooms?: RoomItem[];
      cancellationPolicies?: CancellationPolicy[];
      taxes?: TaxItem[];
    },
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
      cancellationPolicies: stateOverrides?.cancellationPolicies ?? cancellationPolicies,
      rooms: stateOverrides?.rooms ?? rooms,
      addons,
      rates,
      taxes: stateOverrides?.taxes ?? taxes,
      groupMembers,
    };
  };

  // ── Background auto-save (fire-and-forget, shows subtle indicator) ───────
  const saveInBackground = useCallback((payload: ReturnType<typeof buildPayload>) => {
    // Don't save until the real Session ID is known (slug still resolving) —
    // otherwise we'd POST with a null key and risk creating a junk row.
    if (!payload.sessionId) return;
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
    const finalPayload = buildPayload();
    // Guard: never submit before the Session ID is resolved (slug mode).
    if (!finalPayload.sessionId) {
      setSubmitError('Cargando la sesión, esperá un segundo e intentá de nuevo.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
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
  // Merge server prefill with anything the user already typed (savedForms wins),
  // so uncontrolled steps repopulate when navigating back to them.
  const moduleComponents: Record<string, ReactNode> = {
    general:      <GeneralInformationStep prefill={{ ...prefillData, ...savedForms.general }} />,
    brand:        <WebsiteBrandStep prefill={{ ...prefillData, ...savedForms.brand }} />,
    dns:          <DnsTrackingStep prefill={savedForms.dns ?? {}} />,
    cancellation: <CancellationPoliciesStep ref={cancellationStepRef} policies={cancellationPolicies} setPolicies={setCancellationPolicies} />,
    rooms:        <RoomInformationStep ref={roomsStepRef} rooms={rooms} setRooms={setRooms} />,
    experiences:  <ExperiencesStep />,
    addons:       <AddOnsStep addons={addons} setAddons={setAddons} />,
    rates:        <RatesPackagesStep rates={rates} setRates={setRates} rooms={rooms} />,
    taxes:        <TaxesFeesStep ref={taxesStepRef} taxes={taxes} setTaxes={setTaxes} />,
  };

  return (
    <div className="h-screen overflow-hidden bg-background text-on-background font-hanken antialiased flex flex-col">
      {/* Small back button for intro steps 1–(firstModule-1) */}
      {currentStep >= 1 && currentStep < firstModule && (
        <button
          onClick={goBack}
          className="fixed top-20 left-6 z-50 p-3 flex items-center justify-center text-primary hover:bg-surface-container-low transition-all rounded-full opacity-40 hover:opacity-100 cursor-pointer shadow-sm hover:shadow-md bg-white/50 backdrop-blur-sm"
        >
          <Icon name="arrow_back" className="text-2xl" />
        </button>
      )}

      <div className="flex-grow flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">

          {/* Step 0 – Welcome */}
          {currentStep === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="h-full">
              <WelcomeStep onNext={goNext} propertyName={onboardingName} />
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

          {/* Step 2 – Group Members (group path only) */}
          {currentStep === 2 && propertyType === 'group' && (
            <motion.div key="group-members" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full overflow-y-auto custom-scrollbar">
              <GroupMembersStep members={groupMembers} setMembers={setGroupMembers} onContinue={goNext} />
            </motion.div>
          )}

          {/* Module steps + Review */}
          {currentStep >= firstModule && currentStep < successStep && (
            <motion.div key="stepper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow overflow-y-auto custom-scrollbar">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-4 pb-3 px-margin-mobile md:px-margin-desktop">
                <div className="relative flex items-center">
                  <img
                    src="/albie-logo-dark.svg"
                    alt="Albie by TAG"
                    className="h-8 w-auto absolute left-0"
                  />
                  <ProgressBar currentStep={progressCurrent} totalSteps={progressTotal} />
                </div>
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
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group flex items-center gap-2 bg-secondary text-white rounded-xl px-10 py-4 font-bold hover:opacity-95 transition-all active:scale-95 duration-200 cursor-pointer shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
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
