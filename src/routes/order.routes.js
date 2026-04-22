const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createOrder, 
  getMyOrders, 
  getOrderById 
} = require('../controllers/orderController');

// All order routes are protected
router.use(protect);

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
