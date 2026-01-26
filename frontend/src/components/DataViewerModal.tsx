"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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

interface DataViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: string[];
  rows: Record<string, unknown>[];
  initialChartType?: ChartType;
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

  const result: Record<string, unknown>[] = Array.from(grouped.entries()).map(([label, values]) => ({
    name: truncateLabel(label, 20),
    fullName: label,
    ...values,
  }));

  if (valueColumns.length > 0) {
    result.sort((a, b) => (b[valueColumns[0]] as number) - (a[valueColumns[0]] as number));
  }

  return result.slice(0, maxItems);
}

// Sample data evenly for line/area charts
function sampleData(
  data: Record<string, unknown>[],
  labelColumn: string,
  valueColumns: string[],
  maxPoints: number = 150
): Record<string, unknown>[] {
  if (data.length <= maxPoints) {
    return data.map((row) => {
      const fullName = String(row[labelColumn] ?? "");
      const item: Record<string, unknown> = {
        name: truncateLabel(fullName, 15),
        fullName: fullName,
      };
      valueColumns.forEach((col) => {
        const val = row[col];
        item[col] = typeof val === "number" ? val : Number(val) || 0;
      });
      return item;
    });
  }

  const step = Math.ceil(data.length / maxPoints);
  const sampled: Record<string, unknown>[] = [];

  for (let i = 0; i < data.length; i += step) {
    const row = data[i];
    const fullName = String(row[labelColumn] ?? "");
    const item: Record<string, unknown> = {
      name: truncateLabel(fullName, 15),
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

// Virtual Table Component for the modal
function FullscreenVirtualTable({
  columns,
  rows,
  isDark,
}: {
  columns: string[];
  rows: Record<string, unknown>[];
  isDark: boolean;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 15,
  });

  // Calculate minimum width based on columns
  const minTableWidth = Math.max(columns.length * 160 + 80, 600);

  return (
    <div className="h-full flex flex-col">
      {/* Scroll container - handles both horizontal and vertical scroll */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto custom-scrollbar"
      >
        {/* Inner container with minimum width for horizontal scroll */}
        <div style={{ minWidth: `${minTableWidth}px` }}>
          {/* Table Header - sticky top, scrolls horizontally with data */}
          <div className={`flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-10 ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}>
            <span className={`w-16 text-sm font-semibold flex-shrink-0 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}>#</span>
            {columns.map((col) => (
              <span
                key={col}
                className={`min-w-[140px] w-[140px] text-sm font-semibold truncate ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
                title={col}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Virtual rows container */}
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <div
                  key={virtualRow.index}
                  className={`flex items-center gap-3 px-4 py-3 absolute w-full ${
                    virtualRow.index % 2 === 0
                      ? isDark ? "bg-gray-900" : "bg-white"
                      : isDark ? "bg-gray-800/50" : "bg-gray-50/50"
                  }`}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <span className={`w-16 text-sm flex-shrink-0 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}>
                    {virtualRow.index + 1}
                  </span>
                  {columns.map((col) => (
                    <span
                      key={col}
                      className={`min-w-[140px] w-[140px] text-sm truncate ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                      title={String(row[col] ?? "")}
                    >
                      {String(row[col] ?? "")}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Large Chart Component with optimizations
function LargeChart({
  data,
  columns,
  chartType,
  isDark,
}: {
  data: Record<string, unknown>[];
  columns: string[];
  chartType: ChartType;
  isDark: boolean;
}) {
  // Theme colors
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const tickColor = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg = isDark ? "#1f2937" : "white";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";
  const tooltipText = isDark ? "#f9fafb" : "#111827";

  // Memoize chart data processing
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

    let chartData: Record<string, unknown>[];

    if (chartType === "line" || chartType === "area") {
      chartData = sampleData(data, labelColumn, dataColumns, 150);
    } else {
      chartData = isLargeDataset
        ? aggregateData(data, labelColumn, dataColumns, chartType === "pie" ? 15 : 50)
        : data.map((row) => {
            const fullName = String(row[labelColumn] ?? "");
            const item: Record<string, unknown> = {
              name: truncateLabel(fullName, 20),
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

  const getXAxisConfig = () => {
    if (dataCount <= 15) {
      return { interval: 0, angle: 0, textAnchor: "middle" as const, dy: 10 };
    } else if (dataCount <= 30) {
      return { interval: 0, angle: -45, textAnchor: "end" as const, dy: 5 };
    } else {
      const skipInterval = Math.ceil(dataCount / 20);
      return { interval: skipInterval - 1, angle: -45, textAnchor: "end" as const, dy: 5 };
    }
  };

  const xAxisConfig = getXAxisConfig();
  const bottomMargin = dataCount > 15 ? 80 : 30;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const found = chartData.find((d) => d.name === label);
      const fullName = found ? String(found.fullName) : label || "";
      return (
        <div
          className="rounded-lg p-3 shadow-xl max-w-sm"
          style={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
          }}
        >
          <p className="text-sm font-medium mb-2 break-words" style={{ color: tooltipText }}>
            {fullName}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
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
      <div className={`h-full flex items-center justify-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        No data to visualize (all values are 0)
      </div>
    );
  }

  const chartHeight = 500;

  const renderInfo = () => {
    if (!isLargeDataset) return null;
    return (
      <div className={`text-sm text-center mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        {chartType === "pie"
          ? `Top 15 by value (from ${data.length} rows)`
          : chartType === "line" || chartType === "area"
          ? `Sampled ${chartData.length} points from ${data.length} rows`
          : `Top 50 by value (from ${data.length} rows)`}
      </div>
    );
  };

  switch (chartType) {
    case "bar":
      return (
        <div className="w-full">
          {renderInfo()}
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: bottomMargin }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: tickColor }}
                interval={xAxisConfig.interval}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                dy={xAxisConfig.dy}
                height={bottomMargin + 20}
              />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "14px", paddingTop: "20px", color: tickColor }}
                formatter={(value) => <span style={{ color: tickColor }}>{value}</span>}
              />
              {dataColumns.map((col, index) => (
                <Bar key={col} dataKey={col} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case "line":
      return (
        <div className="w-full">
          {renderInfo()}
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: bottomMargin }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: tickColor }}
                interval={xAxisConfig.interval}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                dy={xAxisConfig.dy}
                height={bottomMargin + 20}
              />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "14px", paddingTop: "20px", color: tickColor }}
                formatter={(value) => <span style={{ color: tickColor }}>{value}</span>}
              />
              {dataColumns.map((col, index) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={dataCount <= 50 ? { fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 3 } : false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );

    case "area":
      return (
        <div className="w-full">
          {renderInfo()}
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: bottomMargin }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: tickColor }}
                interval={xAxisConfig.interval}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                dy={xAxisConfig.dy}
                height={bottomMargin + 20}
              />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "14px", paddingTop: "20px", color: tickColor }}
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
        </div>
      );

    case "pie":
      if (pieData.length === 0) {
        return (
          <div className={`h-full flex items-center justify-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            No data to visualize (all values are 0)
          </div>
        );
      }

      const total = pieData.reduce((sum, item) => sum + item.value, 0);

      // Only show labels for slices > 3% to avoid overlap
      const renderLabel = ({ name, percent }: { name?: string; percent?: number }) => {
        if (!percent || percent < 0.03) return "";
        return `${truncateLabel(name || "", 12)} (${(percent * 100).toFixed(0)}%)`;
      };

      return (
        <div className="w-full">
          {isLargeDataset && (
            <div className={`text-sm text-center mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Top 15 by value (from {data.length} rows)
            </div>
          )}
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={pieData.length <= 10 ? renderLabel : false}
                outerRadius={180}
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
                  fontSize: "14px",
                  color: tooltipText,
                }}
                itemStyle={{ color: tooltipText }}
                labelStyle={{ color: tooltipText }}
                formatter={(value) => {
                  const numValue = typeof value === "number" ? value : Number(value) || 0;
                  return [`${numValue.toLocaleString()} (${((numValue / total) * 100).toFixed(1)}%)`, ""];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "14px", color: tickColor }}
                formatter={(value) => <span style={{ color: tickColor }}>{truncateLabel(value, 25)}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );

    default:
      return null;
  }
}

export function DataViewerModal({
  isOpen,
  onClose,
  columns,
  rows,
  initialChartType = "table",
}: DataViewerModalProps) {
  const [currentView, setCurrentView] = useState<ChartType>(initialChartType);
  const isDark = useDarkMode();

  // Check if data is chartable
  const hasNumericData = useMemo(() => {
    return columns.slice(1).some((col) =>
      rows.some((row) => {
        const val = row[col];
        return typeof val === "number" || !isNaN(Number(val));
      })
    );
  }, [columns, rows]);

  if (!isOpen) return null;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = columns.join(",");
    const csvRows = rows.map((row) =>
      columns.map((col) => {
        const val = row[col];
        const strVal = String(val ?? "");
        if (strVal.includes(",") || strVal.includes('"') || strVal.includes("\n")) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      }).join(",")
    );
    const csv = [headers, ...csvRows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `data-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors ${
        isDark ? "bg-gray-900" : "bg-white"
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className="flex items-center gap-4">
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Data Viewer
            </h2>
            <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {rows.length.toLocaleString()} rows × {columns.length} columns
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <svg className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className={`flex items-center gap-1 px-6 py-3 border-b ${
          isDark ? "border-gray-800 bg-gray-800/50" : "border-gray-100 bg-gray-50/50"
        }`}>
          <button
            onClick={() => setCurrentView("table")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentView === "table"
                ? isDark ? "bg-white text-gray-900" : "bg-black text-white"
                : isDark ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Table
            </span>
          </button>
          {hasNumericData && (
            <>
              <button
                onClick={() => setCurrentView("bar")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === "bar"
                    ? isDark ? "bg-white text-gray-900" : "bg-black text-white"
                    : isDark ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Bar
                </span>
              </button>
              <button
                onClick={() => setCurrentView("line")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === "line"
                    ? isDark ? "bg-white text-gray-900" : "bg-black text-white"
                    : isDark ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Line
                </span>
              </button>
              <button
                onClick={() => setCurrentView("pie")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === "pie"
                    ? isDark ? "bg-white text-gray-900" : "bg-black text-white"
                    : isDark ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8v8l5.66 5.66C14.38 19.19 13.23 20 12 20z" />
                  </svg>
                  Pie
                </span>
              </button>
              <button
                onClick={() => setCurrentView("area")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === "area"
                    ? isDark ? "bg-white text-gray-900" : "bg-black text-white"
                    : isDark ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16M4 15l4-8 4 4 4-6 4 10" />
                  </svg>
                  Area
                </span>
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {currentView === "table" ? (
            <FullscreenVirtualTable columns={columns} rows={rows} isDark={isDark} />
          ) : (
            <div className="h-full p-6 flex items-center justify-center overflow-auto">
              <LargeChart data={rows} columns={columns} chartType={currentView} isDark={isDark} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
