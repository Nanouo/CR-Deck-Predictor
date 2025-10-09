const express = require('express');
const getTopPlayers = require('../services/getTopPlayers');
const router = express.Router();

router.get('/season-top', async (req, res) => {
  try {
    const players = await getTopPlayers();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
