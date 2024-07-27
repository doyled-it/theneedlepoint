import React from "react";
import ReactDOM from "react-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import "./index.css";

const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
    h1: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    h2: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    h3: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    h4: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    h5: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    h6: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    body1: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    body2: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    button: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    caption: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    overline: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    subtitle1: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
    subtitle2: {
      fontFamily: "Montserrat, Arial, sans-serif",
      fontWeight: 900,
    },
  },
  palette: {
    primary: {
      main: "#333",
    },
    secondary: {
      main: "#F9F28D",
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
