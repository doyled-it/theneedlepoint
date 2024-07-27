declare module "react-plotly.js" {
  import { Component } from "react";
  import { PlotParams } from "plotly.js";

  class Plot extends Component<Partial<PlotParams>> {}
  export default Plot;
}
