const getTopPlayers = require('./getTopPlayers');
const Deck = require('../models/Deck');
//Imports your Mongoose model for the Deck collection. 
//This lets you interact with MongoDB using the schema you defined.


const populateDecks = async () => {
  const players = await getTopPlayers();
  const deckBatch = [];

  for (const player of players) {//Loops through each player returned from the API.
    const cards = player.currentDeck?.map(card => card.name);
    if (!cards || cards.length !== 8) continue;

    const exists = await Deck.exists({ cards: { $all: cards, $size: 8 } });//Checks if a deck with the exact same 8 cards already exists in MongoDB.
    if (!exists) {
      const cardDocs = await Card.find({ name: { $in: cards } });

      const winConditions = cardDocs
        .filter(card => card.wincon)
        .map(card => card.name);

      const totalElixir = cardDocs.reduce((sum, card) => sum + card.elixirCost, 0);
      const avgElixir = (totalElixir / cardDocs.length).toFixed(1);
      
      const deckName = winConditions.length
      ? `${winConditions.join(', ')} — ${avgElixir}`
      : `No Win Condition — ${avgElixir}`;
      
      deckBatch.push({
        cards,
        sourcePlayer: player.name,
        towerTroops: 'default',
        name: deckName
      });
    }
  }

  if (deckBatch.length) {
    await Deck.insertMany(deckBatch);
    console.log(`Inserted ${deckBatch.length} new decks`);
  } else {
    console.log('No new decks to insert');
  }
};

module.exports = populateDecks;