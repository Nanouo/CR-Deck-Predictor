/**
 * Test script for card prediction functionality
 * Tests the new predictNextCards function with various scenarios
 */

const mongoose = require('mongoose');
const { predictNextCards } = require('../services/deckPrediction');
require('dotenv').config();

async function runTests() {
  console.log('🧪 Testing Card Prediction System\n');
  console.log('='.repeat(60));
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // TEST 1: Single card (should return many suggestions)
    console.log('TEST 1: User enters 1 card');
    console.log('-'.repeat(60));
    const test1 = await predictNextCards(['Hog Rider'], 5);
    console.log(`📥 Input: ["Hog Rider"]`);
    console.log(`🔍 Decks analyzed: ${test1.decksAnalyzed}`);
    console.log(`📊 Breakdown: Exact=${test1.breakdown.exact}, Sub=${test1.breakdown.substitution}, Freq=${test1.breakdown.frequency}`);
    console.log(`💡 Suggestions (${test1.suggestedCards.length}):`);
    test1.suggestedCards.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.card} - ${s.frequency}% (appears in ${s.appearsIn} decks)`);
    });
    console.log('');
    
    // TEST 2: Three cards (popular combo)
    console.log('TEST 2: User enters 3 cards (Hog 2.6 core)');
    console.log('-'.repeat(60));
    const test2 = await predictNextCards(['Hog Rider', 'Musketeer', 'Cannon'], 5);
    console.log(`📥 Input: ["Hog Rider", "Musketeer", "Cannon"]`);
    console.log(`🔍 Decks analyzed: ${test2.decksAnalyzed}`);
    console.log(`📊 Breakdown: Exact=${test2.breakdown.exact}, Sub=${test2.breakdown.substitution}, Freq=${test2.breakdown.frequency}`);
    console.log(`💡 Suggestions (${test2.suggestedCards.length}):`);
    test2.suggestedCards.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.card} - ${s.frequency}% (appears in ${s.appearsIn} decks)`);
    });
    console.log('');
    
    // TEST 3: Seven cards (only 1 slot left)
    console.log('TEST 3: User enters 7 cards (Hog 2.6 missing Ice Golem)');
    console.log('-'.repeat(60));
    const test3 = await predictNextCards([
      'Hog Rider', 'Musketeer', 'Cannon', 'Ice Spirit', 
      'Skeletons', 'Fireball', 'The Log'
    ], 5);
    console.log(`📥 Input: [7 cards from Hog 2.6 Cycle]`);
    console.log(`🔍 Decks analyzed: ${test3.decksAnalyzed}`);
    console.log(`📊 Breakdown: Exact=${test3.breakdown.exact}, Sub=${test3.breakdown.substitution}, Freq=${test3.breakdown.frequency}`);
    console.log(`💡 Suggestions (${test3.suggestedCards.length}):`);
    if (test3.suggestedCards.length === 0) {
      console.log('   ⚠️ No suggestions found (no decks match these 7 cards)');
    } else {
      test3.suggestedCards.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.card} - ${s.frequency}% (appears in ${s.appearsIn} decks)`);
      });
    }
    console.log('');
    
    // TEST 4: Incompatible cards (should return few/no suggestions)
    console.log('TEST 4: User enters incompatible cards');
    console.log('-'.repeat(60));
    const test4 = await predictNextCards(['Golem', 'Hog Rider', 'X-Bow'], 5);
    console.log(`📥 Input: ["Golem", "Hog Rider", "X-Bow"]`);
    console.log(`🔍 Decks analyzed: ${test4.decksAnalyzed}`);
    console.log(`📊 Breakdown: Exact=${test4.breakdown.exact}, Sub=${test4.breakdown.substitution}, Freq=${test4.breakdown.frequency}`);
    console.log(`💡 Suggestions (${test4.suggestedCards.length}):`);
    if (test4.suggestedCards.length === 0) {
      console.log('   ⚠️ No suggestions found (incompatible card combination)');
    } else {
      test4.suggestedCards.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.card} - ${s.frequency}% (appears in ${s.appearsIn} decks)`);
      });
    }
    console.log('');
    
    // TEST 5: Log Bait cards
    console.log('TEST 5: User enters Log Bait core cards');
    console.log('-'.repeat(60));
    const test5 = await predictNextCards(['Princess', 'Goblin Barrel', 'Knight'], 5);
    console.log(`📥 Input: ["Princess", "Goblin Barrel", "Knight"]`);
    console.log(`🔍 Decks analyzed: ${test5.decksAnalyzed}`);
    console.log(`📊 Breakdown: Exact=${test5.breakdown.exact}, Sub=${test5.breakdown.substitution}, Freq=${test5.breakdown.frequency}`);
    console.log(`💡 Suggestions (${test5.suggestedCards.length}):`);
    test5.suggestedCards.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.card} - ${s.frequency}% (appears in ${s.appearsIn} decks)`);
    });
    console.log('');
    
    console.log('='.repeat(60));
    console.log('✅ All tests completed!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run tests
runTests();
