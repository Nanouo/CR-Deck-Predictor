const input = document.getElementById('cardSearch');
const addBtn = document.getElementById('addBtn');
const slots = Array.from(document.querySelectorAll('.card'));

let ALL_CARDS = [];
fetch('cards.json')
  .then(r => r.json())
  .then(data => { ALL_CARDS = data; })
  .catch(err => console.error('Failed to load cards.json', err));

const norm = s => s.trim().toLowerCase();

function getCardByQuery(q) {
  if (!q) return null;
  const query = norm(q);

  let card = ALL_CARDS.find(c => norm(c.name) === query);
  if (card) return card;

  card = ALL_CARDS.find(c => norm(c.name).startsWith(query));
  if (card) return card;
  return ALL_CARDS.find(c => norm(c.name).includes(query)) || null;
}

function slotHasName(slot, name) {
  return norm(slot.querySelector('.slot-name').textContent) === norm(name);
}

function deckAlreadyHas(name) {
  return slots.some(s => slotHasName(s, name) && s.dataset.empty === 'false');
}

function setSlot(slot, card) {
  const imgSrc = card.iconUrls?.evolutionMedium || card.iconUrls?.medium || '';
  const thumb = slot.querySelector('.thumb');
  thumb.innerHTML = imgSrc
    ? `<img src="${imgSrc}" alt="${card.name}" loading="lazy">`
    : `<div class="placeholder"></div>`;

  slot.querySelector('.slot-name').textContent = card.name;
  slot.querySelector('.tag').textContent = `${card.rarity ?? 'Card'} • ${card.elixirCost ?? '?'}⚡`;
  slot.dataset.empty = 'false';
  slot.classList.add('filled');
}

function addToNextSlot() {
  const query = input.value.trim();
  if (!query) {
    wiggle(addBtn);
    return;
  }

  const card = getCardByQuery(query);
  if (!card) {
    wiggle(input);
    return;
  }

  if (deckAlreadyHas(card.name)) {
    wiggle(addBtn);
    return;
  }

  const target = slots.find(s => s.dataset.empty === 'true');
  if (!target) {
    wiggle(addBtn);
    return; 
  }

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