import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { ReviewData } from "../data";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { D3ZoomEvent } from "d3-zoom";

interface ScoreYearComponentProps {
  data: ReviewData[];
}

const ScoreYearComponent: React.FC<ScoreYearComponentProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState<keyof ReviewData>("artist");

  useEffect(() => {
    const margin = { top: 40, right: 30, bottom: 40, left: 40 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const bgColor = "#F9F28D";

    d3.select(svgRef.current).selectAll("*").remove();

    const filteredData = data.filter((d) => {
      const valueToFilter = d[filterType]?.toString().toLowerCase();
      return valueToFilter.includes(filter.toLowerCase());
    });

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background-color", bgColor)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the clip path
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleTime()
      .domain(
        d3.extent(filteredData, (d: ReviewData) => d.date) as [Date, Date]
      )
      .range([0, width]);

    const yPadding = 0.5;

    // Adjust yDomain for more space above and below the points
    const initialYDomain = [0 - yPadding, 10 + yPadding];

    const y = d3.scaleLinear().domain(initialYDomain).range([height, 0]);

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    const yAxis = svg.append("g").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-family", "Montserrat, Arial, sans-serif")
      .style("font-size", "24px")
      .text("THE NEEDLE DROP REVIEWS OVER TIME");

    const tooltip = d3.select(tooltipRef.current);

    const handleMouseOver = (event: MouseEvent, d: ReviewData) => {
      tooltip.style("opacity", 1);
      tooltip.html(`
        <div>
          <strong>${d.artist} - ${d.album}</strong><br>
          <div style="display: flex;">
            <img src="${
              d.cover_art_thumbnail
            }" style="width: 50px; height: 50px; margin-right: 10px;">
            <div>
              <div>Date: ${d.date.toDateString()}</div>
              <div>Score: ${d.original_score}</div>
            </div>
          </div>
        </div>
      `);
      const tooltipWidth = tooltip.node()?.clientWidth || 0;
      const tooltipHeight = tooltip.node()?.clientHeight || 0;
      // tooltip.style("left", `${event.clientX - tooltipWidth / 2}px`);
      // tooltip.style("top", `${event.clientY - tooltipHeight - 10}px`);
      tooltip.style("left", `${event.clientX - tooltipWidth / 2}px`);
      tooltip.style("top", `${event.clientY - tooltipHeight - 10}px`);
    };

    const handleMouseOut = () => {
      tooltip.style("opacity", 0);
    };

    const handleDotClick = (d: ReviewData) => {
      if (d.youtube_link) {
        window.open(d.youtube_link, "_blank");
      }
    };

    const dots = svg
      .append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll(".dot")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d: ReviewData) => x(d.date))
      .attr("cy", (d: ReviewData) => y(d.score))
      .attr("r", 5)
      .attr("fill", "white")
      .attr("stroke", "black")
      .on("mouseover", (event: MouseEvent, d: ReviewData) =>
        handleMouseOver(event, d)
      )
      .on("mouseout", handleMouseOut)
      .on("click", (event: MouseEvent, d: ReviewData) => handleDotClick(d));

    const zoom = d3
      .zoom()
      .scaleExtent([1, 10])
      .translateExtent([
        [-width, -height],
        [2 * width, 2 * height],
      ])
      .on("zoom", (event: D3ZoomEvent<Element, unknown>) => {
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);

        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));

        dots
          .attr("cx", (d: ReviewData) => newX(d.date))
          .attr("cy", (d: ReviewData) => newY(d.score));
      });

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .lower() // Ensure the rect is at the bottom of the SVG
      .call(zoom);
  }, [data, filter, filterType]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#F9F28D",
        padding: "20px",
      }}
    >
      <Box display="flex" alignItems="center" marginBottom="20px">
        <FormControl
          variant="outlined"
          size="small"
          style={{ marginRight: "10px" }}
        >
          <InputLabel>Filter Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as keyof ReviewData)}
            label="Filter Type"
            style={{ color: "#000000" }}
          >
            <MenuItem value="artist" style={{ color: "#000000" }}>
              Artist
            </MenuItem>
            <MenuItem value="album" style={{ color: "#000000" }}>
              Album
            </MenuItem>
            <MenuItem value="original_score" style={{ color: "#000000" }}>
              Score
            </MenuItem>
          </Select>
        </FormControl>
        <TextField
          variant="outlined"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter by ${filterType}`}
          style={{ width: "300px" }}
          InputProps={{
            style: { color: "#000000" },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        style={{
          color: "#333",
          marginBottom: "10px",
          fontFamily: "Montserrat, Arial, sans-serif",
        }}
      >
        Scroll to zoom and click and drag to navigate the chart.
      </Typography>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          background: "white",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          pointerEvents: "none",
          opacity: 0,
          fontFamily: "Montserrat, Arial, sans-serif",
        }}
      ></div>
    </div>
  );
};

export default ScoreYearComponent;
