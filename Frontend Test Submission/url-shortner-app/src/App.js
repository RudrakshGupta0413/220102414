import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import ShortnerPage from "./pages/ShortnerPage";
import StatisticsPage from "./pages/StatisticsPage";

const App = () => {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AffordMed URL Shortener
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button color="inherit" component={Link} to="/">
              Shorten
            </Button>
            <Button color="inherit" component={Link} to="/stats">
              Statistics
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<ShortnerPage />} />
        <Route path="/stats" element={<StatisticsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
