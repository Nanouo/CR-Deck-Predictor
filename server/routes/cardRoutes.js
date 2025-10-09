const express = require('express');
const getCards = require('../services/getCards');
const router = express.Router();

router.get('/cards', async (req, res) => {
  try {
    const cards = await getCards();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



