/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Icon } from '../components/ui/primitives';
import { ProgressBar } from '../components/ui/layout';

import { MarketingWelcomeStep } from './MarketingWelcomeStep';
import { BusinessBasicsStep } from './BusinessBasicsStep';
import { AccountsAssetsStep } from './AccountsAssetsStep';
import { StrategyBudgetStep } from './StrategyBudgetStep';
import { MarketingReviewStep } from './MarketingReviewStep';
import { MarketingSuccessStep } from './MarketingSuccessStep';

import { DEFAULT_ENABLED } from './constants';

export default function MarketingApp() {
  // ── Session ID resolution — same pattern as src/App.tsx ────────────────────
  // /marketing/o/<slug> readable link (preferred, slug resolved async server-
  // side) or ?token=<id> legacy link, else a returning visitor's stored id.
  const STORAGE_KEY = 'albie_marketing_session_id';
  const slugMatch = window.location.pathname.match(/^\/marketing\/o\/(.+)$/);
  const initialSlug = slugMatch ? decodeURIComponent(slugMatch[1]) : null;

  // Present only when opened from an Engagement hub (multi-product link) —
  // shows a "back to hub" button on the success screen.
  const [engagementSlug] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('engagement'),
  );

  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (initialSlug) return null; // resolved async via /api/session?slug=
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      localStorage.setItem(STORAGE_KEY, urlToken);
      return urlToken;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const newId = `mktg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [savedForms, setSavedForms] = useState<Record<string, Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Load server-side session data ──────────────────────────────────────────
  useEffect(() => {
    const query = initialSlug
      ? `slug=${encodeURIComponent(initialSlug)}`
      : sessionId
        ? `token=${encodeURIComponent(sessionId)}`
        : null;
    if (!query) return;

    fetch(`/api/session?${query}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem(STORAGE_KEY, data.sessionId);
        }
        if (data.slug) {
          window.history.replaceState(null, '', `/marketing/o/${data.slug}`);
        }
        const update: Record<string, Record<string, string>> = {};
        if (data.basics && Object.values(data.basics).some(Boolean)) update.basics = data.basics;
        if (data.accounts && Object.values(data.accounts).some(Boolean)) update.accounts = data.accounts;
        if (data.strategy && Object.values(data.strategy).some(Boolean)) update.strategy = data.strategy;
        if (Object.keys(update).length) setSavedForms((prev) => ({ ...prev, ...update }));
      })
      .catch(() => {});
  // Runs once on mount — see the identical rationale in src/App.tsx.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstModule = 1;
  const reviewStep = firstModule + DEFAULT_ENABLED.length;
  const successStep = reviewStep + 1;

  const isModuleStep = currentStep >= firstModule && currentStep < reviewStep;
  const isNavigable = currentStep >= firstModule && currentStep < successStep;
  const currentModuleId = isModuleStep ? DEFAULT_ENABLED[currentStep - firstModule] : null;

  const progressCurrent = isModuleStep ? currentStep - firstModule + 1 : DEFAULT_ENABLED.length + 1;
  const progressTotal = DEFAULT_ENABLED.length + 2;

  // ── Collect current uncontrolled form's data before navigating away ───────
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

  const buildPayload = (forms = savedForms) => ({
    sessionId,
    basics: forms.basics ?? {},
    accounts: forms.accounts ?? {},
    strategy: forms.strategy ?? {},
  });

  const saveInBackground = (payload: ReturnType<typeof buildPayload>) => {
    // Don't save until the real Session ID is known (slug still resolving).
    if (!payload.sessionId) return;
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    fetch('/api/marketing-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => setSaveStatus(data.success ? 'saved' : 'error'))
      .catch(() => setSaveStatus('error'))
      .finally(() => {
        saveTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
      });
  };

  const goNext = () => {
    const freshForms = collectCurrentForm();
    window.scrollTo(0, 0);
    setCurrentStep((s) => s + 1);
    saveInBackground(buildPayload(freshForms));
  };
  const goBack = () => {
    collectCurrentForm();
    window.scrollTo(0, 0);
    setCurrentStep((s) => s - 1);
  };

  const handleNext = async () => {
    if (currentStep === reviewStep) {
      const finalPayload = buildPayload();
      if (!finalPayload.sessionId) {
        setSubmitError('Loading your session — wait a moment and try again.');
        return;
      }
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const res = await fetch('/api/marketing-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Submit failed');

        // Fire-and-forget — email failure shouldn't block the success state.
        fetch('/api/send-marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload),
        }).catch((e) => console.warn('[send-marketing] failed:', e));

        window.scrollTo(0, 0);
        setCurrentStep(successStep);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    if (currentStep < successStep) goNext();
  };

  const moduleComponents: Record<string, ReactNode> = {
    basics:   <BusinessBasicsStep prefill={savedForms.basics ?? {}} />,
    accounts: <AccountsAssetsStep prefill={savedForms.accounts ?? {}} />,
    strategy: <StrategyBudgetStep prefill={savedForms.strategy ?? {}} />,
  };

  return (
    <div className="marketing-theme h-screen overflow-hidden bg-background text-on-background font-hanken antialiased flex flex-col">
      <div className="flex-grow flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">

          {/* Step 0 – Welcome */}
          {currentStep === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="h-full">
              <MarketingWelcomeStep onNext={goNext} />
            </motion.div>
          )}

          {/* Module steps + Review */}
          {currentStep >= firstModule && currentStep < successStep && (
            <motion.div key="stepper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow overflow-y-auto custom-scrollbar">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-4 pb-3 px-margin-mobile md:px-margin-desktop">
                <div className="relative flex items-center">
                  <img
                    src="/marketing/dm-logo.svg"
                    alt="TAG Digital Marketing"
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
                      <MarketingReviewStep
                        reviewData={{
                          basics:   savedForms.basics   ?? {},
                          accounts: savedForms.accounts ?? {},
                          strategy: savedForms.strategy ?? {},
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
              onAnimationStart={() => localStorage.removeItem(STORAGE_KEY)}
            >
              <MarketingSuccessStep engagementSlug={engagementSlug} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

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
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save failed'}
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
