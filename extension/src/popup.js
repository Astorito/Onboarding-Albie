const searchEl = document.getElementById('search');
const resultsEl = document.getElementById('results');
const fillBtn = document.getElementById('fillBtn');
const msgEl = document.getElementById('msg');
const configWarningEl = document.getElementById('configWarning');
const ratesBoxEl = document.getElementById('ratesBox');
const ratesEl = document.getElementById('rates');

let config = null;
let selectedRecord = null;
let selectedRate = null;
let debounceTimer = null;

const isRatesUrl = (url) => !!url && url.includes('/rates-and-packages/rates');
const isSiteFormUrl = (url) => !!url && (url.includes('/site-customization') || url.includes('/sites/create'));

// On a Rates page the hotel has several rates, so the person picks one;
// everywhere else the Fill button is ready as soon as a hotel is selected.
async function updateRatesUI() {
  ratesEl.innerHTML = '';
  selectedRate = null;
  ratesBoxEl.style.display = 'none';
  if (!selectedRecord) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!isRatesUrl(tab?.url)) {
    fillBtn.disabled = false;
    return;
  }

  fillBtn.disabled = true;
  ratesBoxEl.style.display = 'block';
  const rates = parseRates(selectedRecord.fields);
  if (!rates.length) {
    ratesEl.innerHTML = '<div class="result">Este hotel no tiene tarifas cargadas en el onboarding.</div>';
    return;
  }
  rates.forEach((rate, index) => {
    const div = document.createElement('div');
    div.className = 'result';
    div.innerHTML = '<div class="name"></div><div class="sub"></div>';
    div.querySelector('.name').textContent = rateDisplayName(rate, index);
    div.querySelector('.sub').textContent = [rate.rateCode, rate.status].filter(Boolean).join(' · ');
    div.addEventListener('click', () => {
      ratesEl.querySelectorAll('.result.selected').forEach((el) => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedRate = rate;
      fillBtn.disabled = false;
      msgEl.textContent = '';
    });
    ratesEl.appendChild(div);
  });
}

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
      resultsEl.querySelectorAll('.result.selected').forEach((el) => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedRecord = record;
      msgEl.textContent = '';
      updateRatesUI();
    });
    resultsEl.appendChild(div);
  }
}

searchEl.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const query = searchEl.value.trim();
  fillBtn.disabled = true;
  selectedRecord = null;
  selectedRate = null;
  ratesBoxEl.style.display = 'none';
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

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let plan;
  if (isRatesUrl(tab?.url)) {
    if (!selectedRate) {
      msgEl.textContent = 'Elegí primero una tarifa de la lista.';
      return;
    }
    plan = buildRatePlan(selectedRate, selectedRecord.fields);
  } else if (isSiteFormUrl(tab?.url)) {
    plan = buildFillPlan(selectedRecord.fields);
  } else {
    msgEl.textContent = 'Abrí en Albie la página de Site Customization, de creación de site o de creación de tarifa antes de rellenar.';
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
