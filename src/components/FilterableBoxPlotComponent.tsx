import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Checkbox,
  Autocomplete,
  Container,
  Grid,
} from "@mui/material";
import * as d3 from "d3";
import { ReviewData } from "../data";

interface FilterableBoxPlotComponentProps {
  data: ReviewData[];
}

const FilterableBoxPlotComponent: React.FC<FilterableBoxPlotComponentProps> = ({
  data,
}) => {
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const selectedCategories = [...selectedArtists, ...selectedGenres];

    const margin = { top: 60, right: 30, bottom: 90, left: 40 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const bgColor = "#F9F28D";

    d3.select(svgRef.current).selectAll("*").remove(); // Clear previous contents

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background-color", bgColor)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(selectedCategories)
      .range([0, width])
      .paddingInner(1)
      .paddingOuter(0.5);

    const y = d3.scaleLinear().domain([0, 10]).range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-family", "Montserrat, Arial, sans-serif")
      .style("font-size", "24px")
      .text("THE NEEDLE DROP REVIEWS BY ARTIST AND GENRE");

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
              <div>Genres: ${d.genres.join(", ")}</div>
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

    selectedCategories.forEach((category, i) => {
      const categoryData = data.filter(
        (d) => d.artist === category || d.genres.includes(category)
      );
      const scores = categoryData.map((d) => d.score).sort(d3.ascending);

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

      const boxWidth = 20;

      svg
        .append("line")
        .attr("x1", x(category))
        .attr("x2", x(category))
        .attr("y1", y(min))
        .attr("y2", y(max))
        .attr("stroke", "black");

      svg
        .append("rect")
        .attr("x", (x(category) ?? 0) - boxWidth / 2)
        .attr("y", y(q3))
        .attr("height", y(q1) - y(q3))
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .attr("fill", color(i.toString()));

      svg
        .append("line")
        .attr("x1", (x(category) ?? 0) - boxWidth / 2)
        .attr("x2", (x(category) ?? 0) + boxWidth / 2)
        .attr("y1", y(median))
        .attr("y2", y(median))
        .attr("stroke", "black");

      svg
        .selectAll(`.outlier-${category.replace(/[^a-zA-Z0-9]/g, "-")}`)
        .data(categoryData.filter((d) => d.score < min || d.score > max))
        .enter()
        .append("circle")
        .attr("class", `outlier-${category.replace(/[^a-zA-Z0-9]/g, "-")}`)
        .attr("cx", x(category))
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
  }, [data, selectedArtists, selectedGenres]);

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
      <Container>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={6}>
            <Autocomplete
              multiple
              options={Array.from(new Set(data.map((d) => d.artist)))}
              getOptionLabel={(option) => option}
              onChange={(event, value) => {
                setSelectedArtists(value);
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props} style={{ color: "#000000" }}>
                  <Checkbox
                    checked={selected}
                    style={{ marginRight: 8, color: "#000000" }}
                    color="primary"
                  />
                  {option}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Search Artists"
                  InputProps={{
                    ...params.InputProps,
                    style: { color: "black" },
                  }}
                />
              )}
              value={selectedArtists}
              disableCloseOnSelect
              style={{ width: "100%", color: "#000000" }}
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              multiple
              options={Array.from(
                new Set(
                  data.flatMap((d) => d.genres).filter((genre) => genre !== "")
                )
              )}
              getOptionLabel={(option) => option}
              onChange={(event, value) => {
                setSelectedGenres(value);
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props} style={{ color: "#000000" }}>
                  <Checkbox
                    checked={selected}
                    style={{ marginRight: 8, color: "#000000" }}
                    color="primary"
                  />
                  {option}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Search Genres"
                  InputProps={{
                    ...params.InputProps,
                    style: { color: "black" },
                  }}
                />
              )}
              value={selectedGenres}
              disableCloseOnSelect
              style={{ width: "100%", color: "#000000" }}
            />
          </Grid>
        </Grid>
      </Container>
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

export default FilterableBoxPlotComponent;
