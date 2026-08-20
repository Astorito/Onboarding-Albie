import { TextInput } from './primitives';

// Pairs with a radio/checkbox option whose value="other" — wrap the whole
// option group (SelectableCards + this) in a `group/other` container, and
// this text field reveals only once that "Other" option gets checked.
// Matches purely on value="other" (not the field's name), so this same
// literal class string is reusable across every "Other: ___" in the form.
export const OtherReveal = ({
  name,
  defaultValue,
  placeholder = 'Please specify...',
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) => (
  <div className="hidden group-has-[input[value=other]:checked]/other:block mt-2">
    <TextInput name={name} placeholder={placeholder} defaultValue={defaultValue ?? ''} key={defaultValue} />
  </div>
);
