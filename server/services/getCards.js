const axios = require('axios');
const fs = require('fs');
const path = require('path');

const getCards = async () => {
  const token = process.env.CR_API_TOKEN;
  const filePath = path.join(__dirname, '../localdata/cards.json');

  try {
    const response = await axios.get('https://api.clashroyale.com/v1/cards', {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Save data to local file
    fs.writeFileSync(filePath, JSON.stringify(response.data.items, null, 2));
    console.log('Card data saved to cards.json');

    return response.data.items;
  } catch (err) {
    console.error('Error fetching cards:', err.message);
    throw new Error('Failed to fetch cards');
  }
};

module.exports = getCards;