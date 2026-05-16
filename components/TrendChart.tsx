"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

/* Recharts 7-day trend chart for the dashboard.
 * taste-skill: monospace axis labels, no grid lines, clean dark theme.
 * Emil skill: subtle hover interaction on bars. */

interface TrendChartProps {
  data: { day: string; rate: number; total: number; mentioned: number }[];
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barCategoryGap="20%">
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "var(--font-mono)" }}
        />
        <YAxis hide domain={[0, 100]} />
        <Tooltip
          cursor={false}
          contentStyle={{
            background: "rgba(15,15,20,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "8px 12px",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
          labelStyle={{ color: "rgba(255,255,255,0.5)", marginBottom: 4 }}
          formatter={(value) => [`${value}%`, "Mention rate"]}
        />
        <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={
                index === data.length - 1
                  ? "rgba(79,70,229,0.7)"
                  : "rgba(255,255,255,0.08)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
