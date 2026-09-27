// Runs on app.albiebytag.com's Site Customization page. Fills form fields
// from a fill plan sent by the popup (built by mapping.js from an Airtable
// record) but never submits the form — the human always reviews and clicks
// "Save Changes" themselves.

const NATIVE_INPUT_VALUE_SETTER = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype,
  'value'
).set;

function setReactInputValue(input, value) {
  NATIVE_INPUT_VALUE_SETTER.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new Event('blur', { bubbles: true }));
}

function fillTextField(name, value) {
  const input = document.querySelector(`[name="${CSS.escape(name)}"]`);
  if (!input) return { name, ok: false, reason: 'not-found' };
  setReactInputValue(input, value);
  return { name, ok: true };
}

// Finds the field's wrapper (the div holding both the <label> and its
// control) by matching the <label>'s text, case-insensitively.
function findFieldContainer(labelText) {
  const labels = Array.from(document.querySelectorAll('label'));
  const label = labels.find(
    (l) => l.textContent.trim().toLowerCase() === labelText.trim().toLowerCase()
  );
  if (!label) return null;
  let node = label;
  for (let up = 0; up < 8 && node; up++) {
    node = node.parentElement;
    if (!node) break;
    if (node.querySelector('button[role="combobox"]')) return node;
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fillSelectField(labelText, value) {
  const container = findFieldContainer(labelText);
  if (!container) return { label: labelText, ok: false, reason: 'field-not-found' };

  const hiddenSelect = container.querySelector('select');
  const button = container.querySelector('button[role="combobox"]');
  if (!hiddenSelect || !button) return { label: labelText, ok: false, reason: 'control-not-found' };

  const optionIndex = Array.from(hiddenSelect.options).findIndex((o) => o.value === value);
  if (optionIndex === -1) return { label: labelText, ok: false, reason: 'value-not-offered' };

  button.click();
  await sleep(250);
  const options = document.querySelectorAll('[role="option"]');
  const target = options[optionIndex];
  if (!target) {
    document.body.click(); // best-effort close
    return { label: labelText, ok: false, reason: 'option-not-rendered' };
  }
  target.click();
  await sleep(100);
  return { label: labelText, ok: true };
}

async function runFill(plan) {
  const results = { text: [], select: [] };
  for (const [name, value] of Object.entries(plan.textFields || {})) {
    results.text.push(fillTextField(name, value));
  }
  for (const [label, value] of Object.entries(plan.selectFields || {})) {
    results.select.push(await fillSelectField(label, value));
  }
  return results;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'ALBIE_AUTOFILL_RUN') return undefined;
  runFill(message.plan).then(sendResponse);
  return true; // keep the message channel open for the async response
});
