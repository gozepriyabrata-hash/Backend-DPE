/**
 * Cab Dynamic Pricing Engine
 * Calculates fares based on distance, duration, weather, and traffic factors.
 */

const FLEET_CONFIG = {
  MINI: {
    baseFare: 50,
    perKmRate: 10,
    perMinRate: 1,
    multiplier: 1.0,
    label: 'Mini',
    description: 'Comfy, small hatchbacks'
  },
  SEDAN: {
    baseFare: 80,
    perKmRate: 15,
    perMinRate: 2,
    multiplier: 1.2,
    label: 'Sedan',
    description: 'Spacious & reliable sedans'
  },
  SUV: {
    baseFare: 120,
    perKmRate: 22,
    perMinRate: 3,
    multiplier: 1.5,
    label: 'SUV',
    description: 'Perfect for groups and luggage'
  },
  LUX: {
    baseFare: 250,
    perKmRate: 40,
    perMinRate: 5,
    multiplier: 2.2,
    label: 'Luxury',
    description: 'Premium cars with top-rated drivers'
  }
};

const WEATHER_SURGE = {
  CLEAR: 1.0,
  RAIN: 1.4,
  STORM: 1.8,
  SNOW: 1.6
};

/**
 * Calculates estimation for all fleet types
 * @param {number} distance - Distance in kilometers
 * @param {number} duration - Duration in minutes 
 * @param {string} weather - Current weather Condition
 * @param {number} trafficLevel - Density factor (1.0 = normal, >1.0 = congested)
 */
const calculateAllFares = (distance, duration, weather = 'CLEAR', trafficLevel = 1.0) => {
  const weatherMultiplier = WEATHER_SURGE[weather.toUpperCase()] || 1.0;
  
  // Traffic Surge: Additional multiplier if traffic is heavy
  // trafficLevel is typical computed as (Actual Time / Standard Time)
  const trafficMultiplier = trafficLevel > 1.2 ? Math.min(1.5, trafficLevel * 0.8) : 1.0;

  const totalSurge = parseFloat((weatherMultiplier * trafficMultiplier).toFixed(2));

  return Object.keys(FLEET_CONFIG).map(key => {
    const fleet = FLEET_CONFIG[key];
    
    // Core Formula: [Base + (Dist * Rate) + (Time * Rate)] * Total Multiplier
    const subtotal = fleet.baseFare + (distance * fleet.perKmRate) + (duration * fleet.perMinRate);
    const finalFare = Math.round(subtotal * totalSurge);

    return {
      type: key,
      label: fleet.label,
      description: fleet.description,
      baseFare: fleet.baseFare,
      estimatedFare: finalFare,
      surgeMultiplier: totalSurge,
      isSurgeActive: totalSurge > 1.0,
      factors: {
        weather: weatherMultiplier,
        traffic: trafficMultiplier
      }
    };
  });
};

module.exports = {
  calculateAllFares,
  FLEET_CONFIG,
  WEATHER_SURGE
};
