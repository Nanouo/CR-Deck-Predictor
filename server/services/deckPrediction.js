const Deck = require('../models/decks');
const fs = require('fs');
const path = require('path');

// Load card data for substitution logic
const cardsPath = path.join(__dirname, '../localdata/cards.json');
const cardData = JSON.parse(fs.readFileSync(cardsPath));

/**
 * Creates a map of card substitutions for quick lookup
 * Returns: { "Arrows": ["Arrows", "Giant Vines", "The Log", "Giant Snowball"], ... }
 */
function buildSubstitutionMap() {
  const substitutionMap = {};
  
  cardData.forEach(card => {
    if (card.substitutes && Array.isArray(card.substitutes)) {
      // Include the card itself + all its substitutes
      substitutionMap[card.name] = [card.name, ...card.substitutes];
    } else {
      // No substitutes, just the card itself
      substitutionMap[card.name] = [card.name];
    }
  });
  
  return substitutionMap;
}

/**
 * TIER 1: Find decks that contain ALL the selected cards (exact match)
 * This is the highest confidence prediction
 */
async function findExactMatches(selectedCards) {
  if (selectedCards.length === 0) return [];
  
  const decks = await Deck.find({
    cards: { $all: selectedCards }
  }).limit(20);
  
  return decks.map(deck => ({
    ...deck.toObject(),
    matchType: 'exact',
    confidence: 100,
    matchedCards: selectedCards.length
  }));
}

/**
 * TIER 2: Find decks using card substitutions
 * Example: If user has "Arrows", also search for decks with "The Log", "Giant Snowball", etc.
 */
async function findSubstitutionMatches(selectedCards) {
  if (selectedCards.length === 0) return [];
  
  const substitutionMap = buildSubstitutionMap();
  const expandedQueries = [];
  
  // For each selected card, get all possible substitutes
  selectedCards.forEach(cardName => {
    const possibleCards = substitutionMap[cardName] || [cardName];
    expandedQueries.push(possibleCards);
  });
  
  // Build a query that finds decks containing at least one substitute for each selected card
  // This is complex, so we'll use a simpler approach: find decks that match most cards
  const decks = await Deck.find().limit(100);
  
  const scoredDecks = decks.map(deck => {
    let matchScore = 0;
    let matchedCards = 0;
    
    selectedCards.forEach(selectedCard => {
      const possibleSubstitutes = substitutionMap[selectedCard] || [selectedCard];
      
      // Check if deck contains the selected card or any of its substitutes
      const hasMatch = deck.cards.some(deckCard => 
        possibleSubstitutes.includes(deckCard)
      );
      
      if (hasMatch) {
        matchedCards++;
        // Direct match gets higher score than substitute match
        if (deck.cards.includes(selectedCard)) {
          matchScore += 10;
        } else {
          matchScore += 7;
        }
      }
    });
    
    // Calculate confidence based on match percentage
    const confidence = Math.round((matchedCards / selectedCards.length) * 85);
    
    return {
      ...deck.toObject(),
      matchType: 'substitution',
      confidence,
      matchedCards,
      matchScore
    };
  })
  .filter(deck => deck.matchedCards >= Math.ceil(selectedCards.length * 0.5)) // At least 50% match
  .sort((a, b) => b.matchScore - a.matchScore)
  .slice(0, 15);
  
  return scoredDecks;
}

/**
 * TIER 3: Frequency-based prediction
 * Analyze which cards commonly appear together in decks
 */
async function findFrequencyBasedMatches(selectedCards) {
  if (selectedCards.length === 0) return [];
  
  // Find all decks that contain at least ONE of the selected cards
  const decks = await Deck.find({
    cards: { $in: selectedCards }
  }).limit(200);
  
  // Count card co-occurrence frequencies
  const cardFrequency = {};
  
  decks.forEach(deck => {
    const hasSelectedCard = deck.cards.some(card => selectedCards.includes(card));
    if (hasSelectedCard) {
      deck.cards.forEach(card => {
        if (!selectedCards.includes(card)) {
          cardFrequency[card] = (cardFrequency[card] || 0) + 1;
        }
      });
    }
  });
  
  // Score each deck based on how many selected cards it has + frequency of other cards
  const scoredDecks = decks.map(deck => {
    let matchedCards = 0;
    let frequencyScore = 0;
    
    deck.cards.forEach(deckCard => {
      if (selectedCards.includes(deckCard)) {
        matchedCards++;
      } else {
        frequencyScore += (cardFrequency[deckCard] || 0);
      }
    });
    
    const confidence = Math.round((matchedCards / selectedCards.length) * 70);
    
    return {
      ...deck.toObject(),
      matchType: 'frequency',
      confidence,
      matchedCards,
      frequencyScore
    };
  })
  .filter(deck => deck.matchedCards > 0)
  .sort((a, b) => {
    // First sort by matched cards, then by frequency score
    if (b.matchedCards !== a.matchedCards) {
      return b.matchedCards - a.matchedCards;
    }
    return b.frequencyScore - a.frequencyScore;
  })
  .slice(0, 10);
  
  return scoredDecks;
}

