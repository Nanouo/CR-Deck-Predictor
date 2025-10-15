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
    name: "PEKKA Zap bridge spam",
    cards: ["Battle Ram", "P.E.K.K.A", "Royal Ghost", "Bandit", "Electro Wizard", "Magic Archer", "Fireball", "Zap"],
    description: "P.E.K.K.A bridge spam"
  },
  {
    name: "Double Elixir Loon Freeze",
    cards: ["Balloon", "Lumberjack", "Bowler", "Inferno Dragon", "Electro Dragon", "Freeze", "Tornado", "Barbarian Barrel"],
    description: "Lumberloon Freeze beatdown"
  },
  {
    name: "Mighty Miner Firecracker Hog",
    cards: ["Hog Rider", "Mighty Miner", "Firecracker", "Goblins", "Ice Spirit", "Bomb Tower", "Earthquake", "The Log"],
    description: "Hog cycle with Mighty Miner"
  },
  {
    name: "Splashyard with Barb barrel",
    cards: ["Graveyard", "Knight", "Ice Wizard", "Baby Dragon", "Tombstone", "Poison", "Tornado", "Barbarian Barrel"],
    description: "Classic Splashyard"
  },
  {
    name: "Skeleton King Mortar Bait",
    cards: ["Mortar", "Skeleton Barrel", "Skeleton King", "Cannon Cart", "Dart Goblin", "Skeleton Army", "Goblin Gang", "Fireball"],
    description: "Mortar bait with Skeleton King"
  },
  {
    name: "Golden Knight 3M eBarbs Pump",
    cards: ["Three Musketeers", "Golden Knight", "Elite Barbarians", "Royal Ghost", "Bandit", "Heal Spirit", "Elixir Collector", "Barbarian Barrel"],
    description: "3M spam with Golden Knight"
  },
  {
    name: "Phoenix Goblin Hut Rascals Graveyard",
    cards: ["Graveyard", "Skeleton King", "Rascals", "Phoenix", "Goblins", "Goblin Hut", "Poison", "Barbarian Barrel"],
    description: "Graveyard with Phoenix and spawners"
  },
  {
    name: "Skeleton King Giant Sparky Barbarians",
    cards: ["Giant", "Graveyard", "Skeleton King", "Sparky", "Hunter", "Zappies", "Barbarians", "Arrows"],
    description: "Giant Graveyard Sparky"
  },
  {
    name: "GobHut Witch Heist spam",
    cards: ["Valkyrie", "Witch", "Inferno Dragon", "Electro Dragon", "Flying Machine", "Goblin Hut", "Poison", "Royal Delivery"],
    description: "Spawner spam with Witch"
  },
  {
    name: "Mega Monk Prince Phoenix Rage",
    cards: ["Prince", "Phoenix", "Zappies", "Electro Dragon", "Skeleton Army", "Tombstone", "Rage", "Poison"],
    description: "Prince Phoenix Rage beatdown"
  },
  {
    name: "Golem NW Lumberjack",
    cards: ["Golem", "Elite Barbarians", "Lumberjack", "Night Witch", "Mega Minion", "Bomber", "Arrows", "Zap"],
    description: "Golem beatdown with Lumberjack"
  },
  {
    name: "Lumberloon Bait Cycle",
    cards: ["Balloon", "Lumberjack", "Bats", "Princess", "Goblins", "Ice Spirit", "Barbarian Barrel", "Giant Snowball"],
    description: "Fast Lumberloon cycle"
  },
  {
    name: "Magic Archer Princess Bridge spam",
    cards: ["Goblin Drill", "Wall Breakers", "Royal Recruits", "Elite Barbarians", "Royal Ghost", "Bandit", "Magic Archer", "Princess"],
    description: "Bridge spam with Magic Archer"
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