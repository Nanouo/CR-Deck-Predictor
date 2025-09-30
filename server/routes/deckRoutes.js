const express = require('express');
const router = express.Router();
const Deck = require('../models/decks');

router.get('/', async (req, res) => {
  const decks = await Deck.find().limit(50); // limit for performance
  res.json(decks);
});

module.exports = router;