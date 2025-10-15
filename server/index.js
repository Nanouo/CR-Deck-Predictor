// server/index.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();

// --- DB (optional: comment out if you don't need it to start) ---
const connectDB = require('./db');
connectDB();

// --- Middleware ---
app.use(express.json());

// (Optional CORS — not required if client is served by same server)
// const cors = require('cors');
// app.use(cors());

// --- API routes ---
app.use('/api', require('./routes/cardRoutes'));          // e.g., /api/cards
app.use('/api/decks', require('./routes/deckRoutes'));
app.use('/api/top-players', require('./routes/topPlayersRoutes'));
app.use('/api/predict', require('./routes/predictionRoutes'));

// --- Static assets ---
// Expose /server/localdata as /localdata  (-> /localdata/cards.json)
app.use('/localdata', express.static(path.join(__dirname, 'localdata')));

// Serve client (client/public) at the web root
app.use(express.static(path.join(__dirname, '../client/public')));

// --- SPA fallback (Express 5 safe) ---
// Send index.html for any non-API / non-localdata route
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/localdata')) return next();
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// --- (Optional) health check ---
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// To start the server: node server/index.js