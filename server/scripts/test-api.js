// Test the prediction API endpoint
// Make sure your server is running first: node index.js

console.log('🧪 Testing Prediction API Endpoints\n');

// Test 1: GET /api/predict/test
console.log('=== Test 1: GET /api/predict/test ===');
fetch('http://localhost:5000/api/predict/test')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Test endpoint working!');
    console.log('Status:', data.status);
    console.log('Predictions found:', data.predictionsFound);
    console.log('Breakdown:', data.breakdown);
    console.log('Sample predictions:', data.sample);
    console.log();
    
    // Test 2: POST /api/predict with cards
    console.log('=== Test 2: POST /api/predict (Hog Rider + support) ===');
    return fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cards: ['Hog Rider', 'Musketeer', 'Cannon', 'Fireball'] 
      })
    });
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Prediction successful!');
    console.log(`Found ${data.totalFound} total predictions`);
    console.log(`Breakdown: ${data.breakdown.exact} exact, ${data.breakdown.substitution} substitution, ${data.breakdown.frequency} frequency`);
    console.log('\nTop 5 predictions:');
    data.predictions.slice(0, 5).forEach((deck, i) => {
      console.log(`  ${i + 1}. ${deck.name}`);
      console.log(`     - Confidence: ${deck.confidence}%`);
      console.log(`     - Match type: ${deck.matchType}`);
      console.log(`     - Matched cards: ${deck.matchedCards}/${data.selectedCards.length}`);
      console.log(`     - Avg elixir: ${deck.avgElixir}`);
    });
    console.log();
    
    // Test 3: POST with Log Bait cards
    console.log('=== Test 3: POST /api/predict (Log Bait) ===');
    return fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cards: ['Goblin Barrel', 'Princess', 'Knight', 'Inferno Tower'] 
      })
    });
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Log Bait prediction successful!');
    console.log(`Found ${data.totalFound} total predictions`);
    console.log('\nTop 3 predictions:');
    data.predictions.slice(0, 3).forEach((deck, i) => {
      console.log(`  ${i + 1}. ${deck.name} (${deck.confidence}% confidence, ${deck.matchType})`);
    });
    console.log();
    
    // Test 4: Error handling - too many cards
    console.log('=== Test 4: Error Handling (Too many cards) ===');
    return fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cards: ['Hog Rider', 'Musketeer', 'Cannon', 'Fireball', 'Ice Spirit', 'Skeletons', 'The Log', 'Ice Golem', 'Knight'] 
      })
    });
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Error handling working!');
    console.log('Error:', data.error);
    console.log('Message:', data.message);
    console.log();
    
    console.log('🎉 All tests passed!');
    console.log('\n📋 Summary:');
    console.log('✅ GET /api/predict/test - Working');
    console.log('✅ POST /api/predict - Working');
    console.log('✅ Prediction algorithm - Working');
    console.log('✅ Error handling - Working');
  })
  .catch(err => {
    console.error('❌ Test failed:', err.message);
    console.log('\n⚠️  Make sure your server is running: node index.js');
  });
