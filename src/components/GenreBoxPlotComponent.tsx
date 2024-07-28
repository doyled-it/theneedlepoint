import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { ReviewData } from "../data";

interface GenreBoxPlotComponentProps {
  data: ReviewData[];
}

const sanitizeGenre = (genre: string) => {
  return genre.replace(/[^a-zA-Z0-9]/g, "-");
};

const GenreBoxPlotComponent: React.FC<GenreBoxPlotComponentProps> = ({
  data,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const margin = { top: 60, right: 30, bottom: 80, left: 40 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const bgColor = "#F9F28D";

    d3.select(svgRef.current).selectAll("*").remove(); // Clear previous contents

    // Extract genres and count occurrences, excluding empty strings
    const genreCounts = new Map<string, number>();
    data.forEach((d) => {
      if (d.genres && Array.isArray(d.genres)) {
        d.genres.forEach((genre) => {
          if (genre) {
            genre = genre.trim();
            if (genreCounts.has(genre)) {
              genreCounts.set(genre, genreCounts.get(genre)! + 1);
            } else {
              genreCounts.set(genre, 1);
            }
          }
        });
      }
    });

    console.log("Genre Counts:", genreCounts);

    // Get top 10 genres
    const topGenres = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((d) => d[0]);

    console.log("Top Genres:", topGenres);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background-color", bgColor)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(topGenres)
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
      .text("THE NEEDLE DROP REVIEWS BY GENRE");

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
              <div>Genres: ${
                Array.isArray(d.genres) ? d.genres.join(", ") : d.genres
              }</div>
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

    topGenres.forEach((genre, i) => {
      const genreData = data.filter(
        (d) => Array.isArray(d.genres) && d.genres.includes(genre)
      );
      const scores = genreData.map((d) => d.score).sort(d3.ascending);

      console.log(`Scores for ${genre}:`, scores);

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
        .attr("x1", x(genre))
        .attr("x2", x(genre))
        .attr("y1", y(min))
        .attr("y2", y(max))
        .attr("stroke", "black");

      svg
        .append("rect")
        .attr("x", (x(genre) ?? 0) - boxWidth / 2)
        .attr("y", y(q3))
        .attr("height", y(q1) - y(q3))
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .attr("fill", color(i.toString()));

      svg
        .append("line")
        .attr("x1", (x(genre) ?? 0) - boxWidth / 2)
        .attr("x2", (x(genre) ?? 0) + boxWidth / 2)
        .attr("y1", y(median))
        .attr("y2", y(median))
        .attr("stroke", "black");

      svg
        .selectAll(`.outlier-${sanitizeGenre(genre)}`)
        .data(genreData.filter((d) => d.score < min || d.score > max))
        .enter()
        .append("circle")
        .attr("class", `outlier-${sanitizeGenre(genre)}`)
        .attr("cx", x(genre))
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
  }, [data]);

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

export default GenreBoxPlotComponent;
