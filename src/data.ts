import { safeFloat } from "./utils";
import * as plotly from "plotly.js";

export interface ReviewData {
  date: Date;
  year: number;
  score: number;
  original_score: string;
  artist: string;
  album: string;
  youtube_link: string;
  cover_art_thumbnail: string;
  cover_art_full: string;
  genres: string[];
}

const preprocessScores = (data: ReviewData[]): ReviewData[] => {
  return data.map((review) => {
    let score: number;
    if (typeof review.original_score === "string") {
      const scoreLower = review.original_score.toLowerCase();
      if (scoreLower.includes("classic")) {
        score = 9.5;
      } else if (scoreLower.includes("not good")) {
        score = 0.5;
      } else {
        const parsedScore = parseFloat(scoreLower);
        if (!isNaN(parsedScore)) {
          score = parsedScore;
        } else {
          score = 5.5;
        }
      }
    } else {
      score = review.score;
    }
    return { ...review, score };
  });
};
export const processJsonl = (rawContent: string): ReviewData[] => {
  const data: ReviewData[] = [];
  const lines = rawContent.split("\n");
  for (let line of lines) {
    if (line.trim()) {
      try {
        const review = JSON.parse(line);
        const score = review["review_score"];
        if (score == null) continue;

        const date = review["date"];
        const year = safeFloat(review["year"]);
        if (date == null || year == null) continue;

        const genres = review["mb_genres"] || "";
        console.log("Parsed genres:", genres); // Add debug log

        data.push({
          date: new Date(date),
          year: year,
          score: safeFloat(score),
          original_score: review["review_score"],
          artist: review["artist"] || "Unknown Artist",
          album: review["album"] || "Unknown Album",
          youtube_link: review["youtube_link"] || "",
          cover_art_thumbnail: review["cover_art_thumbnail"] || "",
          cover_art_full: review["cover_art_full"] || "",
          genres: genres,
        });
      } catch (error) {
        console.error(`Error parsing JSON: ${error}`);
      }
    }
  }
  return data;
};

export const getPlotData = (data: ReviewData[]) => {
  const x = data.map((d) => d.date);
  const y = data.map((d) => d.score);
  const text = data.map((d) => `${d.artist} - ${d.album}`);
  const customData = data.map((d) => [
    d.original_score,
    d.artist,
    d.album,
    d.youtube_link,
    d.cover_art_thumbnail,
  ]);

  const plotData: Partial<plotly.PlotData>[] = [
    {
      x: x,
      y: y,
      mode: "markers",
      type: "scatter",
      text: text,
      customdata: customData,
      marker: {
        size: 8,
        color: "white",
        line: {
          color: "black",
          width: 1.5,
        },
      },
      hovertemplate: `<b>%{customdata[1]} - %{customdata[2]}</b><br>
                        Date: %{x|%B %d, %Y}<br>
                        Score: %{customdata[0]}<br>
                        <extra></extra>`,
    },
  ];

  const layout: Partial<plotly.Layout> = {
    title: {
      text: "THE NEEDLE DROP REVIEWS OVER TIME",
      font: {
        family: "Montserrat, Arial, sans-serif",
        size: 24,
        color: "#333",
      },
    },
    xaxis: {
      title: {
        text: "Review Date",
        font: {
          family: "Montserrat, Arial, sans-serif",
          size: 16,
          color: "#333",
        },
      },
      tickfont: {
        family: "Montserrat, Arial, sans-serif",
        size: 12,
        color: "#333",
      },
    },
    yaxis: {
      title: {
        text: "Score",
        font: {
          family: "Montserrat, Arial, sans-serif",
          size: 16,
          color: "#333",
        },
      },
      tickfont: {
        family: "Montserrat, Arial, sans-serif",
        size: 12,
        color: "#333",
      },
      range: [-0.5, 10.5],
      tickmode: "linear",
      tick0: 0,
      dtick: 1,
      tickvals: Array.from({ length: 11 }, (_, i) => i),
      ticktext: Array.from({ length: 11 }, (_, i) => i.toString()),
    },
    images: [
      {
        source: "assets/img/The_Needle_Drop_logo.png",
        xref: "paper",
        yref: "paper",
        x: 0.5,
        y: 1.05,
        sizex: 0.2,
        sizey: 0.2,
        xanchor: "center",
        yanchor: "bottom",
      },
    ],
    plot_bgcolor: "#F9F28D",
    paper_bgcolor: "#F9F28D",
    font: {
      family: "Montserrat, Arial, sans-serif",
      color: "#333",
    },
  };

  return { data: plotData, layout: layout };
};
