// Export MongoDB decks to JSON file for backup/sharing
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Deck = require('../models/decks');
const connectDB = require('../db');

async function exportDatabase() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Fetch all decks
    const decks = await Deck.find({});
    console.log(`📊 Found ${decks.length} decks in database`);

    // Convert to plain objects (remove MongoDB metadata)
    const plainDecks = decks.map(deck => ({
      name: deck.name,
      cards: deck.cards,
      averageElixir: deck.averageElixir,
      winCondition: deck.winCondition
    }));

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../db_backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Write to JSON file
    const backupPath = path.join(backupDir, 'cr_decks_backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(plainDecks, null, 2));

    console.log(`\n✅ Successfully exported ${plainDecks.length} decks to:`);
    console.log(`   ${backupPath}`);
    console.log(`\n📦 File size: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

exportDatabase();
