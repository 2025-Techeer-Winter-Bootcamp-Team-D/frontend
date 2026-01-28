import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { OhlcvItem } from "@/types";

interface StockChartProps {
  data?: OhlcvItem[];
  color?: string;
  showAxes?: boolean;
  period?: string;
}

// SVG id에서 유효하지 않은 문자 제거 (예: "#")
const sanitizeId = (str: string): string => str.replace(/[^a-z0-9]/gi, "");

const StockChart: React.FC<StockChartProps> = ({
  data: rawData,
  color = "#0046FF",
  showAxes = true,
  period = "1D",
}) => {
  const gradientId = `colorPrice-${sanitizeId(color)}`;

  // Y축 범위를 데이터에 밀착시키되 여백 제공
  const getYDomain = (data: { price: number }[]): [number, number] => {
    if (data.length === 0) return [0, 100];
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) {
      return min === 0 ? [-1, 1] : [min * 0.9, max * 1.1];
    } // 값이 모두 같을 때 대비

    const range = max - min;
    const padding = range * 0.02; // 2% 패딩으로 Y축을 타이트하게 - 변동성 더 잘 보임
    return [min - padding, max + padding];
  };

  // 기간에 따른 시간 포맷 함수 (bucket 문자열에서 직접 추출)
  const formatTimeLabel = (
    bucket: string | undefined,
    period: string,
  ): string => {
    if (!bucket) return "";

    // bucket 형식: "2024-01-23T14:30:00" 또는 "2024-01-23 14:30:00"
    const dateTimeParts = bucket.replace("T", " ").split(" ");
    const datePart = dateTimeParts[0] || "";
    const timePart = dateTimeParts[1] || "";

    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");

    switch (period) {
      case "1D":
        return `${hour || "00"}:${minute || "00"}`;
      case "1W":
        return `${month}/${day} ${hour || "00"}:00`;
      case "1M":
        return `${month}/${day}`;
      case "1Y":
        return `${year?.slice(2) || "00"}.${month}`;
      default:
        return `${month}/${day}`;
    }
  };

  const data = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return rawData.map((item) => ({
      time: formatTimeLabel(item.bucket, period),
      price: item.close,
    }));
  }, [rawData, period]);

  const yDomain = useMemo(() => getYDomain(data), [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full h-full chart-container outline-none focus:outline-none **:outline-none **:focus:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showAxes && (
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
          )}
          <YAxis
            domain={yDomain}
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={showAxes ? { fontSize: 11, fill: "#94A3B8", dx: -5 } : false}
            tickFormatter={(val) => val.toLocaleString() ?? ""}
            hide={!showAxes}
            width={70}
          />
          <XAxis
            dataKey="time"
            hide={!showAxes}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            minTickGap={30}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const dataPoint = payload[0].payload;
                return (
                  <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 text-[11px]">
                    <div className="font-bold mb-1 text-slate-800 border-b pb-1">
                      {dataPoint.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">지수</span>
                      <span className="font-mono font-bold text-slate-800">
                        {Number(payload[0].value).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
