export type DataItem = {
  name: string;
  x: number; // vulnerability
  y: number; // readiness
  size: number; // CO2 emission
  color: string;
  categoryy: "RED" | "GREEN" | "YELLOW" | "BLUE" | "";
  annotation?: "top" | "right" | "left" | "bottom";
};

export type NewDataItem = {
  artist: string;
  album: string;
  year: number;
  genres: string[];
  score: number | string;
  favorites: string[];
  leastFavorite: string;
};

export type ScatterplotProps = {
  width: number;
  height: number;
  data: DataItem[];
};

// Information needed to build the tooltip
export type InteractionData = DataItem & {
  xPos: number;
  yPos: number;
};
