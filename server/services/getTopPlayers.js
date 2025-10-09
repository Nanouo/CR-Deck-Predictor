require('dotenv').config();
const axios = require('axios');

console.log('Using token:', process.env.CR_API_TOKEN);
const BASE_URL = 'https://api.clashroyale.com/v1';
const headers = { Authorization: `Bearer ${process.env.CR_API_TOKEN}` };

const getTopPlayers = async (locationId = 'global') => {
  try {
    if (locationId === 'global') {
      // Global uses seasonal rankings
      console.log(`Fetching current season for location: ${locationId}...`);
      const seasonRes = await axios.get(`${BASE_URL}/locations/${locationId}/seasons`, { headers });
      console.log('Season response:', JSON.stringify(seasonRes.data, null, 2));

      const currentSeasonId = seasonRes.data.items[0]?.id;
      if (!currentSeasonId) {
        throw new Error('No current season ID found in API response');
      }
      console.log(`Current season ID: ${currentSeasonId}`);

      console.log(`Fetching top players from ${locationId}...`);
      const playerRes = await axios.get(`${BASE_URL}/locations/${locationId}/seasons/${currentSeasonId}/rankings/players?limit=50`, { headers });
      console.log('Top players response:', JSON.stringify(playerRes.data, null, 2));

      const topPlayers = playerRes.data.items;
      if (!topPlayers || topPlayers.length === 0) {
        throw new Error('No top players found in API response');
      }
      console.log(`Fetched ${topPlayers.length} top players from ${locationId}.`);

      return topPlayers.map(player => player.tag);
    } else {
      // Regional locations use current rankings
      console.log(`Fetching current rankings for location: ${locationId}...`);
      const playerRes = await axios.get(`${BASE_URL}/locations/${locationId}/rankings/players?limit=50`, { headers });
      console.log('Top players response:', JSON.stringify(playerRes.data, null, 2));

      const topPlayers = playerRes.data.items;
      if (!topPlayers || topPlayers.length === 0) {
        throw new Error('No top players found in API response');
      }
      console.log(`Fetched ${topPlayers.length} top players from location ${locationId}.`);

      return topPlayers.map(player => player.tag);
    }
  } 
  catch (err) {
    console.error('Error fetching top players:', err.response?.data || err.message);
    throw new Error('Failed to fetch top player decks');
  }
};

module.exports = getTopPlayers;