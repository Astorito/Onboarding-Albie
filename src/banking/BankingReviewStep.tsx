import { Icon } from '../components/ui/primitives';
import { BANKING_MODULES } from './constants';

export interface BankingReviewData {
  general: Record<string, string>;
  banking: Record<string, string>;
}

const FIELD_LABELS: Record<string, string> = {
  propertyName: 'Property / Client Name',
  contactName: 'Point of Contact',
  contactEmail: 'Contact Email',
  contactPhone: 'Contact Phone',
  country: 'Property Country',
  bankName: 'Bank Name',
  accountType: 'Account Type',
  accountNumber: 'Account Number',
  routingNumber: 'Routing Number',
  swiftRecipientName: 'SWIFT Recipient Name',
  swiftAccountNumber: 'SWIFT Account Number / IBAN',
  swiftBicCode: 'SWIFT / BIC Code',
  swiftBankNameAddress: 'SWIFT Bank Name & Address',
  swiftIntermediaryBank: 'SWIFT Intermediary Bank',
};

const friendly = (key: string) =>
  FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

function KeyValues({ data }: { data: Record<string, string> }) {
  const entries = Object.entries(data).filter(([, v]) => v && String(v).trim() !== '');
  if (entries.length === 0) {
    return <p className="text-xs text-on-surface-variant italic">No data entered for this step yet.</p>;
  }
  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
      {entries.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5">
          <dt className="font-bold text-primary text-[10px] uppercase tracking-wider">{friendly(k)}</dt>
          <dd className="text-on-surface-variant break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export const BankingReviewStep = ({
  reviewData,
  onEdit,
}: {
  reviewData: BankingReviewData;
  onEdit: (moduleId: string) => void;
}) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Review Your Answers</h1>
      <p className="text-on-surface-variant text-xs">
        Double-check your bank details before submitting — these are used to send you payments.
      </p>
    </div>

    <div className="flex flex-col gap-4">
      {BANKING_MODULES.map((m) => (
        <div key={m.id} className="bg-white border border-outline-variant rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name={m.icon} className="text-secondary text-2xl" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-primary">{m.title}</h3>
              <p className="text-[11px] text-on-surface-variant">{m.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onEdit(m.id)}
              className="text-xs font-bold text-primary uppercase tracking-wide hover:text-secondary transition-colors cursor-pointer"
            >
              Edit
            </button>
          </div>
          <KeyValues data={m.id === 'general' ? reviewData.general : reviewData.banking} />
        </div>
      ))}
    </div>
  </div>
);
