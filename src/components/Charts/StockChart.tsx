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

const StockChart: React.FC<StockChartProps> = ({
  data: rawData,
  color = "#0046FF",
  showAxes = true,
  period = "1D",
}) => {
  // Y축 범위를 데이터에 밀착시키되 여백 제공
  const getYDomain = (data: { price: number }[]): [number, number] => {
    if (data.length === 0) return [0, 100];
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) return [min * 0.9, max * 1.1]; // 값이 모두 같을 때 대비

    const range = max - min;
    const padding = range * 0.05;
    return [min - padding, max + padding];
  };

  // 기간에 따른 시간 포맷 함수
  const formatTimeLabel = (
    bucket: string | undefined,
    timestamp: number,
    period: string,
  ): string => {
    const date = bucket ? new Date(bucket) : new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return bucket || "";

    if (period === "1D") {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}/${day}`;
    }
  };

  const data = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return rawData.map((item) => ({
      time: formatTimeLabel(item.bucket, item.time, period),
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
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
          tick={showAxes ? { fontSize: 11, fill: "#94A3B8" } : false}
          tickFormatter={(val) => val.toLocaleString() ?? ""} // 가격 그대로 표시하거나 필요시 k단위 변환
          hide={!showAxes}
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
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 text-[11px]">
                  <div className="font-bold mb-1 text-slate-800 border-b pb-1">
                    {label}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">주가</span>
                    <span className="font-mono font-bold text-slate-800">
                      {payload[0].value?.toLocaleString()}원
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
          fill="url(#colorPrice)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default StockChart;
