"use client";

import { useMemo, useState, useEffect } from "react";
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

// Color palette for charts (works well on both light and dark)
const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#14b8a6", // teal
  "#f97316", // orange
];

// Dark mode detection hook
function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

// Truncate long labels
function truncateLabel(label: string, maxLength: number = 15): string {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 3) + "...";
}

// Aggregate data by label column for large datasets
function aggregateData(
  data: Record<string, unknown>[],
  labelColumn: string,
  valueColumns: string[],
  maxItems: number = 50
): Record<string, unknown>[] {
  // Group by label and sum values
  const grouped = new Map<string, Record<string, number>>();

  data.forEach((row) => {
    const label = String(row[labelColumn] ?? "Unknown");
    if (!grouped.has(label)) {
      grouped.set(label, {});
      valueColumns.forEach((col) => {
        grouped.get(label)![col] = 0;
      });
    }
    const group = grouped.get(label)!;
    valueColumns.forEach((col) => {
      const val = row[col];
      group[col] += typeof val === "number" ? val : Number(val) || 0;
    });
  });

  // Convert to array and sort by first value column (descending)
  const result: Record<string, unknown>[] = Array.from(grouped.entries()).map(([label, values]) => ({
    name: truncateLabel(label),
    fullName: label,
    ...values,
  }));

  // Sort by the first value column descending
  if (valueColumns.length > 0) {
    result.sort((a, b) => (b[valueColumns[0]] as number) - (a[valueColumns[0]] as number));
  }

  // Limit to maxItems
  return result.slice(0, maxItems);
}

// Sample data evenly for line/area charts to show trends
function sampleData(
  data: Record<string, unknown>[],
  labelColumn: string,
  valueColumns: string[],
  maxPoints: number = 100
): Record<string, unknown>[] {
  if (data.length <= maxPoints) {
    return data.map((row) => {
      const fullName = String(row[labelColumn] ?? "");
      const item: Record<string, unknown> = {
        name: truncateLabel(fullName, 12),
        fullName: fullName,
      };
      valueColumns.forEach((col) => {
        const val = row[col];
        item[col] = typeof val === "number" ? val : Number(val) || 0;
      });
      return item;
    });
  }

  // Sample evenly across the dataset
  const step = Math.ceil(data.length / maxPoints);
  const sampled: Record<string, unknown>[] = [];

  for (let i = 0; i < data.length; i += step) {
    const row = data[i];
    const fullName = String(row[labelColumn] ?? "");
    const item: Record<string, unknown> = {
      name: truncateLabel(fullName, 12),
      fullName: fullName,
    };
    valueColumns.forEach((col) => {
      const val = row[col];
      item[col] = typeof val === "number" ? val : Number(val) || 0;
    });
    sampled.push(item);
  }

  return sampled;
}

