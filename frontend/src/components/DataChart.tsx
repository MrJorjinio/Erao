"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export type ChartType = "bar" | "line" | "pie" | "area" | "table";

interface DataChartProps {
  data: Record<string, unknown>[];
  columns: string[];
  chartType: ChartType;
}

// Color palette for charts
const COLORS = [
  "#18181b",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

// Truncate long labels
function truncateLabel(label: string, maxLength: number = 15): string {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 3) + "...";
}

export function DataChart({ data, columns, chartType }: DataChartProps) {
  if (!data || data.length === 0 || chartType === "table") {
    return null;
  }

  // Determine which column is the label (usually first text column) and which are values
  const labelColumn = columns[0];
  const valueColumns = columns.slice(1).filter((col) => {
    // Check if this column has numeric values
    return data.some((row) => {
      const val = row[col];
      return typeof val === "number" || !isNaN(Number(val));
    });
  });

  // If no numeric columns found, use all columns except first
  const dataColumns = valueColumns.length > 0 ? valueColumns : columns.slice(1);

  // Transform data for recharts
  const chartData = data.map((row) => {
    const fullName = String(row[labelColumn] ?? "");
    const item: Record<string, unknown> = {
      name: truncateLabel(fullName),
      fullName: fullName, // Keep full name for tooltip
    };
    dataColumns.forEach((col) => {
      const val = row[col];
      item[col] = typeof val === "number" ? val : Number(val) || 0;
    });
    return item;
  });

  // Check if all values are zero
  const hasNonZeroValues = chartData.some((item) =>
    dataColumns.some((col) => (item[col] as number) > 0)
  );

  // For pie chart, we need to restructure data if multiple value columns
  const pieData = dataColumns.length === 1
    ? chartData.map((item, index) => ({
        name: item.name as string,
        fullName: item.fullName as string,
        value: item[dataColumns[0]] as number,
        fill: COLORS[index % COLORS.length],
      }))
    : dataColumns.map((col, index) => ({
        name: col,
        fullName: col,
        value: chartData.reduce((sum, item) => sum + (item[col] as number), 0),
        fill: COLORS[index % COLORS.length],
      }));

  // Calculate smart interval for X-axis based on data count
  const dataCount = chartData.length;
  const getXAxisConfig = () => {
    if (dataCount <= 10) {
      // Show all labels
      return { interval: 0, angle: 0, textAnchor: "middle" as const, dy: 10 };
    } else if (dataCount <= 20) {
      // Rotate labels, show all
      return { interval: 0, angle: -45, textAnchor: "end" as const, dy: 5 };
    } else {
      // Rotate and skip some labels
      const skipInterval = Math.ceil(dataCount / 15);
      return { interval: skipInterval - 1, angle: -45, textAnchor: "end" as const, dy: 5 };
    }
  };

  const xAxisConfig = getXAxisConfig();
  const bottomMargin = dataCount > 10 ? 60 : 20;

  // Custom tooltip to show full name
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const fullName = chartData.find(d => d.name === label)?.fullName || label;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{fullName}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show message if all values are zero
  if (!hasNonZeroValues) {
    return (
      <div className="w-full bg-white rounded-xl p-4">
        <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
          No data to visualize (all values are 0)
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: bottomMargin }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={xAxisConfig.interval}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                dy={xAxisConfig.dy}
                height={bottomMargin + 20}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              {dataColumns.map((col, index) => (
                <Bar
                  key={col}
                  dataKey={col}
                  fill={COLORS[index % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: bottomMargin }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={xAxisConfig.interval}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                dy={xAxisConfig.dy}
                height={bottomMargin + 20}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              {dataColumns.map((col, index) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={dataCount <= 20 ? { fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 3 } : false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: bottomMargin }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={xAxisConfig.interval}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                dy={xAxisConfig.dy}
                height={bottomMargin + 20}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              {dataColumns.map((col, index) => (
                <Area
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
        // Filter out zero values for pie chart
        const nonZeroPieData = pieData.filter(item => item.value > 0);

        if (nonZeroPieData.length === 0) {
          return (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
              No data to visualize (all values are 0)
            </div>
          );
        }

        // Limit pie chart to top 10 items for readability
        const limitedPieData = nonZeroPieData.length > 10
          ? nonZeroPieData.sort((a, b) => b.value - a.value).slice(0, 10)
          : nonZeroPieData;

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={limitedPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={limitedPieData.length <= 6
                  ? ({ name, percent }) => `${truncateLabel(name, 10)} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  : false
                }
                outerRadius={90}
                dataKey="value"
              >
                {limitedPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => {
                  const item = limitedPieData.find(d => d.name === name);
                  return [value, item?.fullName || name];
                }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value) => truncateLabel(value, 20)}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white rounded-xl p-4">
      {renderChart()}
    </div>
  );
}

// Helper function to detect best chart type based on data
export function detectChartType(columns: string[], rowCount: number): ChartType {
  // If only 1-2 rows, pie chart works well for comparison
  if (rowCount <= 5 && rowCount > 1) {
    return "pie";
  }

  // If many rows, bar or line chart
  if (rowCount > 5 && rowCount <= 15) {
    return "bar";
  }

  // If lots of data points, line chart for trends
  if (rowCount > 15) {
    return "line";
  }

  return "bar";
}
