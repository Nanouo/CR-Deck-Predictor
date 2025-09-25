//DATABASE for DECKS
const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  cards: [String], // array of 8 card names
  sourcePlayer: String,
  towerTroops: String,
  name: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deck', deckSchema);