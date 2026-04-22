const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL_SECONDS || 60 });
const DUMMYJSON_URL = process.env.DUMMYJSON_BASE_URL || 'https://dummyjson.com';

const getProductsFromDummyJSON = async (endpoint = '/products', params = {}) => {
  const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(`${DUMMYJSON_URL}${endpoint}`, { params });
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(`DummyJSON Fetch Error: ${error.message}`);
    throw error;
  }
};

module.exports = { getProductsFromDummyJSON };
