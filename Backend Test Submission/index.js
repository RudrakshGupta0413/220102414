const express = require("express");
const validUrl = require("valid-url");
const { log } = require("./logging");
const urlData = require("./data");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

app.use(express.json());

function generateShortcode() {
  return crypto.randomBytes(4).toString("hex").substring(0, 6);
}

// 1. Create Short URL (POST /shorturls)
app.post("/shorturls", async (req, res) => {
  const { url, validity, shortcode } = req.body;

  await log("backend", "info", "route", "POST /shorturls requested");

  if (!validUrl.isUri(url)) {
    await log("backend", "error", "route", "Invalid URL provided");
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  let finalShortcode = shortcode;
  if (!finalShortcode) {
    finalShortcode = generateShortcode();
    await log(
      "backend",
      "info",
      "route",
      `No custom shortcode provided, generated a new one: ${finalShortcode}`
    );
  } else if (urlData.has(finalShortcode)) {
    finalShortcode = generateShortcode();
    await log(
      "backend",
      "warn",
      "route",
      `Custom shortcode already exists, generating new one: ${finalShortcode}`
    );
  }

  const expiryMinutes = validity || 30;
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

  urlData.set(finalShortcode, {
    url,
    expiry: expiryDate.toISOString(),
    clicks: [],
    creationDate: new Date().toISOString(),
  });

  await log(
    "backend",
    "info",
    "route",
    `Short URL created for ${url} with shortcode ${finalShortcode}`
  );

  res.status(201).json({
    shortLink: `${BASE_URL}/${finalShortcode}`,
    expiry: expiryDate.toISOString(),
  });
});

// 2. Retrieve Short URL Statistics (GET /shorturls/:shortcode)
app.get("/shorturls/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  await log(
    "backend",
    "info",
    "route",
    `GET /shorturls/${shortcode} requested`
  );

  const entry = urlData.get(shortcode);

  if (!entry) {
    await log("backend", "error", "route", `Shortcode ${shortcode} not found`);
    return res.status(404).json({ error: "Shortcode not found" });
  }

  const { url, expiry, creationDate, clicks } = entry;
  const totalClicks = clicks.length;

  await log(
    "backend",
    "info",
    "route",
    `Statistics for ${shortcode} retrieved successfully`
  );

  res.status(200).json({
    totalClicks,
    originalUrlInfo: {
      originalUrl: url,
      creationDate,
      expiryDate: expiry,
    },
    detailedClickData: clicks,
  });
});

// 3. Redirection (GET /:shortcode)
app.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;
  const referrer = req.headers.referer || "unknown";
  const ipAddress = req.ip;

  await log(
    "backend",
    "info",
    "route",
    `Redirection for ${shortcode} requested from ${referrer}`
  );

  const entry = urlData.get(shortcode);

  if (!entry || new Date() > new Date(entry.expiry)) {
    await log(
      "backend",
      "error",
      "route",
      `Invalid or expired shortcode: ${shortcode}`
    );
    return res
      .status(404)
      .json({ error: "Shortcode not found or has expired" });
  }

  entry.clicks.push({
    timestamp: new Date().toISOString(),
    source: referrer,
    location: ipAddress,
  });

  await log("backend", "info", "route", `Redirecting to ${entry.url}`);
  res.redirect(302, entry.url);
});

// Start the server
app.listen(PORT, () => {
  console.log(`URL Shortener Microservice is running on port ${PORT}`);

  log(
    "backend",
    "info",
    "server",
    `URL Shortener Microservice started on port ${PORT}`
  );
});
