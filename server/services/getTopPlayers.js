require('dotenv').config();
const axios = require('axios');

console.log('Using token:', process.env.CR_API_TOKEN);
const BASE_URL = 'https://api.clashroyale.com/v1';
const headers = { Authorization: `Bearer ${process.env.CR_API_TOKEN}` };

const getTopPlayers = async () => {
  try {
    const seasonRes = await axios.get(`${BASE_URL}/locations/global/seasons`, { headers });
    const currentSeasonId = seasonRes.data.items[0].id;

    const playerRes = await axios.get(`${BASE_URL}/locations/global/seasons/${currentSeasonId}/rankings/players?limit=50`, { headers });
    const topPlayers = playerRes.data.items;

    const enrichedPlayers = [];

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    for (const player of topPlayers) {
    const tag = encodeURIComponent(player.tag);

    try {
      const profileRes = await axios.get(`${BASE_URL}/players/${tag}`, { headers });

      enrichedPlayers.push({
        name: player.name,
        currentDeck: profileRes.data.currentDeck
      });
    } 
    catch (err) {
      console.warn(`⚠️ Skipping ${player.name} (${player.tag}) — ${err.response?.data?.reason || err.message}`);
      continue;
    }

    await sleep(100); // optional: avoid rate limits
  }

    return enrichedPlayers;
  } catch (err) {
    console.error('Error fetching enriched player data:', err.response?.data || err.message);
    throw new Error('Failed to fetch top player decks');
  }
};

module.exports = getTopPlayers;