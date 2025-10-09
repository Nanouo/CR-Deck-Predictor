require('dotenv').config();
const connectDB = require('../db');
const Deck = require('../models/decks');

const clearDecks = async () => {
  try {
    await connectDB();
    
    const result = await Deck.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} existing decks from database`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing decks:', err.message);
    process.exit(1);
  }
};

clearDecks();