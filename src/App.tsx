/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
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
import { CancellationPoliciesStep } from './steps/modules/CancellationPoliciesStep';
import { RoomInformationStep } from './steps/modules/RoomInformationStep';
import { RoomOccupancyStep } from './steps/modules/RoomOccupancyStep';
import { ExperiencesStep } from './steps/modules/ExperiencesStep';
import { AddOnsStep } from './steps/modules/AddOnsStep';
import { RatesPackagesStep } from './steps/modules/RatesPackagesStep';
import { TaxesFeesStep } from './steps/modules/TaxesFeesStep';

import { ReviewStep } from './steps/ReviewStep';
import { SuccessStep } from './steps/SuccessStep';

import { PrefillData, GroupMember } from './types';
import { DEFAULT_ENABLED } from './constants';

export default function App() {
  // Property type selection
  const [propertyType, setPropertyType] = useState<'independent' | 'group' | null>(null);
  // Group member properties
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
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
