const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  getProductsByCategory, 
  getCategories,
  getAnalytics
} = require('../controllers/productController');

// IMPORTANT: specific routes must come before :id wildcard
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/analytics', getAnalytics);
router.get('/category/:cat', getProductsByCategory);
router.get('/:id', getProductById);  // wildcard last

module.exports = router;
