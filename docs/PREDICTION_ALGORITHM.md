# Deck Prediction Algorithm

## Overview
A 3-tier intelligent deck prediction system for Clash Royale that recommends complete decks based on user-selected cards.

## Architecture

### Tier 1: Exact Match (Highest Confidence - 100%)
- Finds decks that contain **ALL** selected cards
- Most reliable predictions
- Returns up to 20 matches
- Example: User selects [Hog Rider, Musketeer, Fireball, Log] → Finds "Hog 2.6 Cycle"

### Tier 2: Substitution Match (Medium Confidence - 50-85%)
- Uses card substitution system from `cards.json`
- Finds decks with similar card roles
- Example: User has "Arrows" → Also searches for decks with "The Log", "Giant Snowball", etc.
- Scoring system:
  - Direct match: 10 points
  - Substitute match: 7 points
- Requires at least 50% card match
- Returns up to 15 matches

### Tier 3: Frequency-Based (Lower Confidence - 0-70%)
- Analyzes card co-occurrence patterns across all decks
- Predicts which cards commonly appear together
- Useful when few exact matches exist
- Returns up to 10 matches
- Sorted by:
  1. Number of matched cards
  2. Frequency score of remaining cards

## API Endpoint

### POST `/api/predict`

**Request:**
```json
{
  "cards": ["Hog Rider", "Musketeer", "Fireball", "The Log"]
}
```

**Response:**
```json
{
  "predictions": [
    {
      "_id": "...",
      "name": "Hog 2.6 Cycle",
      "cards": ["Hog Rider", "Musketeer", "Cannon", "Ice Spirit", "Ice Golem", "Skeletons", "Fireball", "The Log"],
      "avgElixir": 2.6,
      "winConditions": ["Hog Rider"],
      "matchType": "exact",
      "confidence": 100,
      "matchedCards": 4
    },
    ...
  ],
  "selectedCards": ["Hog Rider", "Musketeer", "Fireball", "The Log"],
  "totalFound": 21,
  "breakdown": {
    "exact": 3,
    "substitution": 15,
    "frequency": 10
  }
}
```

## Response Fields

- `matchType`: `"exact"` | `"substitution"` | `"frequency"`
- `confidence`: 0-100 score indicating prediction reliability
- `matchedCards`: Number of user's cards found in the deck
- `totalFound`: Total unique predictions across all tiers
- `breakdown`: Count of predictions per tier

## Card Substitution System

Currently tagged cards with substitutes:
- **Arrows** → Giant Vines, The Log, Giant Snowball
- **Zap** → The Log, Barbarian Barrel, Giant Snowball
- **Giant Snowball** → Zap, Arrows, The Log
- **Skeletons** → Ice Spirit, Fire Spirit
- **Ice Spirit** → Fire Spirit, Electro Spirit, Heal Spirit, Skeletons
- **Fire Spirit** → Ice Spirit, Electro Spirit, Heal Spirit
- **Electro Spirit** → Ice Spirit, Fire Spirit, Heal Spirit
- **Heal Spirit** → Ice Spirit, Fire Spirit, Electro Spirit
- **Fireball** → Poison, Rocket, Lightning

## Database Stats
- **Total Decks**: 213
- **Sources**: 
  - Top player decks (global)
  - Meta decks
  - Custom curated decks
- **Archetypes**: Cycle, Beatdown, Control, Bait, Bridge Spam, etc.

## Test Results

✅ **Test 1**: Hog Rider + 3 common cards → 21 predictions (3 exact, 15 substitution, 10 frequency)
✅ **Test 2**: Log Bait (Goblin Barrel, Princess, Knight) → 12 predictions (8 exact)
✅ **Test 3**: Single card (Mega Knight) → 24 predictions (20 exact)
✅ **Test 4**: Substitution test (Arrows, Ice Spirit) → 19 predictions (4 exact, 15 substitution)

## Future Enhancements

1. **Expand Substitution Tagging**
   - Add more cards with substitutes (buildings, win conditions)
   - Create substitution groups (e.g., "mini-tanks", "splash units")

2. **Win Condition Detection**
   - Prioritize decks that include win conditions
   - Ensure predicted decks are viable (not just defensive cards)

3. **Meta Weighting**
   - Give higher scores to meta decks
   - Track deck performance/popularity

4. **User Feedback Loop**
   - Let users rate predictions
   - Improve algorithm based on ratings

5. **Archetype Classification**
   - Tag decks by archetype (Cycle, Beatdown, etc.)
   - Filter predictions by preferred archetype

6. **Elixir Balance**
   - Ensure predicted decks have reasonable elixir curves
   - Avoid all high-cost or all low-cost recommendations

## Files Modified/Created

### Created:
- `/server/services/deckPrediction.js` - Core prediction algorithm
- `/server/scripts/testPrediction.js` - Test suite
- `/server/scripts/addCustomDecks.js` - Deck addition utility (cleaned)

### Modified:
- `/server/index.js` - Added `/api/predict` endpoint
- `/server/localdata/cards.json` - Added Mirror elixirCost: 0

## Usage Example

```javascript
// Client-side fetch example
const selectedCards = ["Hog Rider", "Musketeer", "Fireball"];

fetch('/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cards: selectedCards })
})
.then(r => r.json())
.then(data => {
  console.log(`Found ${data.totalFound} predictions`);
  data.predictions.forEach(deck => {
    console.log(`${deck.name} - ${deck.confidence}% confidence`);
  });
});
```

---

**Status**: ✅ Core algorithm implemented and tested
**Next Steps**: Integrate with frontend UI for user interaction
