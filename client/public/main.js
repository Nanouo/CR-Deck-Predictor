// ===== DOM =====
const input = document.getElementById('cardSearch');
const addBtn = document.getElementById('addBtn');
const slots = Array.from(document.querySelectorAll('.card'));
const suggestionSlots = Array.from(document.querySelectorAll('.suggestion-card'));

// ===== Config =====
const DATA_URL = './cards.json';
const API_URL  = 'http://localhost:5000/api/predict/cards';    // prediction endpoint
const DROPDOWN_LIMIT = 10;


// ===== State =====
let ALL_CARDS = [];
let ready = false;

// ===== Helpers =====
const norm  = s => s?.toString().trim().toLowerCase() || '';
const tidy  = s => norm(s).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
const title = s => s.replace(/\b\w/g, m => m.toUpperCase());
const debounce = (fn, ms=120) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

// nicknames
const ALIAS = { hog: 'hog rider', hogrider: 'hog rider' };

// unified display name from varied shapes
const displayName = c =>
  c?.name ?? c?.cardName ?? c?.displayName ?? c?.title ??
  (c?.key ? title(tidy(c.key)) : 'Unknown');

// canonical name used for matching
const getName = c =>
  tidy(c?.name ?? c?.cardName ?? c?.displayName ?? c?.title ?? c?.key ?? '');

// resolve aliases like "hog" → "hog rider"
function resolveAlias(q) {
  const n = norm(q);
  return ALIAS[n] || q;
}

// ===== Data Load =====
addBtn.setAttribute('disabled', 'true');

fetch(DATA_URL)
  .then(r => {
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  })
  .then(data => {
    const arr = Array.isArray(data) ? data :
                data.items || data.cards || data.list || data.data || [];
    if (!Array.isArray(arr)) throw new Error('cards array not found');
    ALL_CARDS = arr;
    ready = true;
    addBtn.removeAttribute('disabled');
    console.log('cards loaded:', ALL_CARDS.length);
  })
  .catch(err => console.error('Failed to load cards.json', err));

// ===== Card search =====
function findMatches(q) {
  const query = tidy(resolveAlias(q));
  if (!query) return [];

  // score: exact (0), startsWith (1), includes (2) – keep order stable
  const scored = [];
  for (const c of ALL_CARDS) {
    const n = getName(c);
    if (n === query)               scored.push([0, c]);
    else if (n.startsWith(query))  scored.push([1, c]);
    else if (n.includes(query))    scored.push([2, c]);
  }
  scored.sort((a,b) => a[0]-b[0] || displayName(a[1]).localeCompare(displayName(b[1])));
  return scored.slice(0, DROPDOWN_LIMIT).map(([,c]) => c);
}

function getCardByQuery(q) {
  const results = findMatches(q);
  return results[0] || null;
}

function slotHasName(slot, name) {
  return norm(slot.querySelector('.slot-name').textContent) === norm(name);
}

function deckAlreadyHas(name) {
  return slots.some(s => s.dataset.empty === 'false' && slotHasName(s, name));
}

function setSlot(slot, card) {
  const imgSrc =
    card?.iconUrls?.evolutionMedium ||
    card?.iconUrls?.medium ||
    card?.iconUrls?.large ||
    '';

  const thumb = slot.querySelector('.thumb');
  thumb.innerHTML = imgSrc
    ? `<img src="${imgSrc}" alt="${displayName(card)}" loading="lazy">`
    : `<div class="placeholder"></div>`;

  const name   = displayName(card);
  const rarity = card?.rarity ?? 'Card';
  const cost   = (card?.elixirCost ?? card?.elixir ?? '?');

  slot.querySelector('.slot-name').textContent = name;
  slot.querySelector('.tag').textContent       = `${rarity} • ${cost}⚡`;
  slot.dataset.empty = 'false';
  slot.classList.add('filled');
}

function clearSlot(slot) {
  slot.querySelector('.thumb').innerHTML = '<div class="placeholder"></div>';
  slot.querySelector('.slot-name').textContent = 'Empty';
  slot.querySelector('.tag').textContent = 'Type';
  slot.dataset.empty = 'true';
  slot.classList.remove('filled');
}

