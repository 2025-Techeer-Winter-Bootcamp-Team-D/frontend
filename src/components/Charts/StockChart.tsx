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
  // Y축 domain을 데이터에 밀착시키기 위한 함수
  const getYDomain = (data: { price: number }[]): [number, number] => {
    if (data.length === 0) return [0, 100];
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    // 변동폭의 5%만 패딩으로 추가하여 변화가 더 잘 보이도록 함
    const padding = range * 0.05;
    return [min - padding, max + padding];
  };

  // API 데이터를 차트 형식으로 변환
  const data = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      // 데이터가 없을 때 기본값 반환
      return [];
    }

    return rawData.map((item) => {
      // bucket 값이 있으면 그대로 사용, 없으면 period에 따라 포맷팅
      let timeLabel: string;

      if (item.bucket) {
        // bucket 값을 그대로 사용
        timeLabel = item.bucket;
      } else {
        // bucket이 없으면 타임스탬프에서 변환
        const date = new Date(item.time * 1000);
        switch (period) {
          case "1W":
            // 요일 표시
            timeLabel = date.toLocaleDateString("ko-KR", { weekday: "short" });
            break;
          case "1M":
          case "3M":
            // 월 표시
            timeLabel = date.toLocaleDateString("ko-KR", { month: "short" });
            break;
          case "1Y": {
            // 년.월 표시
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            timeLabel = `${year}.${month}`;
            break;
          }
          default:
            // 시간 표시 (1D)
            timeLabel = date.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
        }
      }

      return {
        time: timeLabel,
        price: item.close,
      };
    });
  }, [rawData, period]);

  // Y축 domain 계산
  const yDomain = useMemo(() => getYDomain(data), [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={
          showAxes
            ? { top: 10, right: 0, left: 0, bottom: 0 }
            : { top: 0, right: 0, left: 0, bottom: 0 }
        }
      >
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
        {/* Y축: showAxes가 false여도 domain 적용을 위해 hidden으로 렌더링 */}
        <YAxis
          domain={yDomain}
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={showAxes ? { fontSize: 12, fill: "#94A3B8" } : false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          hide={!showAxes}
        />
        {showAxes && (
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#94A3B8" }}
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const dataPoint = payload[0].payload;
              return (
                <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 text-[11px]">
                  <div className="font-bold mb-2 text-slate-800 border-b pb-1">
                    {label || dataPoint.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">주가</span>
                    <span className="font-mono font-medium text-slate-800">
                      {dataPoint.price?.toLocaleString() || "0"}원
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
