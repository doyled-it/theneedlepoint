import React from "react";
import { Container, Typography } from "@mui/material";

const AboutComponent: React.FC = () => {
  return (
    <Container style={{ backgroundColor: "#F9F28D", padding: "20px" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        About
      </Typography>
      <Typography variant="body1" paragraph>
        <i>The Needle Point</i> is a visualization tool designed to explore the
        reviews from everyone's favorite melon. This application allows you to
        view and compare review scores by date, year, genre, and custom
        categories.
      </Typography>
      <Typography variant="body1" paragraph>
        The data is sourced from scraping reviews (including artist, album, and
        score information) from{" "}
        <a href="https://theneedledrop.com" target="_blank" rel="noreferrer">
          theneedledrop.com
        </a>
        &nbsp;and Fantano's descriptions on{" "}
        <a
          href="https://youtube.com/theneedledrop"
          target="_blank"
          rel="noreferrer"
        >
          YouTube
        </a>
        . Then this data is cross-referenced with the{" "}
        <a href="https://musicbrainz.org/" target="_blank" rel="noreferrer">
          MusicBrainz
        </a>{" "}
        database for cover art and genre information. I created a python package
        called{" "}
        <a
          href="https://github.com/doyled-it/theneedlescrape"
          target="_blank"
          rel="noreferrer"
        >
          TheNeedleScrape
        </a>{" "}
        to do this scraping in stages.
      </Typography>
      <Typography variant="body1" paragraph>
        The scraping isn't perfect, so there are quite a few missing reviews or
        entries that are missing genres or cover art, because it's difficult to
        scrape across all edge cases that come with 10+ years of YouTube
        descriptions.
      </Typography>
      <Typography variant="body1" paragraph>
        If you have a bug to report, open an{" "}
        <a
          href="https://github.com/doyled-it/theneedlepoint/issues"
          target="_blank"
          rel="noreferrer"
        >
          issue
        </a>
        . And if you have a feature request, start a{" "}
        <a
          href="https://github.com/doyled-it/theneedlepoint/discussions"
          target="_blank"
          rel="noreferrer"
        >
          discussion
        </a>
        !
      </Typography>
      <Typography variant="body1" paragraph>
        Created with{" "}
        <span role="img" aria-label="heart">
          ❤️
        </span>{" "}
        by{" "}
        <a href="https://github.com/doyled-it" target="_blank" rel="noreferrer">
          @doyled-it
        </a>{" "}
        on GitHub.
      </Typography>
    </Container>
  );
};

export default AboutComponent;
