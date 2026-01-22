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

// API 응답 데이터 타입 (StockPriceItem 또는 OhlcvItem 호환)
interface CandleDataItem {
  bucket?: string; // API에서 오는 시간 (StockPriceItem)
  time?: number | string; // OhlcvItem 또는 레거시 형식
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandleChartProps {
  data?: CandleDataItem[];
}

// 시간 포맷팅 함수
const formatTime = (item: CandleDataItem): string => {
  // bucket이 있으면 사용 (StockPriceItem)
  if (item.bucket) {
    const date = new Date(item.bucket);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // time이 숫자면 타임스탬프로 처리
  if (typeof item.time === "number") {
    const date = new Date(item.time);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // time이 문자열이면 그대로 반환
  return item.time || "";
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
const CandleChart: React.FC<CandleChartProps> = ({ data = [] }) => {
  // 데이터 전처리: API 데이터를 차트 형식으로 변환
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    return data.map((item) => ({
      ...item,
      time: formatTime(item),
      range: [item.low, item.high],
    }));
  }, [data]);

  // Y축 범위 계산
  const yDomain = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [0, 100];
    const lows = data.map((d) => d.low);
    const highs = data.map((d) => d.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const padding = (max - min) * 0.15 || 1;
    return [min - padding, max + padding];
  }, [data]);

  // 데이터가 없으면 빈 상태 표시
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div
        style={{ width: "100%", height: "400px", padding: "20px" }}
        className="flex items-center justify-center text-slate-400"
      >
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "400px", padding: "20px" }}>
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
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                const isUp = d.close >= d.open;
                return (
                  <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 text-[11px]">
                    <div className="font-bold mb-2 text-slate-800 border-b pb-1">
                      {d.time}
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <span className="text-slate-400">시가</span>
                      <span className="text-right font-mono font-medium">
                        {d.open.toLocaleString()}
                      </span>
                      <span className="text-slate-400">종가</span>
                      <span
                        className={`text-right font-mono font-medium ${isUp ? "text-red-500" : "text-blue-500"}`}
                      >
                        {d.close.toLocaleString()}
                      </span>
                      <span className="text-slate-400">고가</span>
                      <span className="text-right font-mono text-red-500">
                        {d.high.toLocaleString()}
                      </span>
                      <span className="text-slate-400">저가</span>
                      <span className="text-right font-mono text-blue-500">
                        {d.low.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="range" shape={<CandleStickShape />} barSize={14}>
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
