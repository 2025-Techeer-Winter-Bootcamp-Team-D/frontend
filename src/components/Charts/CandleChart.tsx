import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { OhlcvItem } from "@/types";

interface CandleChartProps {
  data?: OhlcvItem[];
}

// Y축 범위를 데이터에 최적화하는 함수
const getYDomain = (data: Array<{ low: number; high: number }>) => {
  if (data.length === 0) return [0, 100];
  const lows = data.map((d) => d.low);
  const highs = data.map((d) => d.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const padding = (max - min) * 0.15; // 상하 15% 여유 공간
  return [min - padding, max + padding];
};

// 4. 캔들스틱 모양 정의 컴포넌트
interface CandleStickShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: any;
}

const CandleStickShape = (props: CandleStickShapeProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? "#EF4444" : "#3B82F6"; // 상승: 빨강, 하락: 파랑

  // 가격 1단위당 픽셀 높이 계산
  const ratio = height / (high - low);

  // 몸통의 실제 위치 계산 (Recharts y는 차트 상단 기준)
  const bodyUpper = Math.max(open, close);
  const bodyLower = Math.min(open, close);
  const bodyTop = y + (high - bodyUpper) * ratio;
  const bodyHeight = Math.max(1, (bodyUpper - bodyLower) * ratio);

  return (
    <g>
      {/* 고가-저가 연결선 (꼬리) */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      {/* 시가-종가 사각형 (몸통) */}
      <rect x={x} y={bodyTop} width={width} height={bodyHeight} fill={color} />
    </g>
  );
};

// 5. 메인 차트 컴포넌트
const CandleChart: React.FC<CandleChartProps> = ({ data: rawData }) => {
  // API 데이터를 차트 형식으로 변환
  const processedData = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    return rawData.map((item) => {
      // bucket 값이 있으면 그대로 사용, 없으면 타임스탬프에서 변환
      const timeLabel =
        item.bucket ||
        (() => {
          const date = new Date(item.time * 1000);
          return date.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        })();

      return {
        time: timeLabel,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        range: [item.low, item.high],
      };
    });
  }, [rawData]);

  const yDomain = useMemo(() => getYDomain(processedData), [processedData]);

  if (processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", padding: "20px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#F1F5F9"
          />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            minTickGap={20}
          />
          <YAxis
            domain={yDomain}
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length > 0) {
                // Recharts BarChart에서 payload[0].payload가 원본 데이터를 포함
                const dataPoint = payload[0]?.payload;
                if (!dataPoint) return null;

                const isUp = dataPoint.close >= dataPoint.open;
                return (
                  <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 text-[11px]">
                    <div className="font-bold mb-2 text-slate-800 border-b pb-1">
                      {label || dataPoint.time}
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <span className="text-slate-400">시가</span>
                      <span className="text-right font-mono font-medium">
                        {Number(dataPoint.open).toLocaleString()}
                      </span>
                      <span className="text-slate-400">종가</span>
                      <span
                        className={`text-right font-mono font-medium ${isUp ? "text-red-500" : "text-blue-500"}`}
                      >
                        {Number(dataPoint.close).toLocaleString()}
                      </span>
                      <span className="text-slate-400">고가</span>
                      <span className="text-right font-mono text-red-500">
                        {Number(dataPoint.high).toLocaleString()}
                      </span>
                      <span className="text-slate-400">저가</span>
                      <span className="text-right font-mono text-blue-500">
                        {Number(dataPoint.low).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="range"
            shape={<CandleStickShape />}
            barSize={14} // 캔들 두께 조절
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.close >= entry.open ? "#EF4444" : "#3B82F6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandleChart;
