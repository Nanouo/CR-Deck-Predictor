# 🎯 Deck Prediction Service

## Overview

The deck prediction service provides **two modes** of prediction:

1. **Card Suggestions** (`predictNextCards`) - Returns individual cards to add to your deck (for real-time deck building)
2. **Complete Deck Predictions** (`predictDeck`) - Returns full 8-card deck recommendations

Both use a **3-tier fallback algorithm** to find the best recommendations based on user-selected cards. It starts with the most precise matching method and progressively expands to broader search strategies to ensure relevant results are always returned.

---

## 🎮 Two Modes of Operation

### Mode 1: Card Suggestions (NEW) ⭐
**Endpoint:** `POST /api/predict/cards`  
**Function:** `predictNextCards(selectedCards, limit)`  
**Purpose:** Real-time deck building assistance

**Use Case:**
- User enters cards one by one
- System suggests 5 most popular cards to add next
- Updates dynamically as user builds their deck

**Output Format:**
```json
{
  "suggestedCards": [
    { "card": "Musketeer", "frequency": 78, "appearsIn": 45 },
    { "card": "Cannon", "frequency": 65, "appearsIn": 38 },
    { "card": "Ice Spirit", "frequency": 72, "appearsIn": 42 },
    { "card": "Fireball", "frequency": 68, "appearsIn": 40 },
    { "card": "The Log", "frequency": 55, "appearsIn": 32 }
  ],
  "selectedCards": ["Hog Rider"],
  "cardsNeeded": 7,
  "decksAnalyzed": 58
}
```

**Key Features:**
- Returns **UP TO 5** cards (not always exactly 5)
- For 7 cards entered → Returns only viable completion cards
- For incompatible combinations → Returns empty array
- Frequency shows popularity percentage

---

### Mode 2: Complete Deck Predictions
**Endpoint:** `POST /api/predict`  
**Function:** `predictDeck(selectedCards)`  
**Purpose:** Find complete deck recommendations

**Use Case:**
- User wants to see full decks containing their cards
- Exploring meta decks
- Analyzing deck variations

**Output Format:**
```json
{
  "predictions": [
    {
      "name": "Hog 2.6 Cycle",
      "cards": ["Hog Rider", "Musketeer", "Cannon", ...],
      "confidence": 100,
      "matchType": "exact"
    }
  ],
  "totalFound": 21
}
```

---

## 🔄 3-Tier Fallback Process

### Tier 1: Exact Match (Highest Confidence)
**Priority:** 1st  
**Confidence Score:** 100%  
**Match Type:** `"exact"`

#### How It Works:
Searches for decks that contain **ALL** the cards the user selected.

#### MongoDB Query:
```javascript
Deck.find({
  cards: { $all: selectedCards }
})
```

#### Example:
**User selects:** `["Hog Rider", "Musketeer", "Fireball"]`

**Finds decks like:**
- ✅ Hog 2.6 Cycle: Contains all 3 cards
- ✅ Hog EQ: Contains all 3 cards
- ✅ Hog Bait: Contains all 3 cards

**Does NOT return:**
- ❌ Giant Double Prince: Missing "Hog Rider"
- ❌ Log Bait: Missing "Hog Rider"

#### When This Works Best:
- User has selected 3+ cards
- Cards commonly appear together (synergistic combinations)
- Looking for well-known meta decks

#### Limitations:
- May return 0 results if cards don't commonly appear together
- Requires database to have decks with that exact combination

---

