const fs = require('fs');//Gives you access to the file system—used here to write card data to cards.json
const path = require('path');//ensures the correct path to your data file.
const express = require('express');//Creating router and defining HTTP routes like GET /cards.
const axios = require('axios');//Makes HTTP requests—used here to call the Clash Royale API.
const router = express.Router();//Creates a modular route handler. You’ll export this and mount it in your main index.js.

router.get('/cards', async (req, res) => {//This defines a GET route at /cards. 
  const token = process.env.CR_API_TOKEN;
  try {
    const response = await axios.get('https://api.clashroyale.com/v1/cards', {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });
    //TAKES THE DATA FROM CARDS AND PUTS IT IN LOCAL DATA
    const filePath = path.join(__dirname, '../localdata/cards.json'); // adjust path as needed
    fs.writeFile(filePath, JSON.stringify(response.data.items, null, 2), (err) => {
      if (err) {
        console.error('Error saving card data:', err);
      } else {
        console.log('Card data saved to cards.json');
      }
    });

    res.json(response.data.items);
  } catch (err) {
  console.error('Axios error:', err.response?.data || err.message);
  res.status(500).json({ error: 'Failed to fetch card data' });
}
});

module.exports = router;



