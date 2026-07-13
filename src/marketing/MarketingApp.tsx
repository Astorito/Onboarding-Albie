/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type ReactNode } from 'react';
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

// NOTE: no persistence yet — this flow only builds and collects the onboarding
// steps described in the Digital Advertising brief. Wiring this up to a Sheet
// (or any other datastore) is left for a follow-up change.
export default function MarketingApp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [savedForms, setSavedForms] = useState<Record<string, Record<string, string>>>({});

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

  const goNext = () => {
    collectCurrentForm();
    window.scrollTo(0, 0);
    setCurrentStep((s) => s + 1);
  };
  const goBack = () => {
    collectCurrentForm();
    window.scrollTo(0, 0);
    setCurrentStep((s) => s - 1);
  };

  const handleNext = () => {
    if (currentStep === reviewStep) {
      // Persistence isn't wired up yet — jump straight to the success screen.
      window.scrollTo(0, 0);
      setCurrentStep(successStep);
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
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
              <MarketingSuccessStep />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

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
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group flex items-center gap-2 bg-secondary text-white rounded-xl px-10 py-4 font-bold hover:opacity-95 transition-all active:scale-95 duration-200 cursor-pointer shadow-xl"
          >
            {currentStep === reviewStep ? (
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
