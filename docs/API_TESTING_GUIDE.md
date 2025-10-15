# 🧪 API Testing Guide

## Prerequisites
✅ MongoDB connection is configured in `.env`
✅ Server dependencies are installed (`npm install`)

---

## Step 1: Start the Server

Open a terminal and navigate to the server directory:

```bash
cd server
node index.js
```

You should see:
```
Server is running on port 5000
MongoDB connected
```

**⚠️ Keep this terminal running!** This is your server.

---

## Step 2: Test the API

Open a **NEW terminal** (keep the server running in the first one) and choose your testing method:

### Option A: Using the Test Script (Recommended)

```bash
cd server
node test-api.js
```

This will run 4 automated tests:
1. ✅ GET test endpoint
2. ✅ POST prediction with Hog Rider cards
3. ✅ POST prediction with Log Bait cards
4. ✅ Error handling (too many cards)

**Expected Output:**
```
🧪 Testing Prediction API Endpoints

=== Test 1: GET /api/predict/test ===
✅ Test endpoint working!
Status: Prediction service is working! ✅
Predictions found: 21
...

🎉 All tests passed!
```

---

### Option B: Using curl (Manual Testing)

#### Test 1: Simple GET Test
```bash
curl.exe http://localhost:5000/api/predict/test
```

**Expected Response:**
```json
{
  "status": "Prediction service is working! ✅",
  "testCards": ["Hog Rider", "Musketeer", "Fireball"],
  "predictionsFound": 21,
  "breakdown": {
    "exact": 3,
    "substitution": 15,
    "frequency": 10
  },
  "sample": [...]
}
```

#### Test 2: POST Prediction Request
```bash
curl.exe -X POST http://localhost:5000/api/predict -H "Content-Type: application/json" -d "{\"cards\":[\"Hog Rider\",\"Musketeer\",\"Fireball\"]}"
```

**Expected Response:**
```json
{
  "predictions": [
    {
      "name": "Hog 2.6 Cycle",
      "cards": [...],
      "avgElixir": 2.6,
      "confidence": 100,
      "matchType": "exact",
      "matchedCards": 3
    },
    ...
  ],
  "selectedCards": ["Hog Rider", "Musketeer", "Fireball"],
  "totalFound": 21,
  "breakdown": {
    "exact": 3,
    "substitution": 15,
    "frequency": 10
  }
}
```

#### Test 3: Log Bait Prediction
```bash
curl.exe -X POST http://localhost:5000/api/predict -H "Content-Type: application/json" -d "{\"cards\":[\"Goblin Barrel\",\"Princess\",\"Knight\"]}"
```

#### Test 4: Error Handling (Too Many Cards)
```bash
curl.exe -X POST http://localhost:5000/api/predict -H "Content-Type: application/json" -d "{\"cards\":[\"Hog Rider\",\"Musketeer\",\"Cannon\",\"Fireball\",\"Ice Spirit\",\"Skeletons\",\"The Log\",\"Ice Golem\",\"Knight\"]}"
```

**Expected Error Response:**
```json
{
  "error": "Too many cards",
  "message": "Maximum 8 cards allowed",
  "received": 9
}
```

---

### Option C: Using PowerShell (Alternative)

```powershell
# Test GET endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/predict/test" -Method Get

# Test POST endpoint
$body = @{
    cards = @("Hog Rider", "Musketeer", "Fireball")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/predict" -Method Post -Body $body -ContentType "application/json"
```

---

## Available Endpoints

### 1. GET `/api/predict/test`
**Purpose:** Verify the prediction service is working

**Request:** None

**Response:**
```json
{
  "status": "Prediction service is working! ✅",
  "testCards": ["Hog Rider", "Musketeer", "Fireball"],
  "predictionsFound": 21,
  "breakdown": { ... },
  "sample": [ ... ]
}
```

---

### 2. POST `/api/predict`
**Purpose:** Get deck predictions based on selected cards

**Request Body:**
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
      "cards": ["Hog Rider", "Musketeer", "Cannon", ...],
      "avgElixir": 2.6,
      "winConditions": ["Hog Rider"],
      "description": "...",
      "sourcePlayer": "...",
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
  },
  "requestTime": "2025-10-14T...",
  "cardCount": 4
}
```

---

## Response Fields Explained

### `predictions` Array
Each prediction object contains:

- **`name`** - Deck name
- **`cards`** - Array of 8 card names
- **`avgElixir`** - Average elixir cost
- **`winConditions`** - Array of win condition cards
- **`matchType`** - `"exact"` | `"substitution"` | `"frequency"`
- **`confidence`** - 0-100 score (higher = better match)
- **`matchedCards`** - Number of your cards in this deck

### `breakdown` Object
- **`exact`** - Decks containing ALL your cards
- **`substitution`** - Decks with similar cards (using substitutes)
- **`frequency`** - Decks based on card co-occurrence patterns

---

## Troubleshooting

### ❌ `curl: (7) Failed to connect to localhost port 5000`
**Problem:** Server is not running

**Solution:**
1. Make sure you started the server: `node index.js`
2. Check the first terminal - you should see "Server is running on port 5000"
3. Make sure you're testing in a DIFFERENT terminal

---

### ❌ `Cannot find module` errors
**Problem:** Wrong directory or missing dependencies

**Solution:**
```bash
cd server
npm install
node index.js
```

---

### ❌ `MongoDB connection failed`
**Problem:** `.env` file missing or MongoDB URI incorrect

**Solution:**
1. Check `server/.env` file exists
2. Verify `MONGODB_URI` is set correctly
3. Check MongoDB Atlas IP whitelist includes your current IP

---

### ❌ `predictions: []` (empty predictions)
**Problem:** No matching decks found or invalid card names

**Solution:**
1. Check card names match exactly (case-sensitive)
2. Verify cards exist in `localdata/cards.json`
3. Try with known cards: `["Hog Rider", "Musketeer", "Fireball"]`

---

## Quick Test Checklist

Before integrating with frontend, verify:

- [ ] Server starts without errors
- [ ] GET `/api/predict/test` returns status "working"
- [ ] POST `/api/predict` with valid cards returns predictions
- [ ] POST with invalid data returns error message
- [ ] Confidence scores are calculated (0-100)
- [ ] Match types are assigned correctly (exact/substitution/frequency)
- [ ] CORS headers are present (check browser console later)

---

## Next Steps: Frontend Integration

Once API is verified working:

1. **Update `client/public/main.js`** to call `/api/predict`
2. **Display predictions** in the UI with confidence scores
3. **Show match type badges** (exact, substitution, frequency)
4. **Add loading states** during API calls
5. **Handle errors** gracefully

Example frontend code:
```javascript
async function getPredictions(selectedCards) {
  const response = await fetch('http://localhost:5000/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cards: selectedCards })
  });
  
  const data = await response.json();
  return data.predictions;
}
```

---

**Last Updated:** October 14, 2025
**Server Port:** 5000
**Database:** MongoDB (213 decks)
