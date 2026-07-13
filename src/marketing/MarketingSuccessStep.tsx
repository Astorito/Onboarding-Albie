import { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Icon } from '../components/ui/primitives';

export const MarketingSuccessStep = () => {
  useEffect(() => {
    const end = Date.now() + 3 * 1000;
    const colors = ['#1d1e1f', '#e6007e', '#ffffff'];
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
            Your Digital Advertising onboarding answers have been collected. Our team will
            review them and reach out with next steps for your campaign setup.
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
              href="mailto:digital@theanythinggroup.com"
              className="font-headline-sm text-2xl text-primary hover:text-secondary transition-colors underline decoration-secondary/30 underline-offset-8"
            >
              digital@theanythinggroup.com
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
