const mongoose = require('mongoose');

// Create a new mongoose connection to avoid conflicts
const db = mongoose.createConnection('mongodb://localhost:27017/cr_decks');

db.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Define the Deck schema directly
const deckSchema = new mongoose.Schema({
  name: String,
  cards: [String],
  avgElixir: Number,
  winConditions: [String],
  archetype: String,
  description: String
});

const Deck = db.model('Deck', deckSchema);

async function countWinConditions() {
  try {
    // Wait for connection to be ready
    await new Promise((resolve) => {
      if (db.readyState === 1) {
        resolve();
      } else {
        db.once('open', resolve);
      }
    });

    console.log('\n🔍 Analyzing win conditions across all decks...\n');

    // Get all decks
    const allDecks = await Deck.find({});
    console.log(`📊 Total decks in database: ${allDecks.length}\n`);

    // Count decks by win condition combinations
    const winConditionCounts = {};

    allDecks.forEach(deck => {
      if (deck.winConditions && deck.winConditions.length > 0) {
        // Sort win conditions alphabetically for consistent grouping
        const winConKey = deck.winConditions.sort().join(' + ');
        
        if (!winConditionCounts[winConKey]) {
          winConditionCounts[winConKey] = {
            count: 0,
            examples: []
          };
        }
        
        winConditionCounts[winConKey].count++;
        
        // Store first 2 deck names as examples
        if (winConditionCounts[winConKey].examples.length < 2) {
          winConditionCounts[winConKey].examples.push(deck.name);
        }
      }
    });

    // Sort by count (descending)
    const sortedWinConditions = Object.entries(winConditionCounts)
      .sort((a, b) => b[1].count - a[1].count);

    // Display results
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                   WIN CONDITION ANALYSIS                  ');
    console.log('═══════════════════════════════════════════════════════════\n');

    sortedWinConditions.forEach(([winCon, data], index) => {
      const deckWord = data.count === 1 ? 'deck' : 'decks';
      console.log(`${index + 1}. ${data.count} ${deckWord} with: ${winCon}`);
      
      if (data.examples.length > 0) {
        console.log(`   Examples: ${data.examples.join(', ')}`);
      }
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════\n');

    // Summary statistics
    const totalWithWinCons = sortedWinConditions.reduce((sum, [_, data]) => sum + data.count, 0);
    const decksWithoutWinCons = allDecks.length - totalWithWinCons;
    
    console.log(`📈 Summary:`);
    console.log(`   - Decks with win conditions: ${totalWithWinCons}`);
    console.log(`   - Decks without win conditions: ${decksWithoutWinCons}`);
    console.log(`   - Unique win condition combinations: ${sortedWinConditions.length}`);

    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error analyzing win conditions:', error);
    await db.close();
    process.exit(1);
  }
}

// Run the analysis
countWinConditions();
