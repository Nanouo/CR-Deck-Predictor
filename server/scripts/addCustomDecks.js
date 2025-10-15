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
    name: "Mega Knight Wizard Furnace Barrel Bait",
    cards: ["Mega Knight", "Wizard", "Furnace", "Goblin Barrel", "Skeleton Army", "Arrows", "The Log", "Barbarian Barrel"],
    description: "Mega Knight bait with Wizard and Furnace"
  },
  {
    name: "Magical Trio Wall Breakers Sus Bush Berserker",
    cards: ["Wall Breakers", "Dart Goblin", "Goblin Barrel", "Suspicious Bush", "Berserker", "Wizard", "Ice Spirit", "Barbarian Barrel"],
    description: "Wall Breakers Barrel with Berserker"
  },
  {
    name: "Disturbed Graves Evo Witch Bowler Barrel",
    cards: ["Witch", "Firecracker", "Goblin Barrel", "Knight", "Bowler", "Magic Archer", "Bomber", "The Log"],
    description: "Evo Witch Bowler Barrel bait"
  },
  {
    name: "Prince Log Bait",
    cards: ["Goblin Barrel", "Prince", "Rascals", "Knight", "Princess", "Dart Goblin", "Goblin Gang", "The Log"],
    description: "Log bait with Prince"
  },
  {
    name: "Goblin Demolisher Mega Knight Evo Firecracker",
    cards: ["Firecracker", "Goblin Barrel", "Miner", "Mega Knight", "Goblin Demolisher", "Goblin Gang", "Electro Spirit", "Arrows"],
    description: "Mega Knight bait with Goblin Demolisher"
  },
  {
    name: "Goblin Ladder Barrel Demolisher Dart Gob",
    cards: ["Goblin Giant", "Goblin Barrel", "Goblin Demolisher", "Dart Goblin", "Goblins", "Goblin Cage", "Arrows", "The Log"],
    description: "All goblin cards bait deck"
  },
  {
    name: "Goblin Power Log Bait",
    cards: ["Goblin Giant", "Goblin Barrel", "Dart Goblin", "Goblin Gang", "Goblins", "Goblin Cage", "Arrows", "The Log"],
    description: "Pure goblin synergy bait"
  },
  {
    name: "Goblin Power Barrel Goblin Giant",
    cards: ["Goblin Giant", "Goblin Barrel", "Goblin Gang", "Goblins", "Spear Goblins", "Goblin Cage", "Arrows", "The Log"],
    description: "Goblin Giant with all goblin cards"
  },
  {
    name: "Spell Cauldron Log Bait Poison",
    cards: ["Knight", "Skeletons", "Goblin Barrel", "Princess", "Goblin Gang", "Inferno Tower", "Poison", "The Log"],
    description: "Classic log bait with Poison"
  },
  {
    name: "Love Sparks Bait spam",
    cards: ["Firecracker", "Skeletons", "Goblin Barrel", "Skeleton Barrel", "Inferno Dragon", "Ice Spirit", "Arrows", "The Log"],
    description: "Dual barrel bait spam"
  },
  {
    name: "Princess Skeleton Barrel Evo Knight Bait",
    cards: ["Knight", "Goblin Barrel", "Skeleton Barrel", "Princess", "Dart Goblin", "Skeleton Army", "Inferno Tower", "The Log"],
    description: "Dual barrel bait with Evo Knight"
  },
  {
    name: "Princess Royal Recruits Rascals Bait",
    cards: ["Royal Recruits", "Goblin Barrel", "Wall Breakers", "Rascals", "Princess", "Dart Goblin", "Goblin Gang", "The Log"],
    description: "Wall Breakers bait with Royal Recruits"
  },
  {
    name: "Chess Royale Goblin Barrel Witch",
    cards: ["Goblin Barrel", "Witch", "Inferno Dragon", "Firecracker", "Dart Goblin", "Mirror", "Fireball", "Arrows"],
    description: "Barrel bait with Witch and Mirror"
  },
  {
    name: "Goblin Outbreak Barrel Cage Mighty Miner",
    cards: ["Goblin Barrel", "Mighty Miner", "Dart Goblin", "Goblins", "Ice Spirit", "Goblin Cage", "Arrows", "The Log"],
    description: "Mighty Miner goblin bait"
  },
  {
    name: "Goblin Outbreak Barrel Mega Knight Cage",
    cards: ["Goblin Barrel", "Skeleton Barrel", "Mega Knight", "Bats", "Dart Goblin", "Goblin Gang", "Goblin Cage", "Zap"],
    description: "Mega Knight bait with dual barrel"
  },
  {
    name: "Goblin Outbreak Giant Hut Cage",
    cards: ["Goblin Giant", "Goblin Barrel", "Dart Goblin", "Goblin Gang", "Goblins", "Spear Goblins", "Goblin Cage", "Goblin Hut"],
    description: "Pure goblin deck with spawners"
  },
  {
    name: "Goblin Outbreak Barrel Cage Mighty Miner Rocket",
    cards: ["Goblin Barrel", "Mighty Miner", "Dart Goblin", "Goblins", "Ice Spirit", "Goblin Cage", "Rocket", "The Log"],
    description: "Mighty Miner goblin bait with Rocket"
  },
  {
    name: "Super Magic Archer Spam bait",
    cards: ["Goblin Barrel", "Skeleton Barrel", "Magic Archer", "Skeletons", "Ice Spirit", "Tombstone", "Fireball", "The Log"],
    description: "Dual barrel with Super Magic Archer"
  },
  {
    name: "Dark Prince Cannon Cart Logbait",
    cards: ["Goblin Barrel", "Cannon Cart", "Dark Prince", "Rascals", "Bandit", "Princess", "Rocket", "Giant Snowball"],
    description: "Log bait with Dark Prince bridge spam"
  },
  {
    name: "3.0 Mighty Miner Bait Cycle with Gobs",
    cards: ["Goblin Barrel", "Mighty Miner", "Princess", "Goblins", "Ice Spirit", "Cannon", "Rocket", "The Log"],
    description: "Fast cycle Mighty Miner bait"
  },
  {
    name: "Nightmare Bats Valk bait",
    cards: ["Goblin Barrel", "Valkyrie", "Ice Wizard", "Dart Goblin", "Skeletons", "Cannon", "Giant Snowball", "Zap"],
    description: "Valkyrie bait with Ice Wizard"
  },
  {
    name: "Mighty Miner Mirror bait",
    cards: ["Goblin Barrel", "Mighty Miner", "Dart Goblin", "Fire Spirit", "Cannon", "Mirror", "Rocket", "The Log"],
    description: "Mighty Miner bait with Mirror"
  },
  {
    name: "Super Mini P.E.K.K.A bait cycle",
    cards: ["Goblin Barrel", "Mini P.E.K.K.A", "Dart Goblin", "Skeletons", "Fire Spirit", "Cannon", "Rocket", "The Log"],
    description: "Mini PEKKA bait cycle"
  },
  {
    name: "Gob-arian's Revenge Skeleton King Zap bait",
    cards: ["Goblin Barrel", "Skeleton Barrel", "Skeleton King", "Dart Goblin", "Skeleton Army", "Bomb Tower", "Fireball", "The Log"],
    description: "Skeleton King dual barrel bait"
  },
  {
    name: "Giant Skeleton Sparky Mirror Bait",
    cards: ["Goblin Barrel", "Skeleton King", "Giant Skeleton", "Sparky", "Hunter", "Skeleton Army", "Mirror", "Tornado"],
    description: "Heavy bait with Giant Skeleton and Sparky"
  },
  {
    name: "Mighty Miner Tesla bait",
    cards: ["Goblin Barrel", "Mighty Miner", "Princess", "Guards", "Electro Spirit", "Tesla", "Rocket", "The Log"],
    description: "Mighty Miner bait with Tesla"
  },
  {
    name: "Valk Rocket Inferno bait",
    cards: ["Goblin Barrel", "Valkyrie", "Princess", "Guards", "Electro Spirit", "Inferno Tower", "Rocket", "The Log"],
    description: "Valkyrie Rocket Inferno control bait"
  },
  {
    name: "Valk Skeleton Barrel Inferno bait",
    cards: ["Goblin Barrel", "Skeleton Barrel", "Valkyrie", "Princess", "Dart Goblin", "Skeleton Army", "Inferno Tower", "The Log"],
    description: "Valkyrie dual barrel bait"
  },
  {
    name: "Magic Archer Princess bait",
    cards: ["Goblin Barrel", "Valkyrie", "Magic Archer", "Princess", "Skeleton Army", "Tesla", "Fireball", "The Log"],
    description: "Magic Archer Princess bait control"
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