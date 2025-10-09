require('dotenv').config();
const connectDB = require('../db');
const fs = require('fs');
const path = require('path');
const Deck = require('../models/decks');

connectDB();

// Load card data for validation and elixir calculation
const cardsPath = path.join(__dirname, '../localdata/cards.json');
const cardData = JSON.parse(fs.readFileSync(cardsPath));

const calculateDeckStats = (cardNames) => {
  const cardDocs = cardData.filter(card => cardNames.includes(card.name));
  const winConditions = cardDocs.filter(card => card.wincon).map(card => card.name);
  const totalElixir = cardDocs.reduce((sum, card) => sum + card.elixirCost, 0);
  const avgElixir = (totalElixir / cardDocs.length).toFixed(1);

  return { avgElixir, winConditions };
};

const validateDeck = (cards) => {
  if (!Array.isArray(cards) || cards.length !== 8) {
    throw new Error('Deck must contain exactly 8 cards');
  }

  const validCards = cardData.map(card => card.name);
  const invalidCards = cards.filter(card => !validCards.includes(card));
  
  if (invalidCards.length > 0) {
    throw new Error(`Invalid cards found: ${invalidCards.join(', ')}`);
  }

  return true;
};

// ADD YOUR CUSTOM DECKS HERE
// Just modify this array with your own deck combinations
const customDecks = [
  {
    name: "Your Custom Deck Name",
    cards: ["Giant", "Wizard", "Musketeer", "Fireball", "Zap", "Skeletons", "Ice Spirit", "Cannon"],
    description: "Description of your deck strategy"
  },
  // Add more decks here following the same format:
  // {
  //   name: "Another Deck",
  //   cards: ["Card1", "Card2", "Card3", "Card4", "Card5", "Card6", "Card7", "Card8"],
  //   description: "Deck description"
  // }
];

const addCustomDecks = async () => {
  console.log('Adding custom decks...');

  try {
    const deckBatch = [];

    for (const deck of customDecks) {
      console.log(`Processing: ${deck.name}`);
      
      // Validate deck
      validateDeck(deck.cards);
      
      // Calculate stats
      const { avgElixir, winConditions } = calculateDeckStats(deck.cards);
      
      // Check if deck already exists
      const existingDeck = await Deck.findOne({ 
        cards: { $all: deck.cards, $size: 8 }
      });
      
      if (existingDeck) {
        console.log(`⚠️ Deck "${deck.name}" already exists, skipping...`);
        continue;
      }

      deckBatch.push({
        cards: deck.cards,
        sourcePlayer: "Custom Deck",
        towerTroops: 'default',
        name: deck.name,
        description: deck.description,
        avgElixir: parseFloat(avgElixir),
        winConditions: winConditions,
        isMetaDeck: false // Custom decks are not meta decks
      });

      console.log(`✅ Added: ${deck.name} (${winConditions.join(', ') || 'No Win Con'} — ${avgElixir})`);
    }

    if (deckBatch.length > 0) {
      await Deck.insertMany(deckBatch);
      console.log(`🎉 Successfully inserted ${deckBatch.length} custom decks!`);
    } else {
      console.log('⚠️ No new decks to insert (all already exist)');
    }

  } catch (err) {
    console.error('❌ Error adding custom decks:', err.message);
  }

  console.log('Custom deck addition complete.');
  process.exit(0);
};

addCustomDecks();