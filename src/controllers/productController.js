const Product = require('../models/Product');
const { applyDynamicPricing } = require('../services/pricingService');

// Map productId -> id for frontend compatibility
const normalize = (p) => ({ ...p, id: p.productId });

/**
 * Core Aggregation Logic:
 * 1. Fetch products matching filter
 * 2. Apply Dynamic Pricing
 * 3. Group by title
 * 4. Pick cheapest variant (lowest dynamicPrice)
 * 5. Sort & Paginate
 */
const getCheapestVariants = async (filter, skip, limit) => {
  const allProducts = await Product.find(filter);
  
  // Pre-compute the absolute minimum price across platforms for each product title
  // AND dynamically scramble market baselines to eliminate hardcoded dataset bias.
  const minPrices = new Map();
  const volatileProducts = allProducts.map(doc => {
    const raw = doc.toObject();
    
    // Volatility removed for consistency between list and detail view
    const volatility = 0; 
    raw.price = Math.round(raw.price * (1 + volatility));

    if (!minPrices.has(raw.title)) {
      minPrices.set(raw.title, raw.price);
    } else {
      minPrices.set(raw.title, Math.min(minPrices.get(raw.title), raw.price));
    }
    
    return raw;
  });
  
  const grouped = new Map();
  
  volatileProducts.forEach(raw => {
    const minPrice = minPrices.get(raw.title);
    const enriched = applyDynamicPricing(normalize(raw), minPrice);
    
    // Group by title and keep the cheapest one
    if (!grouped.has(enriched.title)) {
      grouped.set(enriched.title, enriched);
    } else {
      const existing = grouped.get(enriched.title);
      // Priority 1: Pick the cheapest dynamic price
      if (enriched.dynamicPrice < existing.dynamicPrice) {
        grouped.set(enriched.title, enriched);
      // Priority 2: If tied, pick the platform with the lowest native base price to favor authentic suppliers
      } else if (enriched.dynamicPrice === existing.dynamicPrice) {
        if (enriched.basePrice < existing.basePrice) {
          grouped.set(enriched.title, enriched);
        }
      }
    }
  });

  const cheapestArray = Array.from(grouped.values())
                             .sort((a, b) => a.title.localeCompare(b.title));

  const total = cheapestArray.length;
  const paginated = cheapestArray.slice(skip, skip + limit);

  return { products: paginated, total };
};

// @desc    Get all products (paginated + optional search) — CHEAPEST ONLY
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip  = parseInt(req.query.skip)  || 0;
    const q     = req.query.q || '';

    const categorySearch = q.toLowerCase() === 'phone' ? 'smartphone' : q;

    const filter = q
      ? { $or: [
          { title:    { $regex: q, $options: 'i' } },
          { category: { $regex: categorySearch, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
        ]}
      : {};

    const { products, total } = await getCheapestVariants(filter, skip, limit);
    res.json({ products, total, limit, skip });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// @desc    Get single product by productId
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Fetch all variants to determine the true competitive minimum
    const variants = await Product.find({ title: product.title });
    const minCompPrice = Math.min(...variants.map(v => v.price));

    const variantsData = variants.map(v => ({
      platform: v.platform,
      price: v.price
    }));

    const enriched = applyDynamicPricing(normalize(product.toObject()), minCompPrice);
    enriched.variants = variantsData;
    res.json(enriched);
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// @desc    Get products by category — CHEAPEST ONLY
// @route   GET /api/products/category/:cat
// @access  Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip  = parseInt(req.query.skip)  || 0;
    const cat   = req.params.cat;

    const { products, total } = await getCheapestVariants({ category: cat }, skip, limit);
    res.json({ products, total, limit, skip });
  } catch (error) {
    console.error('getProductsByCategory error:', error);
    res.status(500).json({ message: 'Error fetching category products' });
  }
};

// @desc    Get all unique categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// @desc    Get Analytics data for comparison graphs
// @route   GET /api/products/analytics
// @access  Public
exports.getAnalytics = async (req, res) => {
  try {
    const allProducts = await Product.find({});
    
    // Pre-compute the absolute minimum price across platforms for each product title
    const minPrices = new Map();
    const volatileProducts = allProducts.map(doc => {
      const raw = doc.toObject();
      const volatility = 0; 
      raw.price = Math.round(raw.price * (1 + volatility));

      if (!minPrices.has(raw.title)) {
        minPrices.set(raw.title, raw.price);
      } else {
        minPrices.set(raw.title, Math.min(minPrices.get(raw.title), raw.price));
      }

      return raw;
    });

    // Group data by title
    const grouped = new Map();
    
    volatileProducts.forEach(raw => {
      const minPrice = minPrices.get(raw.title);
      const enriched = applyDynamicPricing(normalize(raw), minPrice);
      const platform = enriched.platform || 'PRISM';

      if (!grouped.has(enriched.title)) {
        grouped.set(enriched.title, {
          title: enriched.title,
          category: enriched.category
        });
      }
      
      const entry = grouped.get(enriched.title);
      // Construct dynamic keys for recharts
      entry[`${platform}Base`] = enriched.basePrice;
      entry[`${platform}Dynamic`] = enriched.dynamicPrice;
    });

    const analyticsData = Array.from(grouped.values());
    res.json(analyticsData);
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};
