const express = require('express');
const router = express.Router();
const cabController = require('../controllers/cabController');

// @route   GET /api/cab/autocomplete
router.get('/autocomplete', cabController.getAutocomplete);

// @route   GET /api/cab/reverse-geocode
router.get('/reverse-geocode', cabController.reverseGeocode);

// @route   GET /api/cab/place-details
router.get('/place-details', cabController.getPlaceDetails);

// @route   POST /api/cab/estimate
router.post('/estimate', cabController.getEstimate);

module.exports = router;
