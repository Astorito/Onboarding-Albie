export const SocialWelcomeStep = ({ onNext }: { onNext: () => void }) => (
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
          ESTIMATED TIME: 15 MINUTES
        </span>
        <h1 className="font-display-lg text-4xl lg:text-6xl text-primary leading-tight">
          Social Media Onboarding
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-lg">
          <span className="block text-xl font-bold text-primary mb-1.5">
            Thank you for choosing TAG for your organic social media content.
          </span>
          This form helps our team understand your business, audience, goals, brand, and
          available resources — so we can develop your content strategy, define your content
          pillars, and plan a monthly calendar that's actually yours. The more detail, links, and
          supporting materials you can share, the more tailored the result.
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
