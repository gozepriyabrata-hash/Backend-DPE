// prism/backend/testPricing.js
require('dotenv').config();
const { applyDynamicPricing } = require('./src/services/pricingService');

const mockProduct = {
  id: 1,
  title: "Test High-Demand Item",
  price: 49.99,
  rating: 4.5,
  stock: 15
};

console.log("--- PRISM PRD Worked Example Test ---");
console.log("Inputs:", { price: mockProduct.price, rating: mockProduct.rating, stock: mockProduct.stock });

const result = applyDynamicPricing(mockProduct);

console.log("\nResults:");
console.log("Base Price: $", result.basePrice);
console.log("Demand Factor:", result.demandFactor, "(Expected 1.2)");
console.log("Stock Factor:", result.stockFactor, "(Expected 1.3)");
console.log("Naive Price (Multiplier): $", (result.basePrice * result.demandFactor * result.stockFactor).toFixed(2));
console.log("Competitor Cap: $", result.competitorPrice, "(Expected $39.99)");
console.log("Final Dynamic Price: $", result.dynamicPrice, "(Expected $39.99 due to Cap)");

if (result.dynamicPrice === 39.99) {
  console.log("\n✅ TEST PASSED: Algorithm matches PRD requirements.");
} else {
  console.log("\n❌ TEST FAILED: Price discrepancy detected.");
}
