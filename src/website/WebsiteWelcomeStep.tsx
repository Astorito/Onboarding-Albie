import { Icon } from '../components/ui/primitives';

export const WebsiteWelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile relative bg-white">
    <div className="max-w-container-max-width w-full grid md:grid-cols-12 gap-gutter items-center">
      <div className="md:col-span-6 flex flex-col items-start gap-6 py-4">
        <img
          src="/marketing/dm-logo.svg"
          alt="TAG Digital Marketing"
          style={{ width: '150px', height: '75px', objectFit: 'contain' }}
        />
        <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit">
          ESTIMATED TIME: 10 MINUTES
        </span>
        <h1 className="font-display-lg text-4xl lg:text-6xl text-primary leading-tight">
          New Website Project Onboarding
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-lg">
          <span className="block text-xl font-bold text-primary mb-1.5">You're just a few steps away.</span>
          Please complete this form to provide essential information for initiating your new
          website project.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
          <button
            onClick={onNext}
            className="font-body-md px-10 py-4 rounded-lg shadow-sm hover:opacity-90 transition-all active:scale-95 duration-200 cursor-pointer font-bold bg-secondary text-on-secondary"
          >
            Start Onboarding
          </button>
        </div>
      </div>
      <div
        className="md:col-span-6 hidden md:flex flex-col gap-4 h-[450px] rounded-2xl p-3 bg-cover bg-center shadow-lg"
        style={{ backgroundImage: "url('/marketing/service-gradient.png')" }}
      >
        {/* Placeholder card — swap for real screenshots/mockups once available */}
        <div className="flex-1 rounded-2xl border border-outline-variant shadow-lg bg-white p-6 flex flex-col justify-center items-start">
          <Icon name="language" className="text-secondary text-4xl mb-2" />
          <h3 className="font-headline-sm text-xl text-primary font-bold">Your Website, Built Right</h3>
          <p className="font-body-sm text-on-surface-variant">
            From structure to launch, we'll guide every step of your new site.
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-secondary-container p-6 flex flex-col justify-center shadow-md">
          <Icon name="rocket_launch" className="text-secondary text-4xl mb-2" />
          <h3 className="font-headline-sm text-xl text-primary font-bold">Rapid Launch</h3>
          <p className="font-body-sm text-on-secondary-container">Ready in 10 minutes.</p>
        </div>
      </div>
    </div>
  </main>
);
