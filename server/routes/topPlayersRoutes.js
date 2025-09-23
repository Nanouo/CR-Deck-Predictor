const express = require('express');
const axios = require('axios');
const router = express.Router();

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjJiMTQyMDRiLThjMzAtNGZiNy05YzA5LTNiZWViNGI1YWJjOSIsImlhdCI6MTc1ODYwMTAwMywic3ViIjoiZGV2ZWxvcGVyLzczZDIxZjQ1LWIzNGYtMTVhNS1kZDlkLWVjNTVlOThjZDc3YSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI0Ny4xODguMjIyLjE5IiwiNzYuNzguMTY5LjE0Il0sInR5cGUiOiJjbGllbnQifV19.7L1mFY2gUwt19jPDO00nSkFgddGg-1SwYcB8B3VsFVlKhBWKDL3meJyh779Itzz3fX3j6_GIVEJHEUsQM9oJ5g';

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