export function DataChart({ data, columns, chartType }: DataChartProps) {
  const isDark = useDarkMode();

  // Memoize all chart data processing
  const chartConfig = useMemo(() => {
    if (!data || data.length === 0 || chartType === "table") {
      return null;
    }

    // Simple logic: AI ensures first column is label, rest are values
    // The backend AI is instructed to order data properly for visualization
    const labelColumn = columns[0];
    const dataColumns = columns.slice(1).filter(col =>
      data.some(row => {
        const val = row[col];
        return typeof val === "number" || !isNaN(Number(val));
      })
    );

    const isLargeDataset = data.length > 50;

    // Process data based on chart type and size
    let chartData: Record<string, unknown>[];

    if (chartType === "line" || chartType === "area") {
      // For line/area, sample data to show trends
      chartData = sampleData(data, labelColumn, dataColumns, 100);
    } else {
      // For bar/pie, aggregate data
      chartData = isLargeDataset
        ? aggregateData(data, labelColumn, dataColumns, chartType === "pie" ? 10 : 30)
        : data.map((row) => {
            const fullName = String(row[labelColumn] ?? "");
            const item: Record<string, unknown> = {
              name: truncateLabel(fullName),
              fullName: fullName,
            };
            dataColumns.forEach((col) => {
              const val = row[col];
              item[col] = typeof val === "number" ? val : Number(val) || 0;
            });
            return item;
          });
    }

    const hasNonZeroValues = chartData.some((item) =>
      dataColumns.some((col) => (item[col] as number) > 0)
    );

    // Prepare pie data
    let pieData: Array<{ name: string; fullName: string; value: number; fill: string }> = [];
    if (chartType === "pie") {
      if (dataColumns.length === 1) {
        pieData = chartData.map((item, index) => ({
          name: item.name as string,
          fullName: item.fullName as string,
          value: item[dataColumns[0]] as number,
          fill: COLORS[index % COLORS.length],
        }));
      } else {
        pieData = dataColumns.map((col, index) => ({
          name: col,
          fullName: col,
          value: chartData.reduce((sum, item) => sum + (item[col] as number), 0),
          fill: COLORS[index % COLORS.length],
        }));
      }
      // Filter zeros and sort by value
      pieData = pieData.filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
    }

    return {
      chartData,
      dataColumns,
      pieData,
      hasNonZeroValues,
      isLargeDataset,
    };
  }, [data, columns, chartType]);

  if (!chartConfig) return null;

  const { chartData, dataColumns, pieData, hasNonZeroValues, isLargeDataset } = chartConfig;
  const dataCount = chartData.length;

  // Theme colors
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const tickColor = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg = isDark ? "#1f2937" : "white";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";
  const tooltipText = isDark ? "#f9fafb" : "#111827";

  // X-axis config
  const getXAxisConfig = () => {
    if (dataCount <= 10) {
      return { interval: 0, angle: 0, textAnchor: "middle" as const, dy: 10 };
    } else if (dataCount <= 20) {
      return { interval: 0, angle: -45, textAnchor: "end" as const, dy: 5 };
    } else {
      const skipInterval = Math.ceil(dataCount / 15);
      return { interval: skipInterval - 1, angle: -45, textAnchor: "end" as const, dy: 5 };
    }
  };

  const xAxisConfig = getXAxisConfig();
  const bottomMargin = dataCount > 10 ? 60 : 20;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const found = chartData.find(d => d.name === label);
      const fullName = found ? String(found.fullName) : (label || "");
      return (
        <div
          className="rounded-lg p-2 shadow-lg max-w-xs"
          style={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
          }}
        >
          <p className="text-sm font-medium mb-1 truncate" style={{ color: tooltipText }}>
            {fullName}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!hasNonZeroValues) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 transition-colors">
        <div className="h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
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
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: tickColor }}
                interval={xAxisConfig.interval}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                dy={xAxisConfig.dy}
                height={bottomMargin + 20}
              />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: tickColor }}
                formatter={(value) => <span style={{ color: tickColor }}>{value}</span>}
              />
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
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: tickColor }}
                interval={xAxisConfig.interval}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                dy={xAxisConfig.dy}
                height={bottomMargin + 20}
              />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: tickColor }}
                formatter={(value) => <span style={{ color: tickColor }}>{value}</span>}
              />
              {dataColumns.map((col, index) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={dataCount <= 30 ? { fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 2 } : false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: bottomMargin }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: tickColor }}
                interval={xAxisConfig.interval}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                dy={xAxisConfig.dy}
                height={bottomMargin + 20}
              />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: tickColor }}
                formatter={(value) => <span style={{ color: tickColor }}>{value}</span>}
              />
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
        if (pieData.length === 0) {
          return (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
              No data to visualize (all values are 0)
            </div>
          );
        }

        // Calculate total for percentages
        const total = pieData.reduce((sum, item) => sum + item.value, 0);

        // Only show labels for slices > 5% to avoid overlap
        const renderLabel = ({ name, percent }: { name?: string; percent?: number }) => {
          if (!percent || percent < 0.05) return ""; // Hide labels for slices < 5%
          return `${truncateLabel(name || "", 10)} (${(percent * 100).toFixed(0)}%)`;
        };

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={pieData.length <= 8 ? renderLabel : false}
                outerRadius={90}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: tooltipText,
                }}
                itemStyle={{ color: tooltipText }}
                labelStyle={{ color: tooltipText }}
                formatter={(value) => {
                  const numVal = typeof value === "number" ? value : Number(value) || 0;
                  return [`${numVal.toLocaleString()} (${((numVal / total) * 100).toFixed(1)}%)`, ""];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", color: tickColor }}
                formatter={(value) => <span style={{ color: tickColor }}>{truncateLabel(value, 20)}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 transition-colors">
      {isLargeDataset && chartType !== "table" && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-2 text-center">
          {chartType === "pie" ? "Top 10 by value" : chartType === "line" || chartType === "area" ? `Sampled from ${data.length} rows` : `Top 30 by value (from ${data.length} rows)`}
        </div>
      )}
      {renderChart()}
    </div>
  );
}

// Helper function to detect best chart type based on data
export function detectChartType(columns: string[], rowCount: number): ChartType {
  if (rowCount <= 5 && rowCount > 1) {
    return "pie";
  }
  if (rowCount > 5 && rowCount <= 15) {
    return "bar";
  }
  if (rowCount > 15) {
    return "line";
  }
  return "bar";
}
