const processDecks = (players, cardData) => {
  const deckBatch = [];

  for (const player of players) {
    const cards = player.currentDeck?.map(card => card.name);
    if (!cards || cards.length !== 8) {
      console.log(`Skipping invalid deck for ${player.name}`);
      continue;
    }

    const cardDocs = cardData.filter(card => cards.includes(card.name));
    const winConditions = cardDocs.filter(card => card.wincon).map(card => card.name);
    const totalElixir = cardDocs.reduce((sum, card) => sum + card.elixirCost, 0);
    const avgElixir = (totalElixir / cardDocs.length).toFixed(1);

    const deckName = winConditions.length
      ? `${winConditions.join(', ')} — ${avgElixir}`
      : `No Win Condition — ${avgElixir}`;

    deckBatch.push({
      cards,
      sourcePlayer: player.name,
      towerTroops: 'default',
      name: deckName,
    });
  }

  return deckBatch;
};

module.exports = processDecks;