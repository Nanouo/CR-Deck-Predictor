const express = require('express');
const app = express();

// This lets your server understand JSON
app.use(express.json());

// 🔗 Import and mount your card routes BEFORE starting the server
const cardRoutes = require('./routes/cardRoutes');
app.use('/api', cardRoutes);

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
