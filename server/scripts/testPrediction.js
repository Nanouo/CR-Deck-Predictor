require('dotenv').config();
const connectDB = require('../db');
const { predictDeck } = require('../services/deckPrediction');

connectDB();

async function testPrediction() {
  console.log('🧪 Testing Deck Prediction Service\n');
  
  // Test 1: Exact match test (common Hog Rider cards)
  console.log('=== Test 1: Hog Rider + Common Cards ===');
  const test1 = await predictDeck(['Hog Rider', 'Musketeer', 'Fireball', 'The Log']);
  console.log(`Found ${test1.totalFound} predictions`);
  console.log(`Breakdown: ${test1.breakdown.exact} exact, ${test1.breakdown.substitution} substitution, ${test1.breakdown.frequency} frequency`);
  if (test1.predictions.length > 0) {
    console.log('Top prediction:', test1.predictions[0].name, `(${test1.predictions[0].matchType}, ${test1.predictions[0].confidence}% confidence)`);
  }
  console.log();
  
  // Test 2: Log Bait test
  console.log('=== Test 2: Log Bait Cards ===');
  const test2 = await predictDeck(['Goblin Barrel', 'Princess', 'Knight']);
  console.log(`Found ${test2.totalFound} predictions`);
  console.log(`Breakdown: ${test2.breakdown.exact} exact, ${test2.breakdown.substitution} substitution, ${test2.breakdown.frequency} frequency`);
  if (test2.predictions.length > 0) {
    console.log('Top 3 predictions:');
    test2.predictions.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.matchType}, ${p.confidence}% confidence, ${p.matchedCards}/${test2.selectedCards.length} cards matched)`);
    });
  }
  console.log();
  
  // Test 3: Single card
  console.log('=== Test 3: Single Card (Mega Knight) ===');
  const test3 = await predictDeck(['Mega Knight']);
  console.log(`Found ${test3.totalFound} predictions`);
  console.log(`Breakdown: ${test3.breakdown.exact} exact, ${test3.breakdown.substitution} substitution, ${test3.breakdown.frequency} frequency`);
  if (test3.predictions.length > 0) {
    console.log('Top prediction:', test3.predictions[0].name, `(${test3.predictions[0].matchType}, ${test3.predictions[0].confidence}% confidence)`);
  }
  console.log();
  
  // Test 4: Substitution test (cards with substitutes)
  console.log('=== Test 4: Substitution Test (Arrows vs Zap) ===');
  const test4 = await predictDeck(['Arrows', 'Ice Spirit']);
  console.log(`Found ${test4.totalFound} predictions`);
  console.log(`Breakdown: ${test4.breakdown.exact} exact, ${test4.breakdown.substitution} substitution, ${test4.breakdown.frequency} frequency`);
  if (test4.predictions.length > 0) {
    console.log('Top prediction:', test4.predictions[0].name, `(${test4.predictions[0].matchType}, ${test4.predictions[0].confidence}% confidence)`);
  }
  
  console.log('\n✅ Test complete!');
  process.exit(0);
}

// Wait for DB connection
setTimeout(testPrediction, 2000);
