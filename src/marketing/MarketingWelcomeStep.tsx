export const MarketingWelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile relative bg-white">
    <div className="absolute top-5 left-6">
      <img
        src="/marketing/dm-logo.svg"
        alt="TAG Digital Marketing"
        style={{ width: '150px', height: '75px', objectFit: 'contain' }}
      />
    </div>
    <div className="max-w-container-max-width w-full grid md:grid-cols-12 gap-gutter items-center">
      <div className="md:col-span-6 flex flex-col items-start gap-6 py-4">
        <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit">
          ESTIMATED TIME: 8 MINUTES
        </span>
        <h1 className="font-display-lg text-4xl lg:text-6xl text-primary leading-tight">
          Onboarding — Digital Advertising
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-lg">
          Initial PPC setup includes strategic planning, campaign structure build-out, ad copy
          creation, audience targeting, conversion tracking implementation, and account
          configuration across corresponding platforms. Creation of Google Ads, Google Analytics
          4, and Google Tag Manager accounts if needed.
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
      <div className="md:col-span-6 hidden md:block h-[450px] rounded-2xl overflow-hidden border border-outline-variant shadow-lg">
        <img
          src="/marketing/service-gradient.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </main>
);
