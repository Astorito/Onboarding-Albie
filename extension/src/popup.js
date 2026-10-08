const searchEl = document.getElementById('search');
const resultsEl = document.getElementById('results');
const fillBtn = document.getElementById('fillBtn');
const msgEl = document.getElementById('msg');
const configWarningEl = document.getElementById('configWarning');

let config = null;
let selectedRecord = null;
let debounceTimer = null;

document.getElementById('openOptions').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

function escapeFormulaString(s) {
  return s.replace(/'/g, "\\'");
}

async function searchAirtable(query) {
  const formula = `SEARCH(LOWER('${escapeFormulaString(query)}'), LOWER({Property Name}&''))`;
  const url = new URL(`https://api.airtable.com/v0/${config.airtableBaseId}/${encodeURIComponent(config.airtableTable)}`);
  url.searchParams.set('filterByFormula', formula);
  url.searchParams.set('maxRecords', '15');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${config.airtablePat}` },
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.records || [];
}

function renderResults(records) {
  resultsEl.innerHTML = '';
  if (!records.length) {
    resultsEl.innerHTML = '<div class="result">Sin resultados.</div>';
    return;
  }
  for (const record of records) {
    const div = document.createElement('div');
    div.className = 'result';
    const name = record.fields['Property Name'] || '(sin nombre)';
    const sub = [record.fields['City'], record.fields['Country']].filter(Boolean).join(', ');
    div.innerHTML = `<div class="name"></div><div class="sub"></div>`;
    div.querySelector('.name').textContent = name;
    div.querySelector('.sub').textContent = sub;
    div.addEventListener('click', () => {
      document.querySelectorAll('.result.selected').forEach((el) => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedRecord = record;
      fillBtn.disabled = false;
      msgEl.textContent = '';
    });
    resultsEl.appendChild(div);
  }
}

searchEl.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const query = searchEl.value.trim();
  fillBtn.disabled = true;
  selectedRecord = null;
  if (query.length < 2) {
    resultsEl.innerHTML = '';
    return;
  }
  debounceTimer = setTimeout(async () => {
    try {
      const records = await searchAirtable(query);
      renderResults(records);
    } catch (err) {
      resultsEl.innerHTML = '';
      msgEl.textContent = `Error buscando en Airtable: ${err.message}`;
    }
  }, 350);
});

fillBtn.addEventListener('click', async () => {
  if (!selectedRecord) return;
  const plan = buildFillPlan(selectedRecord.fields);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes('/site-customization') && !tab?.url?.includes('/sites/create')) {
    msgEl.textContent = 'Abrí la tab de Site Customization (o de creación de site) en Albie antes de rellenar.';
    return;
  }

  fillBtn.disabled = true;
  msgEl.textContent = 'Rellenando...';
  chrome.tabs.sendMessage(tab.id, { type: 'ALBIE_AUTOFILL_RUN', plan }, (response) => {
    fillBtn.disabled = false;
    if (chrome.runtime.lastError || !response) {
      msgEl.textContent = `No se pudo rellenar: ${chrome.runtime.lastError?.message || 'sin respuesta del content script'}. Recargá la página de Albie e intentá de nuevo.`;
      return;
    }
    const all = [...response.text, ...response.select];
    const nameOf = (r) => (r.name ? plan.labels[r.name] || r.name : r.label);
    const okCount = all.filter((r) => r.ok).length;
    // Fields that aren't in the DOM belong to another tab of the Albie form.
    const missing = all.filter((r) => !r.ok && (r.reason === 'not-found' || r.reason === 'field-not-found'));
    const failed = all.filter((r) => !r.ok && !missing.includes(r));

    let text = `${okCount} campo(s) completados. Revisá y guardá manualmente.`;
    if (missing.length) {
      text += `\n\nNo están en esta pestaña: ${missing.map(nameOf).join(', ')}. Cambiá de pestaña en Albie y apretá Rellenar de nuevo.`;
    }
    if (failed.length) {
      text += `\n\nNo se pudieron completar: ${failed.map(nameOf).join(', ')}`;
    }
    if (plan.notes.length) text += `\n\n${plan.notes.join('\n')}`;
    msgEl.textContent = text;
  });
});

chrome.storage.local.get(['airtablePat', 'airtableBaseId', 'airtableTable'], (stored) => {
  if (!stored.airtablePat || !stored.airtableBaseId) {
    configWarningEl.style.display = 'block';
    searchEl.disabled = true;
    return;
  }
  config = {
    airtablePat: stored.airtablePat,
    airtableBaseId: stored.airtableBaseId,
    airtableTable: stored.airtableTable || 'Onboardings_Hotel',
  };
});
