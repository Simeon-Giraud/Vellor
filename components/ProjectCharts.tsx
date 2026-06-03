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
          tick={{ fill: "var(--color-fg-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
        />
        <YAxis
          hide
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "8px 12px",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            color: "var(--color-fg)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
          labelStyle={{ color: "var(--color-fg-muted)", marginBottom: 4 }}
          itemStyle={{ color: "var(--color-fg)" }}
          formatter={(value) => [`${value}%`]}
        />
        <Legend
          iconType="circle"
          iconSize={6}
          wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-fg-muted)" }}
        />
        <Line type="monotone" dataKey="ChatGPT" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="Gemini" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="Perplexity" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
