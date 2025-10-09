require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://api.clashroyale.com/v1';
const headers = { Authorization: `Bearer ${process.env.CR_API_TOKEN}` };

const getPlayerData = async (playerTag) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/players/${encodeURIComponent(playerTag)}`, 
      { headers }
    );
    return response.data;
  } catch (err) {
    console.error(`Error fetching player ${playerTag}:`, err.response?.data || err.message);
    return null;
  }
};

const getPlayersData = async (playerTags) => {
  console.log(`Fetching data for ${playerTags.length} players...`);
  const players = [];
  
  for (const tag of playerTags) {
    console.log(`Fetching player: ${tag}`);
    const playerData = await getPlayerData(tag);
    
    if (playerData && playerData.currentDeck) {
      players.push(playerData);
    } else {
      console.log(`⚠️ Skipping player ${tag} - no current deck data`);
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Successfully fetched ${players.length} players with deck data`);
  return players;
};

module.exports = { getPlayerData, getPlayersData };