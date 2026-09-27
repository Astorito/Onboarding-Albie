const patEl = document.getElementById('pat');
const baseIdEl = document.getElementById('baseId');
const tableEl = document.getElementById('table');
const statusEl = document.getElementById('status');

chrome.storage.local.get(['airtablePat', 'airtableBaseId', 'airtableTable'], (stored) => {
  if (stored.airtablePat) patEl.value = stored.airtablePat;
  if (stored.airtableBaseId) baseIdEl.value = stored.airtableBaseId;
  if (stored.airtableTable) tableEl.value = stored.airtableTable;
});

document.getElementById('save').addEventListener('click', () => {
  const airtablePat = patEl.value.trim();
  const airtableBaseId = baseIdEl.value.trim();
  const airtableTable = tableEl.value.trim() || 'Onboardings_Hotel';

  chrome.storage.local.set({ airtablePat, airtableBaseId, airtableTable }, () => {
    statusEl.textContent = 'Guardado.';
    statusEl.style.color = '#2F6B6D';
    setTimeout(() => (statusEl.textContent = ''), 2000);
  });
});
