import React from "react";
import { DataItem } from "./types";
import { data } from "./data";

type DataCheckerProps = {
  data: typeof data;
};

const DataChecker: React.FC<DataCheckerProps> = ({ data }) => {
  return (
    <div>
      <h2>Data Checker</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>X</th>
            <th>Y</th>
            <th>Category</th>
            <th>Size</th>
            <th>Color</th>
            <th>Annotation</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.x}</td>
              <td>{item.y}</td>
              <td>{item.categoryy}</td>
              <td>{item.size}</td>
              <td>{item.color}</td>
              <td>{item.annotation ?? "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataChecker;
