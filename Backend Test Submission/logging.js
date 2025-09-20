const axios = require('axios');
require('dotenv').config();

const LOG_API_ENDPOINT = process.env.LOG_API_ENDPOINT;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const TOKEN_TYPE = process.env.TOKEN_TYPE;


async function log(stack, level, pkg, message) {
  try {
    const requestBody = {
      stack,
      level,
      package: pkg,
      message,
    };

    const headers = {
      'Authorization': `${TOKEN_TYPE} ${ACCESS_TOKEN}`,
    };

    await axios.post(LOG_API_ENDPOINT, requestBody, { headers });
  } catch (error) {
    console.error('Logging to external service failed:', error.message);
  }
}

module.exports = { log };