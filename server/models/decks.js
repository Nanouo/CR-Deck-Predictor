//DATABASE for DECKS
const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  cards: [String], // array of 8 card names
  sourcePlayer: String,
  towerTroops: String,
  name: String,
  description: { type: String, required: false }, // Optional description
  avgElixir: { type: Number, required: false }, // Average elixir cost
  winConditions: { type: [String], required: false }, // Array of win condition cards
  isMetaDeck: { type: Boolean, default: false }, // Flag for manually added meta decks
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deck', deckSchema);