// ===== Suggestions UI =====
function clearSuggestionSlot(slot) {
  slot.querySelector('.thumb').innerHTML = '<div class="placeholder"></div>';
  slot.querySelector('.suggestion-name').textContent = '-';
  slot.querySelector('.frequency').textContent = '0%';
  slot.dataset.cardName = '';
}

function clearSuggestions() {
  suggestionSlots.forEach(clearSuggestionSlot);
}

function displaySuggestions(suggestions) {
  suggestions.forEach((s, i) => {
    if (i >= suggestionSlots.length) return;
    const slot = suggestionSlots[i];
    const cardName = s.card || s.name;
    const card = ALL_CARDS.find(c => norm(displayName(c)) === norm(cardName)) ||
                 ALL_CARDS.find(c => getName(c) === tidy(cardName));
    if (!card) return;

    const imgSrc = card.iconUrls?.evolutionMedium || card.iconUrls?.medium || '';
    const thumb  = slot.querySelector('.thumb');
    thumb.innerHTML = imgSrc
      ? `<img src="${imgSrc}" alt="${displayName(card)}" loading="lazy">`
      : `<div class="placeholder"></div>`;

    slot.querySelector('.suggestion-name').textContent = displayName(card);
    slot.querySelector('.frequency').textContent = `${s.frequency ?? 0}%`;
    slot.dataset.cardName = displayName(card);
  });

  for (let i = suggestions.length; i < suggestionSlots.length; i++) {
    clearSuggestionSlot(suggestionSlots[i]);
  }
}

// ===== API =====
async function fetchPredictions() {
  const selectedCards = slots
    .filter(s => s.dataset.empty === 'false')
    .map(s => s.querySelector('.slot-name').textContent);

  if (selectedCards.length === 0 || selectedCards.length === 8) {
    clearSuggestions();
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: selectedCards })
    });

    if (!res.ok) {
      console.warn('Predict API not OK:', res.status, await res.text());
      clearSuggestions();
      return;
    }

    const data = await res.json();
    const list = data?.suggestedCards || data;
    if (Array.isArray(list) && list.length) displaySuggestions(list);
    else clearSuggestions();
  } catch (err) {
    console.error('❌ Failed to fetch predictions:', err);
    clearSuggestions();
  }
}

// ===== UX bits =====
function wiggle(el) {
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 350);
}

// ===== Dropdown (autocomplete) =====
let dd, ddIndex = -1; // active index
function ensureDropdown() {
  if (dd) return dd;
  dd = document.createElement('div');
  dd.id = 'cardDropdown';
  Object.assign(dd.style, {
    position: 'absolute',
    zIndex: 1000,
    minWidth: `${input.offsetWidth}px`,
    maxHeight: '280px',
    overflowY: 'auto',
    display: 'none',
    background: 'var(--dropdown-bg, #0f172a)',
    border: '1px solid var(--dropdown-border, #233042)',
    borderRadius: '12px',
    boxShadow: '0 10px 24px rgba(0,0,0,.35)',
  });
  // place after input in the DOM
  input.parentElement.style.position = 'relative';
  input.parentElement.appendChild(dd);
  // reposition on resize
  const place = () => {
    const r = input.getBoundingClientRect();
    dd.style.top  = `${input.offsetTop + input.offsetHeight + 6}px`;
    dd.style.left = `${input.offsetLeft}px`;
    dd.style.minWidth = `${input.offsetWidth}px`;
  };
  place();
  window.addEventListener('resize', place);
  return dd;
}

