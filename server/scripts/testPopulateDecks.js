const populateDecks = require('../services/populateDecks');

(async () => {
  try {
    console.log('Running populateDecks...');
    await populateDecks();
    console.log('✅ Deck population completed successfully');
  } catch (err) {
    console.error('❌ Deck population failed:', err.message);
  }
})();