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
    name: "Evo Witch Goblin Hut Vines Graveyard Poison",
    cards: ["Knight", "Witch", "Graveyard", "Ice Wizard", "Goblin Hut", "Vines", "Poison", "Barbarian Barrel"],
    description: "Graveyard control with Evo Witch"
  },
  {
    name: "Vines Evo Baby Dragon Graveyard Poison",
    cards: ["Knight", "Baby Dragon", "Graveyard", "Ice Wizard", "Goblin Hut", "Vines", "Poison", "Barbarian Barrel"],
    description: "Graveyard control with Evo Baby Dragon"
  },
  {
    name: "Evo Furnace Berserker Graveyard Poison",
    cards: ["Knight", "Furnace", "Graveyard", "Berserker", "Ice Spirit", "Goblin Hut", "Poison", "Barbarian Barrel"],
    description: "Graveyard control with Evo Furnace"
  },
  {
    name: "Spirit Empress Evo Witch Gob Hut Graveyard",
    cards: ["Knight", "Witch", "Graveyard", "Spirit Empress", "Skeletons", "Goblin Hut", "Poison", "Barbarian Barrel"],
    description: "Graveyard with Spirit Empress"
  },
  {
    name: "Evo Witch Gob Hut Graveyard Poison",
    cards: ["Knight", "Witch", "Graveyard", "Ice Wizard", "Skeletons", "Goblin Hut", "Poison", "Barbarian Barrel"],
    description: "Graveyard control with Evo Witch"
  },
  {
    name: "Evo Exe Splashyard Freeze",
    cards: ["Executioner", "Skeletons", "Graveyard", "Skeleton King", "Bowler", "Inferno Dragon", "Freeze", "Tornado"],
    description: "Splashyard with Evo Executioner and Freeze"
  },
  {
    name: "Evo Witch Giant Graveyard Snowball",
    cards: ["Witch", "Giant Snowball", "Giant", "Graveyard", "Bowler", "Minions", "Guards", "Arrows"],
    description: "Giant Graveyard with Evo Witch"
  },
  {
    name: "Evo Cannon Goblinstein splashyard",
    cards: ["Knight", "Cannon", "Graveyard", "Goblinstein", "Ice Wizard", "Poison", "Tornado", "Barbarian Barrel"],
    description: "Splashyard with Evo Cannon and Goblinstein"
  },
  {
    name: "Evo Cage Goblinstein Splashyard",
    cards: ["Skeletons", "Goblin Cage", "Graveyard", "Goblinstein", "Ice Wizard", "Poison", "Tornado", "Barbarian Barrel"],
    description: "Splashyard with Evo Cage and Goblinstein"
  },
  {
    name: "Goblinstein Evo Cage Graveyard Freeze",
    cards: ["Bomber", "Goblin Cage", "Graveyard", "Goblinstein", "Ice Wizard", "Freeze", "Tornado", "Barbarian Barrel"],
    description: "Graveyard Freeze with Goblinstein"
  },
  {
    name: "Goblinstein Evo Cage Graveyard Poison",
    cards: ["Knight", "Goblin Cage", "Graveyard", "Goblinstein", "Baby Dragon", "Skeletons", "Poison", "Barbarian Barrel"],
    description: "Graveyard control with Goblinstein"
  },
  {
    name: "Sudden death Evo Wizard Splashyard",
    cards: ["Knight", "Wizard", "Graveyard", "Bowler", "Mother Witch", "Inferno Dragon", "Freeze", "Tornado"],
    description: "Splashyard with Evo Wizard"
  },
  {
    name: "Evo Goblin Cage Splash Yard",
    cards: ["Knight", "Goblin Cage", "Graveyard", "Ice Wizard", "Baby Dragon", "Poison", "Tornado", "Barbarian Barrel"],
    description: "Splashyard with Evo Goblin Cage"
  },
  {
    name: "Triple Elixir Graveyard Splash Tesla",
    cards: ["Valkyrie", "Tesla", "Graveyard", "Bowler", "Executioner", "Phoenix", "Poison", "Tornado"],
    description: "Triple splash Graveyard with Tesla"
  },
  {
    name: "Splashyard with Void",
    cards: ["Graveyard", "Knight", "Ice Wizard", "Baby Dragon", "Tombstone", "Void", "Tornado", "Barbarian Barrel"],
    description: "Classic Splashyard with Void"
  }
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