function renderDropdown(items, query) {
  const menu = ensureDropdown();
  menu.innerHTML = '';
  ddIndex = -1;

  if (!items.length || !query) {
    menu.style.display = 'none';
    return;
  }

  const q = tidy(query);
  const frag = document.createDocumentFragment();

  items.forEach((c, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'dd-item';
    el.style.cssText = `
      width:100%; text-align:left; padding:10px 12px; cursor:pointer;
      background:transparent; border:0; color:#e2e8f0; font:inherit;
      display:flex; align-items:center; gap:10px;
    `;
    const name = displayName(c);
    const n = getName(c);
    // highlight match
    const idx = n.indexOf(q);
    const highlighted = idx >= 0
      ? name.slice(0, idx) + '<mark>' + name.slice(idx, idx+q.length) + '</mark>' + name.slice(idx+q.length)
      : name;

    const imgSrc = c?.iconUrls?.medium || c?.iconUrls?.evolutionMedium || '';
    el.innerHTML = `
      ${imgSrc ? `<img src="${imgSrc}" alt="" width="36" height="36" style="border-radius:8px;object-fit:cover;">` : ''}
      <span class="dd-name">${highlighted}</span>
      <span style="margin-left:auto; opacity:.7; font-size:.9em;">${c?.elixirCost ?? c?.elixir ?? '?' }⚡</span>
    `;

    el.addEventListener('mousedown', (e) => {
      e.preventDefault(); // keep focus
      chooseDropdownItem(i);
    });

    frag.appendChild(el);
  });

  menu.appendChild(frag);
  menu.style.display = 'block';
}

function closeDropdown() {
  if (!dd) return;
  dd.style.display = 'none';
  ddIndex = -1;
}

function chooseDropdownItem(i) {
  const items = findMatches(input.value);
  const card = items[i];
  if (!card) return;
  input.value = displayName(card);
  closeDropdown();
  addBtn.click(); // immediately add to next slot
}

function moveHighlight(delta) {
  if (!dd || dd.style.display === 'none') return;
  const items = Array.from(dd.querySelectorAll('.dd-item'));
  if (!items.length) return;
  ddIndex = (ddIndex + delta + items.length) % items.length;
  items.forEach(el => el.style.background = 'transparent');
  items[ddIndex].scrollIntoView({ block: 'nearest' });
  items[ddIndex].style.background = 'rgba(148,163,184,.12)';
}

// ===== Events =====
addBtn.addEventListener('click', () => {
  if (!ready) return wiggle(addBtn);

  const query = input.value.trim();
  if (!query) return wiggle(addBtn);

  const card = getCardByQuery(query);
  if (!card) return wiggle(input);

  const name = displayName(card);
  if (deckAlreadyHas(name)) return wiggle(addBtn);

  const target = slots.find(s => s.dataset.empty === 'true');
  if (!target) return wiggle(addBtn);

  setSlot(target, card);
  input.value = '';
  closeDropdown();
  fetchPredictions();
});

input.addEventListener('input', debounce((e) => {
  if (!ready) return;
  const q = e.target.value;
  const items = findMatches(q);
  renderDropdown(items, q);
}, 80));

input.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveHighlight(+1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); moveHighlight(-1); }
  else if (e.key === 'Enter') {
    if (dd && dd.style.display !== 'none' && ddIndex >= 0) {
      e.preventDefault(); chooseDropdownItem(ddIndex);
    } else {
      addBtn.click();
    }
  } else if (e.key === 'Escape') {
    closeDropdown();
  }
});

input.addEventListener('blur', () => setTimeout(closeDropdown, 120)); // allow click

slots.forEach(slot => {
  slot.addEventListener('click', () => {
    if (slot.dataset.empty === 'false') {
      clearSlot(slot);
      fetchPredictions();
    }
  });
});

<<<<<<< HEAD
// click suggestion → add to next empty slot
suggestionSlots.forEach(sugg => {
  sugg.addEventListener('click', () => {
    const cardName = sugg.dataset.cardName;
    if (!cardName) return;

    const card = ALL_CARDS.find(c => norm(displayName(c)) === norm(cardName)) ||
                 ALL_CARDS.find(c => getName(c) === tidy(cardName));
    if (!card) return;

    if (deckAlreadyHas(displayName(card))) return wiggle(sugg);

    const target = slots.find(s => s.dataset.empty === 'true');
    if (!target) return wiggle(sugg);

    setSlot(target, card);
    fetchPredictions();
  });
});
=======
>>>>>>> evan-ui-header
