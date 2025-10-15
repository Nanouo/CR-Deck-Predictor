const input = document.getElementById('cardSearch');
const addBtn = document.getElementById('addBtn');
const slots = Array.from(document.querySelectorAll('.card'));

const DATA_URL = 'http://localhost:5000/localdata/cards.json';

let ALL_CARDS = [];
let ready = false;

// nicknames
const ALIAS = { hog: 'hog rider', hogrider: 'hog rider' };

// helpers
const norm = s => s?.toString().trim().toLowerCase() || '';
const tidy = s => norm(s).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');

// pull a usable display name from various shapes
const displayName = c =>
  c?.name ?? c?.cardName ?? c?.displayName ?? c?.title ?? (c?.key ? tidy(c.key).replace(/\b\w/g, m => m.toUpperCase()) : 'Unknown');

// canonical string used for matching
const getName = c =>
  tidy(c?.name ?? c?.cardName ?? c?.displayName ?? c?.title ?? c?.key ?? '');

// ---- load data
addBtn.setAttribute('disabled', 'true');

fetch(DATA_URL)
  .then(r => {
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  })
  .then(data => {
    // accept array or wrapped arrays
    let arr = Array.isArray(data) ? data :
              data.items || data.cards || data.list || data.data || [];
    if (!Array.isArray(arr)) throw new Error('cards array not found');

    ALL_CARDS = arr;
    ready = true;
    addBtn.removeAttribute('disabled');

    console.log('cards loaded:', ALL_CARDS.length);
    console.log('sample card:', ALL_CARDS[0]);
  })
  .catch(err => {
    console.error('Failed to load cards.json', err);
  });

// alias resolver
function resolveAlias(q) {
  const n = norm(q);
  return ALIAS[n] || q;
}

function getCardByQuery(q) {
  if (!q) return null;
  const query = tidy(resolveAlias(q));

  // exact → startsWith → includes across robust name getter
  return (
    ALL_CARDS.find(c => getName(c) === query) ||
    ALL_CARDS.find(c => getName(c).startsWith(query)) ||
    ALL_CARDS.find(c => getName(c).includes(query)) ||
    null
  );
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

  const name = displayName(card);
  const rarity = card?.rarity ?? 'Card';
  const cost = (card?.elixirCost ?? card?.elixir ?? '?');

  slot.querySelector('.slot-name').textContent = name;
  slot.querySelector('.tag').textContent = `${rarity} • ${cost}⚡`;
  slot.dataset.empty = 'false';
  slot.classList.add('filled');
}

function addToNextSlot() {
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
}

function wiggle(el) {
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 350);
}

addBtn.addEventListener('click', addToNextSlot);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addToNextSlot();
});

slots.forEach(slot => {
  slot.addEventListener('click', () => {
    if (slot.dataset.empty === 'false') {
      slot.querySelector('.thumb').innerHTML = '<div class="placeholder"></div>';
      slot.querySelector('.slot-name').textContent = 'Empty';
      slot.querySelector('.tag').textContent = 'Type';
      slot.dataset.empty = 'true';
      slot.classList.remove('filled');
    }
  });
});

