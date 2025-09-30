const express = require('express');
const axios = require('axios');
const router = express.Router();

const token = process.env.CR_API_TOKEN;;

router.get('/season-top', async (req, res) => {
  try {
    // Step 1: Get current season
    const seasonRes = await axios.get('https://api.clashroyale.com/v1/locations/global/seasons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const currentSeasonId = seasonRes.data.items[0].id;

    // Step 2: Get top players for that season
    const playerRes = await axios.get(`https://api.clashroyale.com/v1/locations/global/seasons/${currentSeasonId}/rankings/players?limit=200`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(playerRes.data.items); // includes currentDeck
  } catch (err) {
    console.error('Season rankings error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch season rankings' });
  }
});
router.get('/', (req, res) => {
  res.send('Top players route is alive!');
});

module.exports = router;
//test browser
//http://localhost:5000/top-players/api/season-top
