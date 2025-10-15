require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Deck = require('../models/decks');

async function importDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read the backup file
    const backupPath = path.join(__dirname, '../db_backup/cr_decks_backup.json');
    const fileContent = await fs.readFile(backupPath, 'utf-8');
    const decks = JSON.parse(fileContent);
    
    console.log(`📊 Found ${decks.length} decks in backup file`);

    // Ask user for import strategy
    console.log('\n⚠️  Import Options:');
    console.log('1. Clear existing decks and import backup (recommended for fresh start)');
    console.log('2. Add backup decks to existing collection (may create duplicates)');
    
    // For automation, we'll clear and import (option 1)
    // If you want to keep existing decks, comment out the deleteMany line
    
    const existingCount = await Deck.countDocuments();
    console.log(`\n📊 Current database has ${existingCount} decks`);
    
    // Clear existing decks
    console.log('🗑️  Clearing existing decks...');
    await Deck.deleteMany({});
    console.log('✅ Cleared existing decks');

    // Import decks
    console.log('📥 Importing decks from backup...');
    const result = await Deck.insertMany(decks);
    
    console.log(`✅ Successfully imported ${result.length} decks`);
    console.log('🎉 Database import completed!');

  } catch (error) {
    console.error('❌ Error importing database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

importDatabase();
