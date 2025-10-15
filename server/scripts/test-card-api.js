/**
 * Quick API test for card prediction endpoint
 */

const testEndpoint = async () => {
  try {
    console.log('🧪 Testing Card Prediction API\n');
    
    // TEST 1: One card
    console.log('TEST 1: Single card (Hog Rider)');
    console.log('-'.repeat(60));
    const response1 = await fetch('http://localhost:5000/api/predict/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: ['Hog Rider'] })
    });
    const result1 = await response1.json();
    console.log(JSON.stringify(result1, null, 2));
    console.log('\n');
    
    // TEST 2: Three cards (Hog 2.6 core)
    console.log('TEST 2: Three cards (Hog 2.6 core)');
    console.log('-'.repeat(60));
    const response2 = await fetch('http://localhost:5000/api/predict/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: ['Hog Rider', 'Musketeer', 'Cannon'] })
    });
    const result2 = await response2.json();
    console.log(JSON.stringify(result2, null, 2));
    console.log('\n');
    
    // TEST 3: Seven cards
    console.log('TEST 3: Seven cards (Hog 2.6 missing Ice Golem)');
    console.log('-'.repeat(60));
    const response3 = await fetch('http://localhost:5000/api/predict/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cards: ['Hog Rider', 'Musketeer', 'Cannon', 'Ice Spirit', 'Skeletons', 'Fireball', 'The Log'] 
      })
    });
    const result3 = await response3.json();
    console.log(JSON.stringify(result3, null, 2));
    console.log('\n');
    
    // TEST 4: Incompatible cards
    console.log('TEST 4: Incompatible cards');
    console.log('-'.repeat(60));
    const response4 = await fetch('http://localhost:5000/api/predict/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: ['Golem', 'Hog Rider', 'X-Bow'] })
    });
    const result4 = await response4.json();
    console.log(JSON.stringify(result4, null, 2));
    console.log('\n');
    
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testEndpoint();
