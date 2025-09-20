require("dotenv").config();
const axios = require("axios");

const LOG_API_ENDPOINT = process.env.LOG_API_ENDPOINT;
const AUTH_API_ENDPOINT = process.env.AUTH_API_ENDPOINT;

// Storing token in memory
let authToken = {
  token: null,
  type: null,
};

const VALID_STACKS = new Set(["backend", "frontend"]);
const VALID_LEVELS = new Set(["debug", "info", "warn", "error", "fatal"]);
const VALID_PACKAGES = {
  backend: new Set([
    "cache",
    "controller",
    "cron_job",
    "db",
    "domain",
    "handler",
    "repository",
    "route",
    "service",
  ]),
  frontend: new Set(["api", "component", "hook", "page", "state", "style"]),
  both: new Set(["auth", "config", "middleware", "utils"]),
};

function validateLogData(stack, level, pkg) {
  if (!VALID_STACKS.has(stack)) {
    throw new Error(
      `Invalid 'stack' value: ${stack}. Must be 'backend' or 'frontend'.`
    );
  }
  if (!VALID_LEVELS.has(level)) {
    throw new Error(`Invalid 'level' value: ${level}.`);
  }
  if (!VALID_PACKAGES[stack].has(pkg) && !VALID_PACKAGES.both.has(pkg)) {
    throw new Error(`Invalid 'package' value: ${pkg} for stack: ${stack}.`);
  }
}

const authenticate = async () => {
  try {
    const authBody = {
      email: process.env.USER_EMAIL,
      name: process.env.USER_NAME,
      rollNo: process.env.USER_ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    };

    const { data } = await axios.post(AUTH_API_ENDPOINT, authBody);

    authToken.token = data.access_token;
    authToken.type = data.token_type;

    console.log(" Access Token obtained successfully.");
  } catch (error) {
    console.error(" Failed to authenticate:", error.message);
    throw error;
  }
};

const sendLog = async (stack, level, pkg, message, isRetry = false) => {
  try {
    if (!authToken.token) {
      console.log("No access token found. Authenticating...");
      await authenticate();
    }

    validateLogData(stack, level, pkg);

    const logPayload = { stack, level, package: pkg, message };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `${authToken.type} ${authToken.token}`,
    };

    const { status, data } = await axios.post(LOG_API_ENDPOINT, logPayload, {
      headers,
    });

    if (status === 200 || status === 201) {
      console.log("\n Log sent successfully!");
      console.log("Payload:", JSON.stringify(logPayload, null, 2));
      console.log("Response:", JSON.stringify(data, null, 2));
      return true;
    } else {
      console.warn(`\n  Log request returned status code: ${status}`);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 401 && !isRetry) {
      // Token is expired. Clear it and retry the log.
      console.log("Token invalid. Re-authenticating and retrying...");
      authToken.token = null;
      return sendLog(stack, level, pkg, message, true);
    } else if (error.response) {
      console.error(
        `\n API Error: Status ${error.response.status}, Details:`,
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error("\n Logging Error:", error.message);
    }
    return false;
  }
};

module.exports = { log: sendLog };
