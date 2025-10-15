require('dotenv').config();
const express = require('express');
const app = express();

//MongoDB 
const connectDB = require('./db');
connectDB();

// CORS middleware - allow frontend to call API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// This lets your server understand JSON
app.use(express.json());

//"Any route inside cardRoutes.js will be prefixed with /api/cards"
const cardRoutes = require('./routes/cardRoutes');
app.use('/api', cardRoutes);

/*const playerRoutes = require('./routes/playerRoutes');
app.use('/api/player', playerRoutes);*/

app.use('/api/decks', require('./routes/deckRoutes'));

const topPlayersRoutes = require('./routes/topPlayersRoutes');
app.use('/api/top-players', topPlayersRoutes);

// Prediction routes
const predictionRoutes = require('./routes/predictionRoutes');
app.use('/api/predict', predictionRoutes);

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
