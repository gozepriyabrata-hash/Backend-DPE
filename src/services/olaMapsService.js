const axios = require('axios');

/**
 * Service for interacting with Ola Maps (Krutrim Cloud)
 */

const OLA_BASE_URL = 'https://api.olamaps.io';

/**
 * Get suggestions for a place search
 */
const getAutocomplete = async (input) => {
  const apiKey = process.env.OLA_MAPS_API_KEY;
  if (!apiKey) throw new Error('OLA_MAPS_API_KEY is not defined');

  try {
    const response = await axios.get(`${OLA_BASE_URL}/places/v1/autocomplete`, {
      params: {
        input,
        api_key: apiKey
      }
    });
    return response.data.predictions || [];
  } catch (error) {
    console.error('Ola Maps Autocomplete Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get directions between two points
 * @param {string} origin - "lat,lng"
 * @param {string} destination - "lat,lng"
 */
const getDirections = async (origin, destination) => {
  const apiKey = process.env.OLA_MAPS_API_KEY;
  if (!apiKey) throw new Error('OLA_MAPS_API_KEY is not defined');

  try {
    // Note: Ola Directions might take origin/destination as query params or body.
    // Based on the docs screenshot, it's a POST/GET with params.
    const response = await axios.post(`${OLA_BASE_URL}/routing/v1/directions`, null, {
      params: {
        origin,
        destination,
        api_key: apiKey
      }
    });

    // Extract distance and duration from the response
    // Response structure typically: { routes: [ { legs: [ { distance: x, duration: y } ] } ] }
    const route = response.data.routes?.[0]?.legs?.[0];
    if (!route) return null;

    return {
      distance: route.distance / 1000, // convert meters to KM
      duration: route.duration / 60,   // convert seconds to Minutes
      points: response.data.routes[0].overview_polyline
    };
  } catch (error) {
    console.error('Ola Maps Directions Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get Place Details (to resolve coordinates from a place_id)
 */
const getPlaceDetails = async (placeId) => {
  const apiKey = process.env.OLA_MAPS_API_KEY;
  try {
    const response = await axios.get(`${OLA_BASE_URL}/places/v1/details`, {
      params: {
        place_id: placeId,
        api_key: apiKey
      }
    });
    // Extract lat/lng
    const location = response.data.result?.geometry?.location;
    return location ? `${location.lat},${location.lng}` : null;
  } catch (error) {
    console.error('Ola Maps Details Error:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Get Reverse Geocode (Coordinates to Address)
 */
const reverseGeocode = async (lat, lng) => {
  const apiKey = process.env.OLA_MAPS_API_KEY;
  if (!apiKey) throw new Error('OLA_MAPS_API_KEY is not defined');

  try {
    const response = await axios.get(`${OLA_BASE_URL}/places/v1/reverse-geocode`, {
      params: {
        latlng: `${lat},${lng}`,
        api_key: apiKey
      }
    });
    
    const results = response.data.results || [];
    if (results.length > 0) {
      return {
        address: results[0].formatted_address,
        placeId: `${lat},${lng}` // We use lat,lng as the "placeId" so the backend passes it directly
      };
    }
    return null;
  } catch (error) {
    console.error('Ola Maps Reverse Geocode Error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  getAutocomplete,
  getDirections,
  getPlaceDetails,
  reverseGeocode
};
