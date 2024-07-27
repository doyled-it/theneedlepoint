import React, { useState, useEffect } from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import YearBoxPlotComponent from "./components/YearBoxPlotComponent"; // Assuming you have a YearBoxPlotComponent
import ScoreYearComponent from "./components/ScoreYearComponent"; // Assuming you have a ScoreYearComponent
import { ReviewData, processJsonl } from "./data";

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
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            The Needle Drop Reviews
          </Typography>
          <Select
            value={selectedPlot}
            onChange={handlePlotChange}
            displayEmpty
            inputProps={{ "aria-label": "Select Plot" }}
            sx={{ color: "white", borderBottom: "1px solid white" }}
          >
            <MenuItem value="Score vs Date">Score vs Date</MenuItem>
            <MenuItem value="Score vs Year">Score vs Year</MenuItem>
            {/* Add more options here */}
          </Select>
        </Toolbar>
      </AppBar>
      <Container sx={{ marginTop: 4 }}>{renderPlot()}</Container>
    </div>
  );
};

export default App;
