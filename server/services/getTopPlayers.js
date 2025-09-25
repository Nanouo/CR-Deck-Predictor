const axios = require('axios');

const getTopPlayers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/top-players/season-top'); // adjust port if needed
    return response.data; // array of player objects with currentDeck
  } catch (err) {
    console.error('Error calling /season-top route:', err.response?.data || err.message);
    throw new Error('Failed to fetch top players');
  }
};

module.exports = getTopPlayers;
