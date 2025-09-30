require('dotenv').config();
const connectDB = require('../db');
connectDB(); // ✅ connect before using Deck model
const fs = require('fs');
const path = require('path');

const cardsPath = path.join(__dirname, '../localdata/cards.json');
const cardData = JSON.parse(fs.readFileSync(cardsPath));

const getTopPlayers = require('./getTopPlayers');
const Deck = require('../models/decks');

const populateDecks = async () => {
  console.log('Starting deck population...');
  
  const players = await getTopPlayers();
  console.log('getTopPlayers returned:', players);
  console.log(`Fetched ${players.length} players`);

  const deckBatch = [];

  for (const player of players) {
    console.log(`Checking player: ${player.name}`);

    const cards = player.currentDeck?.map(card => card.name);
    if (!cards || cards.length !== 8) {
      console.log(`Skipping invalid deck for ${player.name}`);
      continue;
    }

    console.log(`Deck cards: ${cards.join(', ')}`);

    const exists = await Deck.exists({ cards: { $all: cards, $size: 8 } });
    if (exists) {
      console.log(`Deck already exists for ${player.name}`);
      continue;
    }

    const cardDocs = cardData.filter(card => cards.includes(card.name));
    if (cardDocs.length !== 8) {
      console.log(`Warning: card lookup mismatch for ${player.name} — found ${cardDocs.length} cards`);
    }

    const winConditions = cardDocs
      .filter(card => card.wincon)
      .map(card => card.name);

    const totalElixir = cardDocs.reduce((sum, card) => sum + card.elixirCost, 0);
    const avgElixir = (totalElixir / cardDocs.length).toFixed(1);

    const deckName = winConditions.length
      ? `${winConditions.join(', ')} — ${avgElixir}`
      : `No Win Condition — ${avgElixir}`;

    console.log(`Queued new deck for ${player.name}: ${deckName}`);

    deckBatch.push({
      cards,
      sourcePlayer: player.name,
      towerTroops: 'default',
      name: deckName
    });
  }

  console.log(`Total decks to insert: ${deckBatch.length}`);

  if (deckBatch.length) {
    await Deck.insertMany(deckBatch);
    console.log(`✅ Inserted ${deckBatch.length} new decks`);
  } else {
    console.log('⚠️ No new decks to insert');
  }

  console.log('Deck population complete.');
};
populateDecks().catch(err => {
  console.error('❌ Error during deck population:', err);
});

module.exports = populateDecks;