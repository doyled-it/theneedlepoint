import React, { useState, useEffect } from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  MenuItem,
  Select,
  SelectChangeEvent,
  MenuProps,
} from "@mui/material";
import YearBoxPlotComponent from "./components/YearBoxPlotComponent";
import ScoreYearComponent from "./components/ScoreYearComponent";
import { ReviewData, processJsonl } from "./data";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000000", // Black color for AppBar
    },
    secondary: {
      main: "#1c1c1c", // Off-black color for dropdown background
    },
    text: {
      primary: "#FFFFFF", // White color for text
    },
  },
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
});

const menuProps: Partial<MenuProps> = {
  PaperProps: {
    style: {
      backgroundColor: "#1c1c1c",
      color: "#FFFFFF",
    },
  },
};

const App: React.FC = () => {
  const [selectedPlot, setSelectedPlot] = useState<string>("Score vs Date");
  const [data, setData] = useState<ReviewData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/doyled-it/theneedlescrape/main/data/review_info_w_cover_art.jsonl"
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
              sx={{ flexGrow: 1, color: "text.primary" }}
            >
              The Needle Point
            </Typography>
            <Select
              value={selectedPlot}
              onChange={handlePlotChange}
              displayEmpty
              inputProps={{ "aria-label": "Select Plot" }}
              MenuProps={menuProps}
              sx={{
                color: "text.primary",
                backgroundColor: "secondary.main",
                borderRadius: "4px",
                ".MuiSvgIcon-root": {
                  color: "text.primary",
                },
              }}
            >
              <MenuItem value="Score vs Date" sx={{ color: "text.primary" }}>
                Score vs Date
              </MenuItem>
              <MenuItem value="Score vs Year" sx={{ color: "text.primary" }}>
                Score vs Year
              </MenuItem>
              {/* Add more options here */}
            </Select>
          </Toolbar>
        </AppBar>
        <Container sx={{ flex: 1, marginTop: 4 }}>{renderPlot()}</Container>
      </div>
    </ThemeProvider>
  );
};

export default App;
