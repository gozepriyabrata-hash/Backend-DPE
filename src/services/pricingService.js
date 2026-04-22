// backend/src/services/pricingService.js

/**
 * Applies dynamic pricing logic to a product object.
 * 
 * Updated for INR pricing with percentage-based competitor offset.
 * Logic:
 * 1. Demand Score = rating * salesLast7Days (or fallback to rating * purchaseCount/10)
 * 2. Demand Factor: > HIGH (1.2), > MED (1.1), else (0.9)
 * 3. Stock Factor: < 20 (1.3), < 50 (1.1), > 80 (0.8), else (1.0)
 * 4. Competitor Price: basePrice * (1 - COMP_OFFSET_PCT) — default 5% below base
 * 5. Final Price: max(1.0, min(basePrice * demandFactor * stockFactor, competitorPrice))
 */

function applyDynamicPricing(product, minCompetitorPrice) {
  const {
    price: basePrice,
    rating = 4,
    brandScore = 0.8,
    views = 0,
    stock = 0,
    salesLast7Days = 0,
    purchaseCount  = 0,
  } = product;

  // 1. Demand & Stock Rule Context
  const demandScore = (purchaseCount * 0.5) + (views * 0.2) + (salesLast7Days * 0.3);
  let demandFactor = 1.0;
  let stockFactor = 1.0;

  // Demand Rules
  const isDemandHigh = demandScore > 50; 
  const isDemandLow = demandScore <= 20 && demandScore > 0;
  const isCompetitorCheaper = minCompetitorPrice < basePrice;

  if (isDemandHigh && isCompetitorCheaper) {
      demandFactor = 1.01; // DON'T increase much
  } else if (isDemandHigh && !isCompetitorCheaper) {
      demandFactor = 1.05; // increase price (profit)
  } else if (isDemandLow) {
      demandFactor = 0.95; // decrease price (attract users)
  }

  // Stock Rules
  const isStockHigh = stock > 70;
  if (isStockHigh) {
      stockFactor = 0.95; // decrease price (clear inventory)
  } else if (stock < 30) {
      stockFactor = 1.05; // standard scarcity bump
  }

  // 2. Trust Factor
  const trustScore = (rating / 5) * brandScore;
  const trustFactor = 1 + (trustScore * 0.05);

  // 3. Conversion / Competition Factor
  let conversionFactor = 1.0;
  const priceDifference = Math.abs(basePrice - minCompetitorPrice);
  const isRoughlyEqual = priceDifference <= (basePrice * 0.02); // 2% margin of error for "approximate"

  if (basePrice > minCompetitorPrice && !isRoughlyEqual) {
      const targetRatio = minCompetitorPrice / basePrice;
      conversionFactor = targetRatio * 0.95; // Organically undercut the floor by 5%
  } else if (isRoughlyEqual) {
      conversionFactor = 0.97; // Organically undercut if we are already at the floor
  } else {
      conversionFactor = 1.05; // increase profit slightly
  }

  // 4. Final Dynamic Price Execution
  const rawPrice = basePrice * demandFactor * stockFactor * trustFactor * conversionFactor;
  
  // Ensure absolute safety net based on final instruction -> if we somehow STILL exceed the market, force it lower.
  let boundedPrice = rawPrice;
  if (boundedPrice > minCompetitorPrice) {
      boundedPrice = minCompetitorPrice * 0.99; // Force 1% undercut worst-case scenario
  }

  const rounded = Math.round(Math.max(1, boundedPrice));

  return {
    ...product,
    basePrice,
    dynamicPrice: rounded,
    discountPercent: Math.max(0, Math.round((1 - rounded / basePrice) * 100)),
    demandFactor: parseFloat(demandFactor.toFixed(3)),
    stockFactor,
    trustFactor: parseFloat(trustFactor.toFixed(3)),
    competitionFactor: conversionFactor,
    competitorPrice: minCompetitorPrice,
    maxQuantity: Math.max(1, Math.floor(stock * 0.8)),
    stockStatus: stock < 30 ? 'critical_stock' : stock < 70 ? 'low_stock' : 'in_stock',
  };
}

module.exports = { applyDynamicPricing };
