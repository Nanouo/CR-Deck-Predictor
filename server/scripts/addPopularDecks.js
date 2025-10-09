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

  const deckName = winConditions.length
    ? `${winConditions.join(', ')} — ${avgElixir}`
    : `No Win Condition — ${avgElixir}`;

  return { deckName, avgElixir, winConditions };
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

const addPopularDecks = async () => {
  console.log('Adding popular meta decks...');

  // Popular meta decks - you can modify these or add more
  const popularDecks = [
    {
      name: "Log Bait Classic",
      cards: ["Goblin Barrel", "Princess", "The Log", "Rocket", "Goblin Gang", "Ice Spirit", "Inferno Tower", "Knight"],
      sourcePlayer: "Meta Deck",
      description: "Classic Log Bait deck with Goblin Barrel as win condition"
    },
    {
      name: "Hog 2.6 Cycle",
      cards: ["Hog Rider", "Ice Golem", "Ice Spirit", "Skeletons", "Musketeer", "Fireball", "The Log", "Cannon"],
      sourcePlayer: "Meta Deck",
      description: "Fast cycle Hog Rider deck"
    },
    {
      name: "Giant Double Prince",
      cards: ["Giant", "Prince", "Dark Prince", "Mega Minion", "Elixir Collector", "Poison", "Zap", "Electro Wizard"],
      sourcePlayer: "Meta Deck",
      description: "Beatdown deck with Giant and both Princes"
    },
    {
      name: "X-Bow 2.9",
      cards: ["X-Bow", "Tesla", "Ice Golem", "Ice Spirit", "Skeletons", "Archers", "The Log", "Fireball"],
      sourcePlayer: "Meta Deck",
      description: "Defensive X-Bow siege deck"
    },
    {
      name: "Golem Night Witch",
      cards: ["Golem", "Night Witch", "Baby Dragon", "Mega Minion", "Lightning", "Tornado", "Lumberjack", "Elixir Collector"],
      sourcePlayer: "Meta Deck",
      description: "Heavy beatdown with Golem"
    }
  ];

  try {
    const deckBatch = [];

    for (const deck of popularDecks) {
      console.log(`Processing: ${deck.name}`);
      
      // Validate deck
      validateDeck(deck.cards);
      
      // Calculate stats
      const { deckName, avgElixir, winConditions } = calculateDeckStats(deck.cards);
      
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
        sourcePlayer: deck.sourcePlayer,
        towerTroops: 'default',
        name: deck.name, // Use custom name instead of auto-generated
        description: deck.description,
        avgElixir: parseFloat(avgElixir),
        winConditions: winConditions,
        isMetaDeck: true // Flag to identify manually added meta decks
      });

      console.log(`✅ Added: ${deck.name} (${winConditions.join(', ') || 'No Win Con'} — ${avgElixir})`);
    }

    if (deckBatch.length > 0) {
      await Deck.insertMany(deckBatch);
      console.log(`🎉 Successfully inserted ${deckBatch.length} popular meta decks!`);
    } else {
      console.log('⚠️ No new decks to insert (all already exist)');
    }

  } catch (err) {
    console.error('❌ Error adding popular decks:', err.message);
  }

  console.log('Popular deck addition complete.');
  process.exit(0);
};

addPopularDecks();