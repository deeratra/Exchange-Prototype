"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

interface ChartData {
  timestamp: string;
  price: number;
}

// interface TickerChartProps {
//   chartData: ChartData[];
// }

const TickerChart = ({ chartData }: { chartData: ChartData[] }) => {
  console.log("Got chart Data", chartData);
  const lineColor =
    Number(chartData[chartData.length - 1].price) -
      Number(chartData[0].price) >=
    0
      ? "#82ca9d"
      : "#ff4d4f";

  return (
    <LineChart width={100} height={20} data={chartData}>
      {/* <CartesianGrid strokeDasharray="3 3" stroke="#ccc" /> */}
      {/* Use "time" as the dataKey for XAxis */}
      <XAxis dataKey="timestamp" hide />
      <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
      <Line
        type="monotone"
        dataKey="price"
        stroke={lineColor}
        dot={false} // Remove dots from the line
        strokeWidth={2}
      />
    </LineChart>
  );
};

export default TickerChart;
