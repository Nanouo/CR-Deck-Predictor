const express = require('express');
const router = express.Router();
const { predictDeck, predictNextCards } = require('../services/deckPrediction');

/**
 * POST /api/predict
 * Predict deck completions based on selected cards
 * 
 * Request body:
 * {
 *   "cards": ["Hog Rider", "Musketeer", "Fireball"]
 * }
 * 
 * Response:
 * {
 *   "predictions": [...],
 *   "selectedCards": [...],
 *   "totalFound": 21,
 *   "breakdown": { "exact": 3, "substitution": 15, "frequency": 10 }
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { cards } = req.body;
    
    // Validate request
    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Expected { cards: ["Card1", "Card2", ...] }',
        received: typeof cards
      });
    }
    
    // Limit to 8 cards max (full deck)
    if (cards.length > 8) {
      return res.status(400).json({
        error: 'Too many cards',
        message: 'Maximum 8 cards allowed',
        received: cards.length
      });
    }
    
    // Run prediction
    const result = await predictDeck(cards);
    
    // Add request metadata
    result.requestTime = new Date().toISOString();
    result.cardCount = cards.length;
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to generate predictions',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/predict/cards
 * NEW: Predict next cards to add (real-time suggestions)
 * 
 * Request body:
 * {
 *   "cards": ["Hog Rider", "Musketeer"],
 *   "limit": 5  // Optional, default is 5
 * }
 * 
 * Response:
 * {
 *   "suggestedCards": [
 *     { "card": "Cannon", "frequency": 78, "appearsIn": 45 },
 *     { "card": "Ice Spirit", "frequency": 72, "appearsIn": 42 },
 *     ...
 *   ],
 *   "selectedCards": [...],
 *   "cardsNeeded": 6,
 *   "decksAnalyzed": 58
 * }
 */
router.post('/cards', async (req, res) => {
  try {
    const { cards, limit } = req.body;
    
    // Validate request
    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Expected { cards: ["Card1", "Card2", ...] }',
        received: typeof cards
      });
    }
    
    // Limit to 8 cards max (full deck)
    if (cards.length > 8) {
      return res.status(400).json({
        error: 'Too many cards',
        message: 'Maximum 8 cards allowed',
        received: cards.length
      });
    }
    
    // Run card prediction
    const result = await predictNextCards(cards, limit || 5);
    
    // Add request metadata
    result.requestTime = new Date().toISOString();
    result.cardCount = cards.length;
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Card prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to generate card suggestions',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/predict/test
 * Test endpoint to verify prediction service is working
 */
router.get('/test', async (req, res) => {
  try {
    const testCards = ['Hog Rider', 'Musketeer', 'Fireball'];
    const result = await predictDeck(testCards);
    
    res.json({
      status: 'Prediction service is working! ✅',
      testCards,
      predictionsFound: result.totalFound,
      breakdown: result.breakdown,
      sample: result.predictions.slice(0, 3).map(p => ({
        name: p.name,
        confidence: p.confidence,
        matchType: p.matchType
      }))
    });
  } catch (error) {
    res.status(500).json({
      status: 'Prediction service failed ❌',
      error: error.message
    });
  }
});

/**
 * GET /api/predict/cards/test
 * Test endpoint for card suggestions
 */
router.get('/cards/test', async (req, res) => {
  try {
    const testCards = ['Hog Rider'];
    const result = await predictNextCards(testCards, 5);
    
    res.json({
      status: 'Card prediction service is working! ✅',
      testCards,
      suggestedCards: result.suggestedCards,
      decksAnalyzed: result.decksAnalyzed,
      breakdown: result.breakdown
    });
  } catch (error) {
    res.status(500).json({
      status: 'Card prediction service failed ❌',
      error: error.message
    });
  }
});

module.exports = router;
