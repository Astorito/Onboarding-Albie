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
  const skippedText = describeSkipped(selectedRecord.fields, plan);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes('/site-customization')) {
    msgEl.textContent = 'Abrí la tab de Site Customization en Albie antes de rellenar.';
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
    const okText = [...response.text, ...response.select].filter((r) => r.ok).length;
    const failed = [...response.text, ...response.select].filter((r) => !r.ok);
    let text = `${okText} campo(s) completados. Revisá y guardá manualmente.`;
    if (failed.length) {
      text += `\nNo se pudieron completar: ${failed.map((f) => f.name || f.label).join(', ')}`;
    }
    if (skippedText) text += `\n\n${skippedText}`;
    msgEl.textContent = text;
  });
});

function describeSkipped(fields, plan) {
  const notes = [];
  if (fields['Timezone'] && !plan.selectFields['timezone']) {
    notes.push(`Timezone sin mapeo: "${fields['Timezone']}" — completar a mano.`);
  }
  if (fields['Currency'] && !plan.selectFields['currency']) {
    notes.push(`Currency "${fields['Currency']}" no soportada por Albie — completar a mano.`);
  }
  if (fields['Language'] && !plan.selectFields['Primary Language']) {
    notes.push(`Language "${fields['Language']}" no soportado por Albie (solo EN/ES/PT-BR) — completar a mano.`);
  }
  return notes.join('\n');
}

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
