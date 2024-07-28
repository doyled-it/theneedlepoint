import React, { useState, useEffect } from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  MenuItem,
  Select,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import YearBoxPlotComponent from "./components/YearBoxPlotComponent";
import ScoreYearComponent from "./components/ScoreYearComponent";
import GenreBoxPlotComponent from "./components/GenreBoxPlotComponent";
import FilterableBoxPlotComponent from "./components/FilterableBoxPlotComponent";
import AboutComponent from "./components/AboutComponent";
import { ReviewData, processJsonl } from "./data";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#F9F28D",
    },
    text: {
      primary: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
});

const App: React.FC = () => {
  const [selectedPlot, setSelectedPlot] = useState<string>("Score vs Date");
  const [data, setData] = useState<ReviewData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/doyled-it/theneedlescrape/main/data/mbid_review_info.jsonl"
        );
        const rawData = await response.text();
        const processedData = processJsonl(rawData);
        setData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handlePlotChange = (event: SelectChangeEvent) => {
    setSelectedPlot(event.target.value as string);
  };

  const renderPlot = () => {
    switch (selectedPlot) {
      case "Score vs Date":
        return <ScoreYearComponent data={data} />;
      case "Score vs Year":
        return <YearBoxPlotComponent data={data} />;
      case "Genre Comparison":
        return <GenreBoxPlotComponent data={data} />;
      case "Custom Box Plot Comparison":
        return <FilterableBoxPlotComponent data={data} />;
      case "About":
        return <AboutComponent />;
      default:
        return <ScoreYearComponent data={data} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          backgroundColor: "#F9F28D",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, cursor: "pointer" }}
              onClick={() => setSelectedPlot("Score vs Date")}
            >
              The Needle Point
            </Typography>
            <Select
              value={selectedPlot}
              onChange={handlePlotChange}
              displayEmpty
              inputProps={{ "aria-label": "Select Plot" }}
              sx={{
                color: "primary",
                backgroundColor: "#333333",
                borderRadius: "4px",
                "& .MuiSelect-icon": {
                  color: "#FFFFFF",
                },
                "&:hover": {
                  backgroundColor: "#555555",
                },
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: "#333333",
                    color: "#FFFFFF",
                  },
                },
              }}
            >
              <MenuItem value="Score vs Date">Score vs Date</MenuItem>
              <MenuItem value="Score vs Year">Score vs Year</MenuItem>
              <MenuItem value="Genre Comparison">Genre Comparison</MenuItem>
              <MenuItem value="Custom Box Plot Comparison">
                Custom Box Plot Comparison
              </MenuItem>
            </Select>
            <Button
              color="inherit"
              onClick={() => setSelectedPlot("About")}
              sx={{ marginLeft: 2 }}
            >
              About
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ flex: 1, marginTop: 4 }}>{renderPlot()}</Container>
      </div>
    </ThemeProvider>
  );
};

export default App;
