require('dotenv').config();
const express = require('express');
const app = express();

// This lets your server understand JSON
app.use(express.json());

//"Any route inside cardRoutes.js will be prefixed with /api/cards"
const cardRoutes = require('./routes/cardRoutes');
app.use('/api', cardRoutes);

/*const playerRoutes = require('./routes/playerRoutes');
app.use('/api/player', playerRoutes);*/

const topPlayersRoutes = require('./routes/topPlayersRoutes');
app.use('/api/top-players', topPlayersRoutes);

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
