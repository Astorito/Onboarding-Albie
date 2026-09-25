import { FormField, TextInput, SelectInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';

export type BankingDetailsPrefill = Record<string, string | null | undefined>;

export const BankingDetailsStep = ({ prefill = {} }: { prefill?: BankingDetailsPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Banking Details</h1>
      <p className="text-on-surface-variant text-xs">
        Domestic account details, plus SWIFT details for international wires — provide whichever
        applies (or both, if you're not sure which one we'll use).
      </p>
    </div>
    <form id="form-banking" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Bank Account"
        description="Your domestic account details, for ACH/direct transfers."
        icon="account_balance"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Bank Name" required className="col-span-2">
            <TextInput name="bankName" placeholder="Bank of America" defaultValue={prefill.bankName ?? ''} key={prefill.bankName} />
          </FormField>

          <FormField label="Account Type" required>
            <SelectInput name="accountType" defaultValue={prefill.accountType ?? ''} key={prefill.accountType}>
              <option value="">Select Account Type</option>
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
            </SelectInput>
          </FormField>

          <FormField label="Account Number" required>
            <TextInput name="accountNumber" placeholder="000123456789" defaultValue={prefill.accountNumber ?? ''} key={prefill.accountNumber} />
          </FormField>

          <FormField label="Routing Number" required className="col-span-2">
            <TextInput name="routingNumber" placeholder="011000015" defaultValue={prefill.routingNumber ?? ''} key={prefill.routingNumber} />
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="International Wire (SWIFT)"
        description="Only needed if payments may be sent internationally."
        icon="public"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="SWIFT Recipient Name" required className="col-span-2">
            <TextInput name="swiftRecipientName" placeholder="Legal name on the account" defaultValue={prefill.swiftRecipientName ?? ''} key={prefill.swiftRecipientName} />
          </FormField>

          <FormField label="SWIFT Account Number / IBAN" required>
            <TextInput name="swiftAccountNumber" placeholder="GB29 NWBK 6016 1331 9268 19" defaultValue={prefill.swiftAccountNumber ?? ''} key={prefill.swiftAccountNumber} />
          </FormField>

          <FormField label="SWIFT / BIC Code" required>
            <TextInput name="swiftBicCode" placeholder="NWBKGB2L" defaultValue={prefill.swiftBicCode ?? ''} key={prefill.swiftBicCode} />
          </FormField>

          <FormField label="SWIFT Bank Name & Address" required className="col-span-2">
            <TextInput name="swiftBankNameAddress" placeholder="Bank name and full branch address" defaultValue={prefill.swiftBankNameAddress ?? ''} key={prefill.swiftBankNameAddress} />
          </FormField>

          <FormField label="SWIFT Intermediary Bank" required className="col-span-2" hint="If your bank requires an intermediary/correspondent bank for international wires.">
            <TextInput name="swiftIntermediaryBank" placeholder="Intermediary bank SWIFT code" defaultValue={prefill.swiftIntermediaryBank ?? ''} key={prefill.swiftIntermediaryBank} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
