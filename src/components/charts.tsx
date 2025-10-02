"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const scoreHistoryData = [
  { month: "Jan", score: 650 },
  { month: "Feb", score: 680 },
  { month: "Mar", score: 710 },
  { month: "Apr", score: 700 },
  { month: "May", score: 720 },
  { month: "Jun", score: 750 },
];

const chartConfig: ChartConfig = {
  score: {
    label: "Credit Score",
    color: "hsl(var(--primary))",
  },
};

export function ScoreHistoryChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <LineChart
        data={scoreHistoryData}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          domain={[
            Math.min(...scoreHistoryData.map((d) => d.score)) - 50,
            Math.max(...scoreHistoryData.map((d) => d.score)) + 50,
          ]}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-score)"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}

const expenseData = [
  { name: "Food", value: 400, fill: "hsl(var(--chart-1))" },
  { name: "Utilities", value: 150, fill: "hsl(var(--chart-2))" },
  { name: "Transport", value: 200, fill: "hsl(var(--chart-3))" },
  { name: "Supplies", value: 100, fill: "hsl(var(--chart-4))" },
  { name: "Rent", value: 300, fill: "hsl(var(--chart-5))" },
];

const expenseConfig: ChartConfig = {
  Food: { label: 'Food', color: 'hsl(var(--chart-1))' },
  Utilities: { label: 'Utilities', color: 'hsl(var(--chart-2))' },
  Transport: { label: 'Transport', color: 'hsl(var(--chart-3))' },
  Supplies: { label: 'Supplies', color: 'hsl(var(--chart-4))' },
  Rent: { label: 'Rent', color: 'hsl(var(--chart-5))' },
};


export function ExpenseChart() {
  return (
    <ChartContainer config={expenseConfig} className="h-[250px] w-full">
      <PieChart>
        <Tooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={expenseData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          strokeWidth={5}
        >
          {expenseData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
