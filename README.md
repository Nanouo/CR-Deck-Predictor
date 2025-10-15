# CR DECK - Clash Royale Deck Predictor

A real-time deck prediction system for Clash Royale that suggests cards as users build their decks.

## 🚀 Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (coming soon)
- **Database:** 213 curated meta decks
- **Prediction:** 3-tier fallback algorithm

## ✨ Features

### Card Prediction API
- Real-time card suggestions as users build decks
- Returns top 5 most popular cards based on selected cards
- Handles 1-7 card inputs with intelligent fallback
- Detects incompatible card combinations

### Endpoints
- `POST /api/predict/cards` - Get card suggestions
- `POST /api/predict` - Get complete deck recommendations
- `GET /api/cards` - Get all cards
- `GET /api/decks` - Get all decks

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/Nanouo/CR-Deck-Predictor.git

# Install server dependencies
cd server
npm install

# Create .env file
MONGODB_URI=your_mongodb_connection_string
CLASH_ROYALE_API_TOKEN=your_api_token

# Start server
node index.js
```

## 🧪 Testing

```bash
# Test card predictions
node server/scripts/test-card-api.js

# Test deck predictions
node server/scripts/testPrediction.js
```

## 📚 Documentation

- [Card Prediction Summary](server/CARD_PREDICTION_SUMMARY.md) - Implementation details
- [Deck Prediction Algorithm](server/services/DECK_PREDICTION_README.md) - Algorithm documentation
- [API Testing Guide](docs/API_TESTING_GUIDE.md) - How to test endpoints
- [Project Status](docs/PROJECT_STATUS.md) - Current features and roadmap

## 🗂️ Project Structure

```
CR DECK/
├── server/              # Backend API
│   ├── services/        # Prediction algorithms
│   ├── routes/          # API endpoints
│   ├── models/          # MongoDB schemas
│   ├── scripts/         # Utility scripts
│   └── localdata/       # Card data
├── client/              # Frontend (React)
└── docs/                # Documentation
```

## 🎯 Prediction Algorithm

Uses a 3-tier fallback system:
1. **Exact Match** (100% confidence) - Decks with ALL selected cards
2. **Substitution Match** (50-85% confidence) - Similar cards (e.g., Zap → Log)
3. **Frequency Match** (0-70% confidence) - Common card pairings

## 📊 Database Stats

- **Total Decks:** 213 curated competitive decks
- **Total Cards:** 109 cards (9 with substitutes)
- **Archetypes:** Log Bait, Hog Cycle, Golem, RG, Giant, Balloon, etc.

## 🛠️ Development

```bash
# Add custom decks
node server/scripts/addCustomDecks.js

# Clear database
node server/scripts/clearDecks.js

# Test API
node server/scripts/test-api.js
```

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

Contributions welcome! Please check the [Project Status](docs/PROJECT_STATUS.md) for current priorities.