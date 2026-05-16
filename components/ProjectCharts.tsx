"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface ProjectChartsProps {
  data: { day: string; ChatGPT: number; Gemini: number; Perplexity: number }[];
}

export default function ProjectCharts({ data }: ProjectChartsProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "var(--font-mono)" }}
        />
        <YAxis
          hide
          domain={[0, 100]}
        />
        <Tooltip
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
          formatter={(value) => [`${value}%`]}
        />
        <Legend
          iconType="circle"
          iconSize={6}
          wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.5)" }}
        />
        <Line type="monotone" dataKey="ChatGPT" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="Gemini" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="Perplexity" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
