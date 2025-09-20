import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import log from "../components/Logger";

const API_ENDPOINT = "http://localhost:3000/shorturls";

const ShortenerPage = () => {
  const [urls, setUrls] = useState(
  Array(5).fill(null).map(() => ({ originalUrl: '', validity: '', shortcode: '' }))
);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUrlChange = (e, index, field) => {
    const newUrls = [...urls];
    newUrls[index][field] = e.target.value;
    setUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);

    await log("frontend", "info", "page", "Shorten URL form submitted");

    try {
      const validUrls = urls.filter((u) => u.originalUrl.trim() !== "");
      if (validUrls.length === 0) {
        setError("Please enter at least one URL.");
        await log("frontend", "error", "form", "No URLs entered");
        setLoading(false);
        return;
      }

      const postRequests = validUrls.map((urlData) =>
        axios.post(API_ENDPOINT, {
          url: urlData.originalUrl,
          validity: urlData.validity ? parseInt(urlData.validity) : undefined,
          shortcode: urlData.shortcode || undefined,
        })
      );

      const responses = await Promise.all(postRequests);
      const newResults = responses.map((res, index) => ({
        originalUrl: validUrls[index].originalUrl,
        shortLink: res.data.shortLink,
        expiry: res.data.expiry,
      }));

      setResults(newResults);
      await log("frontend", "info", "api", "Successfully shortened URLs");
    } catch (err) {
      setError("An error occurred. Please check your URLs and try again.");
      await log(
        "frontend",
        "fatal",
        "api",
        `Failed to shorten URLs: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    await log("frontend", "info", "ui", "Short link copied to clipboard");
  };

  return (
    <Container maxWidth="md">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        mt={4}
      >
        URL Shortener
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {urls.map((url, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={`Original URL ${index + 1}`}
                  value={url.originalUrl}
                  onChange={(e) => handleUrlChange(e, index, "originalUrl")}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Validity (min)"
                  type="number"
                  value={url.validity}
                  onChange={(e) => handleUrlChange(e, index, "validity")}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Shortcode (optional)"
                  value={url.shortcode}
                  onChange={(e) => handleUrlChange(e, index, "shortcode")}
                  variant="outlined"
                />
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Shorten URLs"}
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Shortened URLs
          </Typography>
          <Grid container spacing={2}>
            {results.map((res, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body1" color="text.secondary">
                      Original: {res.originalUrl}
                    </Typography>
                    <Typography variant="h6" component="p" sx={{ mt: 1 }}>
                      Short Link:
                      <a
                        href={res.shortLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {res.shortLink}
                      </a>
                      <Button onClick={() => handleCopy(res.shortLink)}>
                        <ContentCopyIcon fontSize="small" />
                      </Button>
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Expires: {new Date(res.expiry).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ShortenerPage;
