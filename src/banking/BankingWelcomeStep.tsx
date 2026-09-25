import { Icon } from '../components/ui/primitives';

export const BankingWelcomeStep = ({
  onNext,
  propertyName,
}: {
  onNext: () => void;
  propertyName?: string | null;
}) => (
  <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile relative bg-white">
    <div className="absolute top-5 left-6">
      <img
        src="/albie-logo-dark.svg"
        alt="ALBIE by TAG"
        style={{ width: '150px', height: '100px', objectFit: 'contain' }}
      />
    </div>
    <div className="max-w-container-max-width w-full grid md:grid-cols-12 gap-gutter items-center">
      <div className="md:col-span-7 flex flex-col items-start gap-6 py-4">
        <div className="flex flex-col gap-2">
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit">
            ESTIMATED TIME: 3 MINUTES
          </span>
          <h1 className="font-display-lg text-4xl lg:text-6xl text-primary leading-tight">
            Banking Information
          </h1>
          {propertyName && (
            <p className="font-display-lg text-2xl lg:text-3xl text-secondary font-bold leading-tight">
              {propertyName}
            </p>
          )}
          <p className="font-body-md text-on-surface-variant max-w-lg">
            Please provide the essential bank account and contact details required for the secure
            and timely transfer of funds to your property.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
          <button
            onClick={onNext}
            className="font-body-md px-10 py-4 rounded-lg shadow-sm hover:opacity-90 transition-all active:scale-95 duration-200 cursor-pointer font-bold text-white"
            style={{ backgroundColor: '#2F6B6D' }}
          >
            Start
          </button>
        </div>
      </div>
      <div className="md:col-span-5 hidden md:flex flex-col justify-center h-[350px] rounded-2xl border border-outline-variant bg-secondary-container p-8 shadow-lg">
        <Icon name="account_balance" className="text-secondary text-5xl mb-4" />
        <h3 className="font-headline-sm text-2xl text-primary font-bold mb-2">Quick & secure</h3>
        <p className="font-body-sm text-on-secondary-fixed-variant">
          Two short steps: who to contact, and where to send payments.
        </p>
      </div>
    </div>
  </main>
);
