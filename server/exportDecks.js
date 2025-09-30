require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Deck = require('./models/decks'); // adjust if your model is elsewhere

const exportDecks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const decks = await Deck.find({});
    const jsonData = JSON.stringify(decks, null, 2); // pretty format

    const filePath = path.join(__dirname, './localdata/decks.json');
    fs.writeFileSync(filePath, jsonData);
    console.log(`Exported ${decks.length} decks to localdata/decks.json`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Export failed:', err);
  }
};

exportDecks();