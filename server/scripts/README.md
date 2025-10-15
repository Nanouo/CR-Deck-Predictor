# Server Scripts

This directory contains utility scripts for managing the Clash Royale deck database.

## Active Scripts

### 🎴 `addCustomDecks.js`
**Purpose**: Add new custom deck combinations to the database

**Usage**:
```bash
node scripts/addCustomDecks.js
```

**Features**:
- Validates all cards exist in `cards.json`
- Calculates average elixir cost and win conditions automatically
- Checks for duplicates before inserting
- Handles Mirror card (elixirCost: 0) correctly

**How to Use**:
1. Open `addCustomDecks.js`
2. Add your deck objects to the `customDecks` array following the template:
```javascript
{
  name: "Deck Name",
  cards: ["Card1", "Card2", "Card3", "Card4", "Card5", "Card6", "Card7", "Card8"],
  description: "Brief description of the deck"
}
```
3. Run the script
4. Clean the array after successful insertion (reset to empty template)

---

### 🧪 `testPrediction.js`
**Purpose**: Test the deck prediction algorithm with various scenarios

**Usage**:
```bash
node scripts/testPrediction.js
```

**Tests**:
- Exact match predictions (common card combinations)
- Log bait deck predictions
- Single card predictions
- Substitution system testing

**Output**: Shows prediction count, breakdown by tier (exact/substitution/frequency), and top results

---

### 🗑️ `clearDecks.js`
**Purpose**: **⚠️ DANGER** - Deletes ALL decks from the database

**Usage**:
```bash
node scripts/clearDecks.js
```

**⚠️ WARNING**: This script permanently deletes all decks. Use only when you need to completely reset the database. Consider backing up your data first.

**When to Use**:
- Complete database reset
- Before bulk import from a new data source
- Development/testing environment cleanup

---

## Archived Scripts

Scripts in the `archive/` folder have been run and are no longer needed for regular operations:

- **`addPopularDecks.js`** - Added meta decks (Hog 2.6, Log Bait, etc.) - Already in DB ✅
- **`addNAPlayerDecks.js`** - Added 24 North America top player decks - Already in DB ✅

These are kept for reference but can be safely deleted if needed.

---

## Script Guidelines

### Before Running a Script:
1. ✅ Ensure `.env` file is properly configured with `MONGODB_URI`
2. ✅ Check MongoDB connection is active
3. ✅ Verify you're in the `/server` directory
4. ✅ Read the script's purpose and warnings

### After Running a Script:
1. ✅ Verify the operation completed successfully
2. ✅ Check the database count: `Deck.countDocuments()`
3. ✅ Test the application to ensure data integrity
4. ✅ Clean up temporary data (like `addCustomDecks.js` array)

---

## Current Database Stats

**Total Decks**: 213
**Sources**: 
- Global top players
- Meta decks (Hog 2.6, Log Bait, etc.)
- North America top players
- Custom curated decks (Cycle, Beatdown, Bait, etc.)

---

## Creating New Scripts

When creating new utility scripts:

1. **Follow the pattern**:
```javascript
require('dotenv').config();
const connectDB = require('../db');
const Deck = require('../models/decks');

connectDB();

async function yourFunction() {
  try {
    // Your logic here
    console.log('✅ Success message');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  process.exit(0);
}

// Wait for DB connection
setTimeout(yourFunction, 2000);
```

2. **Add descriptive console logs** with emojis for clarity
3. **Handle errors gracefully** with try-catch blocks
4. **Exit cleanly** with `process.exit(0)`
5. **Document in this README** once tested and working

---

## Troubleshooting

**MongoDB Connection Error**:
- Check `.env` file has correct `MONGODB_URI`
- Verify MongoDB Atlas IP whitelist includes your current IP
- Ensure network connection is stable

**Duplicate Key Error**:
- Deck already exists in database
- Script has duplicate checking disabled
- Check `cards` array for uniqueness

**Validation Error**:
- Card names don't match `cards.json` exactly (case-sensitive)
- Deck has more/less than 8 cards
- `avgElixir` calculation returned `NaN` (check for missing `elixirCost`)

---

Last Updated: October 14, 2025
