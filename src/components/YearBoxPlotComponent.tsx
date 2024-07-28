import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { ReviewData } from "../data";
import { Box, FormControlLabel, Checkbox } from "@mui/material";

interface YearBoxPlotComponentProps {
  data: ReviewData[];
}

const YearBoxPlotComponent: React.FC<YearBoxPlotComponentProps> = ({
  data,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [showMeanLine, setShowMeanLine] = useState(true);
  const [showTrendLine, setShowTrendLine] = useState(true);

  useEffect(() => {
    const margin = { top: 60, right: 30, bottom: 40, left: 40 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const bgColor = "#F9F28D";

    d3.select(svgRef.current).selectAll("*").remove(); // Clear previous contents

    // Filter out entries with year 0
    const filteredData = data.filter((d) => d.year !== 0);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background-color", bgColor)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const years = Array.from(new Set(filteredData.map((d) => d.year))).sort(
      (a, b) => a - b
    );

    const x = d3
      .scaleBand()
      .domain(years.map(String))
      .range([0, width])
      .paddingInner(1)
      .paddingOuter(0.5);

    const y = d3.scaleLinear().domain([0, 10]).range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-family", "Montserrat, Arial, sans-serif")
      .style("font-size", "24px")
      .text("THE NEEDLE DROP REVIEWS BY YEAR");

    const tooltip = d3.select(tooltipRef.current);

    const handleMouseOver = (event: MouseEvent, d: ReviewData) => {
      tooltip.style("opacity", 1);
      tooltip.html(`
        <div>
          <strong>${d.artist} - ${d.album}</strong><br>
          <div style="display: flex;">
            <img src="${d.cover_art_thumbnail}" style="width: 50px; height: 50px; margin-right: 10px;">
            <div>
              <div>Year: ${d.year}</div>
              <div>Score: ${d.original_score}</div>
            </div>
          </div>
        </div>
      `);
      const tooltipWidth = tooltip.node()?.clientWidth || 0;
      const tooltipHeight = tooltip.node()?.clientHeight || 0;
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

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    years.forEach((year, i) => {
      const yearData = filteredData.filter((d) => d.year === year);
      const scores = yearData.map((d) => d.score).sort(d3.ascending);

      const q1 = d3.quantile(scores, 0.25) || 0;
      const median = d3.quantile(scores, 0.5) || 0;
      const q3 = d3.quantile(scores, 0.75) || 0;
      const interQuantileRange = q3 - q1;
      const min = Math.max(
        0,
        d3.min(scores.filter((d) => d >= q1 - 1.5 * interQuantileRange)) || 0
      );
      const max = Math.min(
        10,
        d3.max(scores.filter((d) => d <= q3 + 1.5 * interQuantileRange)) || 10
      );
      const mean = d3.mean(scores) || 0;

      const boxWidth = 20;

      svg
        .append("line")
        .attr("x1", x(String(year)))
        .attr("x2", x(String(year)))
        .attr("y1", y(min))
        .attr("y2", y(max))
        .attr("stroke", "black");

      svg
        .append("rect")
        .attr("x", (x(String(year)) ?? 0) - boxWidth / 2)
        .attr("y", y(q3))
        .attr("height", y(q1) - y(q3))
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .attr("fill", color(i.toString()));

      svg
        .append("line")
        .attr("x1", (x(String(year)) ?? 0) - boxWidth / 2)
        .attr("x2", (x(String(year)) ?? 0) + boxWidth / 2)
        .attr("y1", y(median))
        .attr("y2", y(median))
        .attr("stroke", "black");

      // Add mean line
      if (showMeanLine) {
        svg
          .append("line")
          .attr("x1", (x(String(year)) ?? 0) - boxWidth / 2)
          .attr("x2", (x(String(year)) ?? 0) + boxWidth / 2)
          .attr("y1", y(mean))
          .attr("y2", y(mean))
          .attr("stroke", "red")
          .style("stroke-dasharray", "4,2");
      }

      svg
        .selectAll(".outlier")
        .data(yearData.filter((d) => d.score < min || d.score > max))
        .enter()
        .append("circle")
        .attr("class", "outlier")
        .attr("cx", x(String(year)))
        .attr("cy", (d: ReviewData) => y(d.score))
        .attr("r", 3)
        .attr("fill", "white")
        .attr("stroke", "black")
        .on("mouseover", (event: MouseEvent, d: ReviewData) =>
          handleMouseOver(event, d)
        )
        .on("mouseout", handleMouseOut)
        .on("click", (event: MouseEvent, d: ReviewData) => handleDotClick(d));
    });

    // Add trend line
    if (showTrendLine) {
      const yearGrouped = d3.group(filteredData, (d: ReviewData) => d.year);
      const trendData = Array.from(yearGrouped, ([key, value]) => ({
        year: key,
        mean: d3.mean(value, (d: ReviewData) => d.score) as number,
      })).sort((a, b) => a.year - b.year);

      const trendLine = d3
        .line()
        .x(
          (d: { year: number; mean: number }) =>
            (x(d.year.toString()) ?? 0) + x.bandwidth() / 2
        )
        .y((d: { year: number; mean: number }) => y(d.mean))
        .curve(d3.curveBasis);

      svg
        .append("path")
        .datum(trendData)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", trendLine);
    }
  }, [data, showMeanLine, showTrendLine]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#F9F28D",
        padding: "20px",
      }}
    >
      <Box display="flex" alignItems="center" marginBottom="20px">
        <FormControlLabel
          control={
            <Checkbox
              checked={showMeanLine}
              onChange={() => setShowMeanLine(!showMeanLine)}
            />
          }
          label="Show Mean Line"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showTrendLine}
              onChange={() => setShowTrendLine(!showTrendLine)}
            />
          }
          label="Show Trend Line"
        />
      </Box>
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

export default YearBoxPlotComponent;
