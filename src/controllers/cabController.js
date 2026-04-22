const { calculateAllFares } = require('../services/cabPricingEngine');
const olaService = require('../services/olaMapsService');
const weatherService = require('../services/weatherService');

/**
 * Cab Controller - Handles fare estimation and logic
 */

/**
 * @desc    Autocomplete location search using Ola Maps
 * @route   GET /api/cab/autocomplete
 */
exports.getAutocomplete = async (req, res) => {
  try {
    const { input } = req.query;
    if (!input || input.length < 3) return res.json([]);

    const suggestions = await olaService.getAutocomplete(input);
    
    // Map suggestions to a consistent format for the frontend
    const results = suggestions.map(s => {
      let mainText = s.description.split(',')[0];
      let secondaryText = s.description.substring(mainText.length + 1).trim() || '';
      
      if (s.structured_formatting) {
        mainText = s.structured_formatting.main_text || mainText;
        secondaryText = s.structured_formatting.secondary_text || secondaryText;
      }

      return {
        name: s.description,
        mainText,
        secondaryText,
        placeId: s.place_id
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Autocomplete API error:', error.message);
    res.status(500).json({ message: 'Error fetching suggestions' });
  }
};

/**
 * @desc    Reverse Geocode coordinates to address
 * @route   GET /api/cab/reverse-geocode
 */
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const result = await olaService.reverseGeocode(lat, lng);
    if (!result) return res.status(404).json({ message: 'Address not found' });

    res.json(result);
  } catch (error) {
    console.error('Reverse Geocode API error:', error.message);
    res.status(500).json({ message: 'Error fetching address' });
  }
};

/**
 * @desc    Get coordinates for a specific placeId
 * @route   GET /api/cab/place-details
 */
exports.getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) return res.status(400).json({ message: 'placeId is required' });

    const coords = await olaService.getPlaceDetails(placeId);
    if (!coords) return res.status(404).json({ message: 'Coordinates not found' });

    res.json({ coords });
  } catch (error) {
    console.error('Place Details API error:', error.message);
    res.status(500).json({ message: 'Error fetching place details' });
  }
};

/**
 * @desc    Get fare estimates based on source & destination
 * @route   POST /api/cab/estimate
 */
exports.getEstimate = async (req, res) => {
  try {
    const { source, destination, sourceId, destId, simulateWeather, simulateTraffic } = req.body;

    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and Destination are required' });
    }

    // 1. Resolve coordinates if IDs are provided
    let origin = source;
    let target = destination;

    // Helper: check if a string is already "lat,lng" coordinates
    const isCoordString = (s) => {
      if (!s || typeof s !== 'string') return false;
      const parts = s.split(',');
      return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);
    };

    // If sourceId is already coordinates (from auto-detect reverse geocode), use directly
    if (sourceId && isCoordString(sourceId)) {
      origin = sourceId;
    } else if (sourceId) {
      origin = await olaService.getPlaceDetails(sourceId) || origin;
    }

    if (destId && isCoordString(destId)) {
      target = destId;
    } else if (destId) {
      target = await olaService.getPlaceDetails(destId) || target;
    }

    // 2. Fetch real routing data
    let routeData;
    try {
      routeData = await olaService.getDirections(origin, target);
    } catch (err) {
      console.warn('Real API failed, falling back to mock routing');
    }

    // Fallback values if real API fails or isn't usable
    const distance = routeData?.distance || parseFloat((Math.random() * 20 + 5).toFixed(1));
    const duration = routeData?.duration || distance * 3;

    // 3. Apply weather/traffic logic
    // Determine real weather if set to AUTO and we have an origin string with coordinates
    let weather = simulateWeather || 'CLEAR';
    
    if (weather === 'AUTO') {
      try {
        const [lat, lng] = origin.split(',');
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          weather = await weatherService.getRealWeather(lat, lng);
        } else {
          weather = 'CLEAR';
        }
      } catch (err) {
        weather = 'CLEAR';
      }
    } else if (!['CLEAR', 'RAIN', 'STORM'].includes(weather)) {
      weather = Math.random() > 0.8 ? 'RAIN' : 'CLEAR';
    }

    const trafficLevel = simulateTraffic || (Math.random() * 0.6 + 0.9); // 0.9 to 1.5


    const finalDuration = Math.round(duration * trafficLevel);
    
    const estimates = calculateAllFares(distance, finalDuration, weather, trafficLevel);

    res.json({
      trip: {
        source,
        destination,
        sourceCoords: origin,
        destCoords: target,
        polyline: routeData?.points,
        distance: distance.toFixed(1),
        duration: finalDuration,
        weather,
        trafficStatus: trafficLevel > 1.3 ? 'Heavy' : trafficLevel > 1.1 ? 'Moderate' : 'Smooth'
      },
      estimates
    });
  } catch (error) {
    console.error('Cab Estimate Error:', error);
    res.status(500).json({ message: 'Error calculating estimates' });
  }
};
