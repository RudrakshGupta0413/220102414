import axios from "axios";

const LOG_API_ENDPOINT = process.env.REACT_APP_LOG_API_ENDPOINT;
const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;
const TOKEN_TYPE = process.env.REACT_APP_TOKEN_TYPE;

const log = async (stack, level, pkg, message) => {
  try {
    const requestBody = {
      stack,
      level,
      package: pkg,
      message,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `${TOKEN_TYPE} ${ACCESS_TOKEN}`,
    };

    await axios.post(LOG_API_ENDPOINT, requestBody, { headers });
  } catch (error) {}
};

export default log;
