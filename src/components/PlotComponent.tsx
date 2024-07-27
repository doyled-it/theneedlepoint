import React, { useState } from "react";
import Plot from "react-plotly.js";
import { ReviewData, getPlotData } from "../data";
import * as Plotly from "plotly.js";

interface PlotComponentProps {
  data: ReviewData[];
}

const PlotComponent: React.FC<PlotComponentProps> = ({ data }) => {
  const [hoverInfo, setHoverInfo] = useState<{
    artist: string;
    album: string;
    date: string;
    score: string;
    thumbnail: string;
    x: number;
    y: number;
  } | null>(null);

  const { data: plotData, layout } = getPlotData(data);

  const handleHover = (event: Plotly.PlotMouseEvent) => {
    const point = event.points[0];

    if (
      point.customdata &&
      Array.isArray(point.customdata) &&
      point.customdata.length > 4 &&
      point.x
    ) {
      const customData = point.customdata as unknown as [
        string,
        string,
        string,
        string,
        string
      ];
      const hoverData = {
        artist: customData[1],
        album: customData[2],
        date: new Date(point.x as string | number | Date).toDateString(),
        score: customData[0],
        thumbnail: customData[4],
        x: event.event.clientX,
        y: event.event.clientY,
      };
      setHoverInfo(hoverData);
    }
  };

  const handleUnhover = () => {
    setHoverInfo(null);
  };

  return (
    <div style={{ position: "relative" }}>
      <Plot
        data={plotData.map((trace) => ({ ...trace, hoverinfo: "none" }))}
        layout={layout}
        config={{ responsive: true }}
        onHover={handleHover}
        onUnhover={handleUnhover}
      />
      {hoverInfo && (
        <div
          style={{
            position: "absolute",
            left: hoverInfo.x + 10,
            top: hoverInfo.y + 10,
            background: "white",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            zIndex: 10,
            pointerEvents: "none",
            maxWidth: "200px",
          }}
        >
          <b>
            {hoverInfo.artist} - {hoverInfo.album}
          </b>
          <br />
          <img
            src={hoverInfo.thumbnail}
            style={{ width: "50px", height: "50px" }}
            alt="Album Art"
          />
          <br />
          Date: {hoverInfo.date}
          <br />
          Score: {hoverInfo.score}
          <br />
        </div>
      )}
    </div>
  );
};

export default PlotComponent;
