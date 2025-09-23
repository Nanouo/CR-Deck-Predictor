const express = require('express');
const app = express();

// This lets your server understand JSON
app.use(express.json());

//"Any route inside cardRoutes.js will be prefixed with /api/cards"
const cardRoutes = require('./routes/cardRoutes');
app.use('/api', cardRoutes);
//“Any route inside playerRoute.js will be prefixed with /api/player"
const playerRoutes = require('./routes/playerRoutes');
app.use('/api/player', playerRoutes);

const leaderboardRoutes = require('./routes/leaderboardRoutes');
app.use('/api/leaderboard', leaderboardRoutes);

// This is where your prediction route will go
app.post('/predict', (req, res) => {
  const { cards } = req.body;

  // For now, just send back the same cards
  res.json({ predictedDeck: cards });
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
