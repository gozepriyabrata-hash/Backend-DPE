const axios = require('axios');

/**
 * Service for interacting with OpenWeatherMap API
 */

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Get real-time weather based on coordinates to determine Cab SURGE condition
 * Returns 'CLEAR', 'RAIN', or 'STORM'
 */
const getRealWeather = async (lat, lng) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return 'CLEAR'; // Fallback

  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        lat,
        lon: lng,
        appid: apiKey
      }
    });

    const weatherId = response.data.weather?.[0]?.id;
    if (!weatherId) return 'CLEAR';

    // OpenWeatherMap Condition Codes
    // 2xx = Thunderstorm -> STORM
    if (weatherId >= 200 && weatherId < 300) return 'STORM';
    
    // 5xx = Rain, 3xx = Drizzle, 6xx = Snow -> RAIN
    if (weatherId >= 300 && weatherId < 700) return 'RAIN';
    
    // 7xx = Atmosphere (Fog, etc), 800 = Clear, 80x = Clouds -> CLEAR
    return 'CLEAR';

  } catch (error) {
    console.error('OpenWeather API Error:', error.response?.data || error.message);
    return 'CLEAR'; // Graceful degradation
  }
};

module.exports = {
  getRealWeather
};
