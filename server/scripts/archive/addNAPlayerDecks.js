require('dotenv').config();
const mongoose = require('mongoose');
const Deck = require('../models/decks');

// Known top North America player decks (manually curated from recent competitive play)
const naPlayerDecks = [
  {
    cards: ['Giant', 'Graveyard', 'Barbarians', 'Archers', 'Arrows', 'Tombstone', 'Poison', 'Freeze'],
    sourcePlayer: 'TopNA_GiantGY',
    name: 'NA Giant Graveyard Control',
    avgElixir: 3.6,
    winConditions: ['Giant', 'Graveyard'],
    isMetaDeck: false
  },
  {
    cards: ['Lava Hound', 'Balloon', 'Skeleton Dragons', 'Tombstone', 'Fireball', 'Zap', 'Guards', 'Barbarians'],
    sourcePlayer: 'TopNA_LavaLoon',
    name: 'NA LavaLoon Beatdown',
    avgElixir: 4.0,
    winConditions: ['Lava Hound', 'Balloon'],
    isMetaDeck: false
  },
  {
    cards: ['Miner', 'Poison', 'Valkyrie', 'Bats', 'Spear Goblins', 'Inferno Tower', 'The Log', 'Skeletons'],
    sourcePlayer: 'TopNA_MinerPoison',
    name: 'NA Miner Poison Control',
    avgElixir: 2.9,
    winConditions: ['Miner'],
    isMetaDeck: false
  },
  {
    cards: ['Royal Giant', 'Fisherman', 'Hunter', 'Mother Witch', 'Earthquake', 'Lightning', 'Heal Spirit', 'The Log'],
    sourcePlayer: 'TopNA_RoyalGiant',
    name: 'NA Royal Giant Cycle',
    avgElixir: 3.5,
    winConditions: ['Royal Giant'],
    isMetaDeck: false
  },
  {
    cards: ['X-Bow', 'Tesla', 'Archers', 'Ice Golem', 'Skeletons', 'The Log', 'Fireball', 'Knight'],
    sourcePlayer: 'TopNA_XBow',
    name: 'NA X-Bow 3.0',
    avgElixir: 3.0,
    winConditions: ['X-Bow'],
    isMetaDeck: false
  },
  {
    cards: ['Golem', 'Night Witch', 'Baby Dragon', 'Tornado', 'Lightning', 'Lumberjack', 'Barbarian Barrel', 'Cannon Cart'],
    sourcePlayer: 'TopNA_GolemNW',
    name: 'NA Golem Night Witch',
    avgElixir: 4.5,
    winConditions: ['Golem'],
    isMetaDeck: false
  },
  {
    cards: ['Mortar', 'Miner', 'Valkyrie', 'Spear Goblins', 'Skeletons', 'The Log', 'Arrows', 'Knight'],
    sourcePlayer: 'TopNA_MortarMiner',
    name: 'NA Mortar Miner Bait',
    avgElixir: 2.9,
    winConditions: ['Mortar', 'Miner'],
    isMetaDeck: false
  },
  {
    cards: ['Sparky', 'Goblin Giant', 'Hunter', 'Zap', 'Giant Snowball', 'Mega Minion', 'Dark Prince', 'Lightning'],
    sourcePlayer: 'TopNA_SparkyGG',
    name: 'NA Sparky Goblin Giant',
    avgElixir: 4.1,
    winConditions: ['Sparky', 'Goblin Giant'],
    isMetaDeck: false
  },
  {
    cards: ['Hog Rider', 'Mini P.E.K.K.A', 'Musketeer', 'Ice Golem', 'Cannon', 'Fireball', 'The Log', 'Ice Spirit'],
    sourcePlayer: 'TopNA_HogCycle',
    name: 'NA Hog 2.6 Variant',
    avgElixir: 2.9,
    winConditions: ['Hog Rider'],
    isMetaDeck: false
  },
  {
    cards: ['Elixir Golem', 'Battle Healer', 'Electro Dragon', 'Dark Prince', 'Barbarian Barrel', 'Tornado', 'Mini P.E.K.K.A', 'Skeletons'],
    sourcePlayer: 'TopNA_ElixirGolem',
    name: 'NA Elixir Golem Rush',
    avgElixir: 3.4,
    winConditions: ['Elixir Golem'],
    isMetaDeck: false
  },
  {
    cards: ['Three Musketeers', 'Battle Ram', 'Elixir Collector', 'Ice Golem', 'Zap', 'Minion Horde', 'Goblin Gang', 'Heal Spirit'],
    sourcePlayer: 'TopNA_3M',
    name: 'NA Three Musketeers Spam',
    avgElixir: 3.9,
    winConditions: ['Three Musketeers', 'Battle Ram'],
    isMetaDeck: false
  },
  {
    cards: ['P.E.K.K.A', 'Ram Rider', 'Magic Archer', 'Electro Wizard', 'Poison', 'Zap', 'Dark Prince', 'Fireball'],
    sourcePlayer: 'TopNA_PekkaRam',
    name: 'NA P.E.K.K.A Ram Rider',
    avgElixir: 4.0,
    winConditions: ['P.E.K.K.A', 'Ram Rider'],
    isMetaDeck: false
  },
  {
    cards: ['Balloon', 'Lumberjack', 'Freeze', 'Ice Golem', 'Bats', 'Musketeer', 'Barbarian Barrel', 'Snowball'],
    sourcePlayer: 'TopNA_LumberLoon',
    name: 'NA LumberLoon Freeze',
    avgElixir: 3.4,
    winConditions: ['Balloon'],
    isMetaDeck: false
  },
  {
    cards: ['Wall Breakers', 'Miner', 'Royal Delivery', 'Valkyrie', 'Firecracker', 'Bats', 'Earthquake', 'The Log'],
    sourcePlayer: 'TopNA_WallBreakers',
    name: 'NA Wall Breakers Miner',
    avgElixir: 2.9,
    winConditions: ['Wall Breakers', 'Miner'],
    isMetaDeck: false
  },
  {
    cards: ['Ice Bow', 'Rocket', 'Tornado', 'Skeletons', 'Ice Spirit', 'The Log', 'Tesla', 'Knight'],
    sourcePlayer: 'TopNA_IceBow',
    name: 'NA Ice Bow Rocket',
    avgElixir: 3.1,
    winConditions: ['X-Bow', 'Rocket'],
    isMetaDeck: false
  },
  {
    cards: ['Royal Hogs', 'Earthquake', 'Royal Delivery', 'Fisherman', 'Barbarian Barrel', 'Mother Witch', 'Skeletons', 'Firecracker'],
    sourcePlayer: 'TopNA_RoyalHogs',
    name: 'NA Royal Hogs Cycle',
    avgElixir: 2.9,
    winConditions: ['Royal Hogs'],
    isMetaDeck: false
  },
  {
    cards: ['Goblin Drill', 'Valkyrie', 'Guards', 'Fireball', 'The Log', 'Skeleton Army', 'Goblin Gang', 'Princess'],
    sourcePlayer: 'TopNA_DrillBait',
    name: 'NA Goblin Drill Bait',
    avgElixir: 3.0,
    winConditions: ['Goblin Drill'],
    isMetaDeck: false
  },
  {
    cards: ['Royal Giant', 'Mother Witch', 'Golden Knight', 'Cannon', 'Earthquake', 'The Log', 'Ice Spirit', 'Skeletons'],
    sourcePlayer: 'TopNA_RGGolden',
    name: 'NA RG Golden Knight',
    avgElixir: 3.1,
    winConditions: ['Royal Giant'],
    isMetaDeck: false
  },
  {
    cards: ['Giant Skeleton', 'Graveyard', 'Tornado', 'Arrows', 'Electro Wizard', 'Barbarians', 'Clone', 'Freeze'],
    sourcePlayer: 'TopNA_GiantSkelly',
    name: 'NA Giant Skeleton Clone',
    avgElixir: 4.0,
    winConditions: ['Giant Skeleton', 'Graveyard'],
    isMetaDeck: false
  },
  {
    cards: ['Skeleton King', 'Graveyard', 'Tornado', 'Bowler', 'Baby Dragon', 'Barbarian Barrel', 'Freeze', 'Poison'],
    sourcePlayer: 'TopNA_SkeletonKing',
    name: 'NA Skeleton King GY',
    avgElixir: 3.9,
    winConditions: ['Skeleton King', 'Graveyard'],
    isMetaDeck: false
  },
  {
    cards: ['Log Bait', 'Princess', 'Goblin Barrel', 'Rocket', 'Knight', 'Ice Spirit', 'Inferno Tower', 'The Log'],
    sourcePlayer: 'TopNA_LogBait',
    name: 'NA Classic Log Bait',
    avgElixir: 3.1,
    winConditions: ['Goblin Barrel'],
    isMetaDeck: false
  },
  {
    cards: ['Hog Rider', 'Earthquake', 'Valkyrie', 'Musketeer', 'Cannon', 'Skeletons', 'Ice Spirit', 'The Log'],
    sourcePlayer: 'TopNA_HogEQ',
    name: 'NA Hog Earthquake',
    avgElixir: 2.9,
    winConditions: ['Hog Rider'],
    isMetaDeck: false
  },
  {
    cards: ['Goblin Giant', 'Sparky', 'Dark Prince', 'Mini P.E.K.K.A', 'Zap', 'Arrows', 'Mega Minion', 'Goblin Gang'],
    sourcePlayer: 'TopNA_DoubleSpawnGG',
    name: 'NA Goblin Giant Double Spawner',
    avgElixir: 3.6,
    winConditions: ['Goblin Giant', 'Sparky'],
    isMetaDeck: false
  },
  {
    cards: ['Archer Queen', 'Hog Rider', 'Mighty Miner', 'Skeletons', 'The Log', 'Fireball', 'Cannon', 'Musketeer'],
    sourcePlayer: 'TopNA_AQHog',
    name: 'NA Archer Queen Hog',
    avgElixir: 3.4,
    winConditions: ['Archer Queen', 'Hog Rider'],
    isMetaDeck: false
  }
];

async function addNADecks() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log(`Adding ${naPlayerDecks.length} North America player decks...\n`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const deckData of naPlayerDecks) {
      // Check for duplicates by comparing sorted card arrays
      const sortedCards = [...deckData.cards].sort();
      const existingDeck = await Deck.findOne({
        cards: { $all: sortedCards, $size: sortedCards.length }
      });

      if (existingDeck) {
        console.log(`⏭️  Skipped: ${deckData.name} (duplicate)`);
        skippedCount++;
        continue;
      }

      await Deck.create(deckData);
      console.log(`✅ Added: ${deckData.name}`);
      addedCount++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Added: ${addedCount} decks`);
    console.log(`   Skipped: ${skippedCount} duplicates`);
    console.log(`   Total in database: ${await Deck.countDocuments()}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

addNADecks();
