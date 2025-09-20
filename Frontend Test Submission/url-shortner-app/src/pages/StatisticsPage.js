import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import log from "../components/Logger";

const API_ENDPOINT = "http://localhost:3000/shorturls";

const StatisticsPage = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const shortcode = "mdn-docs";
      const response = await axios.get(`${API_ENDPOINT}/${shortcode}`);
      setStats([response.data]);
      await log(
        "frontend",
        "info",
        "page",
        `Fetched stats for shortcode: ${shortcode}`
      );
    } catch (err) {
      setError(
        "Failed to fetch statistics. Please ensure the shortcode exists."
      );
      await log(
        "frontend",
        "fatal",
        "api",
        `Failed to fetch stats: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        mt={4}
      >
        URL Shortener Statistics
      </Typography>
      <Box sx={{ mt: 3 }}>
        <List>
          {stats.map((stat, index) => (
            <ListItem key={index} disablePadding>
              <Card variant="outlined" sx={{ width: "100%", mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    Short URL: http://localhost:3000/YOUR_SHORTCODE
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Clicks: {stat.totalClicks}
                  </Typography>
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Click Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {stat.detailedClickData.length > 0 ? (
                        stat.detailedClickData.map((click, i) => (
                          <Box key={i} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              Timestamp:{" "}
                              {new Date(click.timestamp).toLocaleString()}
                            </Typography>
                            <Typography variant="body2">
                              Source: {click.source}
                            </Typography>
                            <Typography variant="body2">
                              Location: {click.location}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No clicks recorded yet.
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default StatisticsPage;
