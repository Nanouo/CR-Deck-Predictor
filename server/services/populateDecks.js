require('dotenv').config();
const connectDB = require('../db');
const fs = require('fs');
const path = require('path');
const getTopPlayers = require('./getTopPlayers');
const { getPlayersData } = require('./getPlayerData');
const processDecks = require('./processDecks');
const Deck = require('../models/decks');

connectDB();

const populateDecks = async (locationId = 'global') => {
  console.log(`Starting deck population for location: ${locationId}...`);

  try {
    // Get top player IDs
    const playerTags = await getTopPlayers(locationId);
    console.log(`Fetched ${playerTags.length} player tags from ${locationId}`);

    // Get full player data including current decks
    const players = await getPlayersData(playerTags);
    console.log(`Fetched full data for ${players.length} players`);

    const cardsPath = path.join(__dirname, '../localdata/cards.json');
    const cardData = JSON.parse(fs.readFileSync(cardsPath));

    const deckBatch = processDecks(players, cardData);

    if (deckBatch.length) {
      await Deck.insertMany(deckBatch);
      console.log(`✅ Inserted ${deckBatch.length} new decks from ${locationId}`);
    } else {
      console.log('⚠️ No new decks to insert');
    }
  } catch (err) {
    console.error('❌ Error during deck population:', err.message);
  }

  console.log('Deck population complete.');
};

populateDecks();

module.exports = populateDecks;