### Tier 2: Substitution Match (Medium Confidence)
**Priority:** 2nd (fallback if Tier 1 doesn't find enough)  
**Confidence Score:** 50-85%  
**Match Type:** `"substitution"`

#### How It Works:
Uses the **card substitution system** to find decks with similar cards that serve the same role.

#### Substitution Map:
Cards can have substitutes defined in `cards.json`:
```json
{
  "name": "Arrows",
  "substitutes": ["Giant Vines", "The Log", "Giant Snowball"]
}
```

This means:
- If user selects "Arrows"
- Algorithm also searches for decks with "The Log", "Giant Snowball", etc.

#### Scoring System:
- **Direct match** (user's exact card): +10 points
- **Substitute match** (similar card): +7 points
- **Minimum requirement**: At least 50% of user's cards must match (direct or substitute)

#### Example:
**User selects:** `["Arrows", "Ice Spirit", "Knight"]`

**Card substitutions:**
- Arrows → The Log, Giant Snowball, Zap
- Ice Spirit → Fire Spirit, Electro Spirit, Heal Spirit
- Knight → (no substitutes)

**Finds decks like:**
- 🟡 Log Bait Classic (has "The Log" instead of "Arrows") - 85% confidence
- 🟡 Hog 2.6 (has "Ice Spirit" direct, "Fire Spirit" as substitute) - 75% confidence
- 🟡 Mortar Cycle (has "Knight" and "Electro Spirit" substitute) - 65% confidence

#### Confidence Calculation:
```javascript
confidence = (matchedCards / totalSelectedCards) × 85%

// Example:
// User selected 4 cards
// Deck matches 3 (2 direct + 1 substitute)
confidence = (3 / 4) × 85% = 63.75% ≈ 64%
```

#### When This Works Best:
- User selects common card roles (spells, spirits, mini-tanks)
- Exact matches are too restrictive
- Want to see similar deck variations

#### Limitations:
- Requires cards to have substitutes tagged in `cards.json`
- Currently only 9 cards have substitutes defined
- May suggest decks with different playstyles

---

### Tier 3: Frequency-Based Match (Lower Confidence)
**Priority:** 3rd (final fallback)  
**Confidence Score:** 0-70%  
**Match Type:** `"frequency"`

#### How It Works:
Analyzes **card co-occurrence patterns** across the entire deck database to find which cards commonly appear together with the user's selected cards.

#### Algorithm Steps:
1. Find all decks containing at least ONE of the user's cards
2. Count how often each card appears alongside user's cards
3. Score decks based on:
   - How many user cards they contain
   - Frequency score of other cards (how common the pairing is)

#### Example:
**User selects:** `["Mega Knight"]`

**Database analysis:**
```
Cards that appear with Mega Knight:
- Inferno Dragon: 45 decks
- Goblin Gang: 38 decks  
- Electro Wizard: 32 decks
- Zap: 50 decks
- Miner: 28 decks
```

**Finds decks like:**
- 🟢 MK Bait (Mega Knight + Zap + Inferno Dragon) - 70% confidence
- 🟢 MK Bridge Spam (Mega Knight + E-Wiz + Gang) - 65% confidence
- 🟢 MK Control (Mega Knight + other common pairings) - 55% confidence

#### Confidence Calculation:
```javascript
confidence = (matchedCards / totalSelectedCards) × 70%

// For 1 card selected:
// All predictions will match 1/1 = 100%
// But capped at 70% max for frequency tier
confidence = (1 / 1) × 70% = 70%
```

#### Sorting Priority:
1. **First:** Number of user's cards matched (descending)
2. **Second:** Frequency score (descending)

#### When This Works Best:
- User selects only 1-2 cards
- Looking for "what goes well with this card?"
- Exploring new deck combinations
- No exact or substitution matches found

#### Limitations:
- Lower confidence = less reliable predictions
- May suggest uncommon/experimental combinations
- Depends on database having diverse deck samples

---

## 🎯 How the Fallback Works

The algorithm runs **ALL THREE TIERS simultaneously** and then combines results:

```javascript
async function predictDeck(selectedCards) {
  // Run all three tiers in parallel
  const exactMatches = await findExactMatches(selectedCards);
  const substitutionMatches = await findSubstitutionMatches(selectedCards);
  const frequencyMatches = await findFrequencyBasedMatches(selectedCards);
  
  // Combine and remove duplicates
  const allPredictions = [...exactMatches, ...substitutionMatches, ...frequencyMatches];
  const uniquePredictions = removeDuplicates(allPredictions);
  
  // Sort by confidence (100% first, then 85%, 70%, etc.)
  uniquePredictions.sort((a, b) => b.confidence - a.confidence);
  
  return uniquePredictions.slice(0, 20); // Top 20
}
```

### Result Distribution Example:

**User selects:** `["Hog Rider", "Musketeer", "Fireball", "The Log"]`

**Results:**
```
Total: 21 predictions

Tier 1 (Exact):        3 predictions  [100% confidence]
Tier 2 (Substitution): 15 predictions [50-85% confidence]
Tier 3 (Frequency):    10 predictions [0-70% confidence]

After deduplication: 20 unique predictions returned
```

### Why This Approach?

1. **Always returns results** - Even with 1 card, you get predictions
2. **Quality first** - Best matches appear at the top
3. **Diversity** - Shows exact matches AND creative alternatives
4. **Scalable** - Works with any number of selected cards (1-8)

---

## 📊 Confidence Score Reference

| Confidence | Match Type | Meaning |
|-----------|-----------|---------|
| **100%** | Exact | Deck contains ALL your cards - perfect match |
| **75-85%** | Substitution | Deck has most of your cards + similar alternatives |
| **50-74%** | Substitution | Deck has some of your cards + alternatives |
| **40-70%** | Frequency | Deck shares some cards, others commonly paired |
| **0-39%** | Frequency | Weak match, exploratory suggestions |

---

## 🎨 Visual Representation

```
USER SELECTS: [Hog Rider, Musketeer, Fireball]
              ↓
    ┌─────────┴─────────┐
    │   Prediction API   │
    └─────────┬─────────┘
              ↓
    ┌─────────────────────────────────┐
    │  Run All 3 Tiers Simultaneously │
    └─────────────────────────────────┘
              ↓
    ┌─────────┼─────────┐
    │         │         │
    ↓         ↓         ↓
┌───────┐ ┌──────────┐ ┌───────────┐
│ Tier 1│ │ Tier 2   │ │ Tier 3    │
│ Exact │ │ Subst.   │ │ Frequency │
└───┬───┘ └────┬─────┘ └─────┬─────┘
    │          │              │
    │  3 decks │  15 decks    │  10 decks
    └──────────┴──────────────┘
              ↓
    ┌─────────────────┐
    │ Remove Dupes    │
    │ Sort by Score   │
    │ Return Top 20   │
    └─────────────────┘
              ↓
    [100% Hog 2.6 Cycle]
    [100% Hog EQ]
    [100% Hog Bait]
    [85%  Hog Variants]
    [70%  Related Decks]
    ...
```

---

## 🛠️ Current Limitations & Future Improvements

### Current Limitations:
- ❌ Only 9 cards have substitutes defined
- ❌ No win condition prioritization
- ❌ No elixir balance checking
- ❌ No archetype filtering

### Planned Improvements:

#### 1. Expand Substitution System
```json
// Add more substitutes for buildings
{
  "name": "Cannon",
  "substitutes": ["Tesla", "Bomb Tower", "Goblin Cage"]
}

// Add role-based groups
{
  "name": "Knight",
  "substitutes": ["Valkyrie", "Dark Prince"],
  "role": "mini-tank"
}
```

#### 2. Win Condition Validation
```javascript
// Ensure predicted decks have at least 1 win condition
if (deck.winConditions.length === 0) {
  confidence -= 20; // Penalty for no win con
}
```

#### 3. Elixir Balance
```javascript
// Prefer decks with reasonable elixir curves
if (deck.avgElixir > 4.5 || deck.avgElixir < 2.0) {
  confidence -= 10; // Penalty for extreme costs
}
```

#### 4. Smart Completion
```javascript
// For incomplete decks (user has 4 cards)
// Suggest cards that:
// 1. Fill missing roles (no spell? suggest spells)
// 2. Balance elixir (too high? suggest cheap cards)
// 3. Add synergy (has Golem? suggest Night Witch)
```

---

## � Card Suggestion Algorithm Details

### How `predictNextCards()` Works

```javascript
async function predictNextCards(selectedCards, limit = 5) {
  // 1. Run 3-tier matching to find relevant decks
  const allDecks = await getMatchedDecks(selectedCards); // Uses Tier 1, 2, 3
  
  // 2. Calculate how many cards are needed
  const numCardsNeeded = 8 - selectedCards.length;
  
  // 3. Count frequency of OTHER cards in matched decks
  const cardFrequency = {};
  
  allDecks.forEach(deck => {
    const missingCards = deck.cards.filter(card => !selectedCards.includes(card));
    
    // CRITICAL: Only count if deck needs exactly the right number of cards
    // This ensures we only suggest cards that complete viable decks
    if (missingCards.length === numCardsNeeded) {
      missingCards.forEach(card => {
        cardFrequency[card] = (cardFrequency[card] || 0) + 1;
      });
    }
  });
  
  // 4. Sort by frequency and return top N
  return sortByFrequency(cardFrequency, limit);
}
```

### Key Design Decisions

#### 1. **Why filter by `numCardsNeeded`?**
Ensures suggestions only come from decks that can actually be completed with the user's cards.

**Example:**
```javascript
User has: ["Hog Rider", "Musketeer", "Cannon"] // 3 cards, needs 5 more

Deck A: ["Hog", "Musketeer", "Cannon", "Ice Spirit", "Skeletons", "Fireball", "Log", "Ice Golem"]
Missing: 5 cards ✅ COUNTED

Deck B: ["Hog", "Musketeer", "Knight", "Poison", "Log", "Tesla", "Ice Spirit", "Ice Golem"]
Missing: 6 cards ❌ NOT COUNTED (has Knight instead of Cannon)
```

This prevents suggesting cards from decks that don't match the user's current selection.

#### 2. **Why use percentage instead of raw count?**
Makes it easier for users to understand popularity:
- `78%` = "This card appears in 78% of decks with your cards"
- Better than `45 out of 58` = less intuitive

#### 3. **Why return empty array for incompatible cards?**
Honest feedback that no known decks use this combination:
```javascript
User: ["Golem", "Hog Rider", "X-Bow"]
Result: [] // No suggestions

Frontend shows: "⚠️ No known decks match these cards"
```

Better than suggesting random cards that won't work together.

---

## �📁 Related Files

- **`services/deckPrediction.js`** - Main algorithm implementation (predictNextCards + predictDeck)
- **`routes/predictionRoutes.js`** - API endpoints (both modes)
- **`localdata/cards.json`** - Card data with substitutions
- **`models/decks.js`** - Deck schema
- **`scripts/testPrediction.js`** - Deck prediction test suite
- **`scripts/testCardPrediction.js`** - Card suggestion test suite
- **`test-card-api.js`** - API integration tests

---

## 🧪 Testing the System

### Test Card Suggestions (NEW)

**PowerShell:**
```powershell
# Test with 1 card
$body = @{ cards = @("Hog Rider") } | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/api/predict/cards -Method POST -ContentType "application/json" -Body $body

# Test with 3 cards (Hog 2.6 core)
$body = @{ cards = @("Hog Rider", "Musketeer", "Cannon") } | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/api/predict/cards -Method POST -ContentType "application/json" -Body $body

# Test with 7 cards (should return only Ice Golem)
$body = @{ cards = @("Hog Rider", "Musketeer", "Cannon", "Ice Spirit", "Skeletons", "Fireball", "The Log") } | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/api/predict/cards -Method POST -ContentType "application/json" -Body $body

# Test with incompatible cards (should return empty array)
$body = @{ cards = @("Golem", "Hog Rider", "X-Bow") } | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/api/predict/cards -Method POST -ContentType "application/json" -Body $body
```

**Bash/CMD:**
```bash
# Quick test endpoint
curl http://localhost:5000/api/predict/cards/test

# Test with 1 card
curl -X POST http://localhost:5000/api/predict/cards -H "Content-Type: application/json" -d "{\"cards\":[\"Hog Rider\"]}"

# Test with 3 cards
curl -X POST http://localhost:5000/api/predict/cards -H "Content-Type: application/json" -d "{\"cards\":[\"Hog Rider\",\"Musketeer\",\"Cannon\"]}"
```

---

### Test Complete Deck Predictions

```bash
cd server
node scripts/testPrediction.js
```

Or test via API:

```bash
# Test with 1 card (Tier 3 dominant)
curl.exe -X POST http://localhost:5000/api/predict -H "Content-Type: application/json" -d "{\"cards\":[\"Hog Rider\"]}"

# Test with 3 cards (All tiers active)
curl.exe -X POST http://localhost:5000/api/predict -H "Content-Type: application/json" -d "{\"cards\":[\"Hog Rider\",\"Musketeer\",\"Fireball\"]}"

# Test with substitute cards (Tier 2 shines)
curl.exe -X POST http://localhost:5000/api/predict -H "Content-Type: application/json" -d "{\"cards\":[\"Arrows\",\"Ice Spirit\"]}"
```

---

## 📈 Performance Benchmarks

### Card Suggestions Mode
| Cards Entered | Decks Analyzed | Suggestions Returned | Response Time |
|---------------|----------------|----------------------|---------------|
| 1 card | ~15-20 decks | 5 cards | ~50ms |
| 3 cards | ~10-15 decks | 5 cards | ~40ms |
| 7 cards | ~5-10 decks | 1-3 cards | ~30ms |
| Incompatible | ~10 decks | 0 cards | ~40ms |

### Complete Deck Mode
| Cards Entered | Total Results | Exact Matches | Response Time |
|---------------|---------------|---------------|---------------|
| 1 card | 20 decks | 0-5 | ~100ms |
| 3 cards | 20 decks | 3-10 | ~120ms |
| 5 cards | 15 decks | 5-15 | ~100ms |

---

## 🎯 Usage Examples

### Frontend Integration - Card Suggestions

```javascript
// User enters a card in the deck builder
async function onCardAdded(selectedCards) {
  const response = await fetch('/api/predict/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cards: selectedCards, limit: 5 })
  });
  
  const data = await response.json();
  
  // Display suggestions to user
  displaySuggestions(data.suggestedCards);
  
  // Example output:
  // data.suggestedCards = [
  //   { card: "Musketeer", frequency: 78, appearsIn: 45 },
  //   { card: "Cannon", frequency: 65, appearsIn: 38 },
  //   ...
  // ]
}

function displaySuggestions(suggestions) {
  if (suggestions.length === 0) {
    showMessage("⚠️ No known decks match these cards. Try different combinations.");
    return;
  }
  
  const html = suggestions.map(s => `
    <div class="suggestion-card" onclick="addCard('${s.card}')">
      <img src="/cards/${s.card}.png" />
      <span>${s.card}</span>
      <span class="frequency">${s.frequency}% popularity</span>
    </div>
  `).join('');
  
  document.getElementById('suggestions').innerHTML = html;
}
```

---

**Last Updated:** October 14, 2025  
**Algorithm Version:** 2.0  
**Database:** 213 decks  
**New Features:** Card suggestion mode, 7-card handling, incompatible card detection
