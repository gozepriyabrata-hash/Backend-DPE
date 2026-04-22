const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, // e.g. "s1", "l2"
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  platform: { type: String, required: true },
  price: { type: Number, required: true },       // base price in INR
  rating: { type: Number, required: true },
  reviewCount: { type: Number, default: 0 },
  stock: { type: Number, required: true },
  purchaseCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  salesLast7Days: { type: Number, default: 0 },
  brandScore: { type: Number, default: 0.8 },
  images: { type: [String], default: [] },
  thumbnail: { type: String, default: '' },
  lastPurchasedAt: { type: Date },
}, { timestamps: true });

// Text index for search
productSchema.index({ title: 'text', category: 'text', description: 'text' });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