/**
 * Main prediction function - combines all three tiers
 * Returns predictions sorted by confidence
 */
async function predictDeck(selectedCards) {
  if (!Array.isArray(selectedCards) || selectedCards.length === 0) {
    return {
      predictions: [],
      message: 'No cards selected'
    };
  }
  
  // Run all three tiers
  const exactMatches = await findExactMatches(selectedCards);
  const substitutionMatches = await findSubstitutionMatches(selectedCards);
  const frequencyMatches = await findFrequencyBasedMatches(selectedCards);
  
  // Combine results, removing duplicates
  const allPredictions = [...exactMatches, ...substitutionMatches, ...frequencyMatches];
  const uniquePredictions = [];
  const seenIds = new Set();
  
  allPredictions.forEach(pred => {
    const id = pred._id.toString();
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniquePredictions.push(pred);
    }
  });
  
  // Sort by confidence (exact matches first, then substitution, then frequency)
  uniquePredictions.sort((a, b) => b.confidence - a.confidence);
  
  return {
    predictions: uniquePredictions.slice(0, 20), // Return top 20 predictions
    selectedCards,
    totalFound: uniquePredictions.length,
    breakdown: {
      exact: exactMatches.length,
      substitution: substitutionMatches.length,
      frequency: frequencyMatches.length
    }
  };
}

/**
 * NEW: Predict next cards to add to deck (for real-time suggestions)
 * Returns individual card suggestions based on what commonly appears with selected cards
 * @param {Array} selectedCards - Cards user has already selected
 * @param {Number} limit - Maximum number of suggestions (default: 5)
 */
async function predictNextCards(selectedCards, limit = 5) {
  if (!Array.isArray(selectedCards) || selectedCards.length === 0) {
    return {
      suggestedCards: [],
      message: 'No cards selected'
    };
  }
  
  // User already has 8 cards - deck is complete
  if (selectedCards.length >= 8) {
    return {
      suggestedCards: [],
      message: 'Deck is already complete (8 cards)'
    };
  }
  
  // Run all three tiers to find relevant decks
  const exactMatches = await findExactMatches(selectedCards);
  const substitutionMatches = await findSubstitutionMatches(selectedCards);
  const frequencyMatches = await findFrequencyBasedMatches(selectedCards);
  
  // Combine all matched decks (remove duplicates)
  const allDecks = [...exactMatches, ...substitutionMatches, ...frequencyMatches];
  const uniqueDecks = [];
  const seenIds = new Set();
  
  allDecks.forEach(deck => {
    const id = deck._id.toString();
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniqueDecks.push(deck);
    }
  });
  
  if (uniqueDecks.length === 0) {
    return {
      suggestedCards: [],
      message: 'No matching decks found in database'
    };
  }
  
  // Count frequency of cards that are NOT in user's selection
  const numCardsNeeded = 8 - selectedCards.length;
  const cardFrequency = {};
  
  uniqueDecks.forEach(deck => {
    // Get cards from this deck that user doesn't have
    const missingCards = deck.cards.filter(card => !selectedCards.includes(card));
    
    // CRITICAL: Only count cards if this deck needs exactly the right number
    // This ensures we only suggest cards that actually complete viable decks
    if (missingCards.length === numCardsNeeded) {
      missingCards.forEach(card => {
        cardFrequency[card] = (cardFrequency[card] || 0) + 1;
      });
    }
  });
  
  // Convert to array and calculate percentages
  const totalDecks = Object.values(cardFrequency).reduce((sum, count) => {
    // Count how many decks we actually analyzed
    return Math.max(sum, count);
  }, 0);
  
  const suggestions = Object.entries(cardFrequency)
    .map(([card, count]) => {
      // Calculate frequency as percentage of decks that contain this card
      const decksWithCard = uniqueDecks.filter(deck => 
        deck.cards.includes(card) && !selectedCards.includes(card)
      ).length;
      
      return {
        card,
        frequency: Math.round((count / uniqueDecks.length) * 100),
        appearsIn: count
      };
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
  
  return {
    suggestedCards: suggestions,
    selectedCards,
    cardsNeeded: numCardsNeeded,
    decksAnalyzed: uniqueDecks.length,
    breakdown: {
      exact: exactMatches.length,
      substitution: substitutionMatches.length,
      frequency: frequencyMatches.length
    }
  };
}

module.exports = {
  predictDeck,
  predictNextCards,
  findExactMatches,
  findSubstitutionMatches,
  findFrequencyBasedMatches
};
