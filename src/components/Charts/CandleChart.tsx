import React from "react";
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

// 1. 데이터 샘플 (필요에 따라 외부에서 props로 전달 가능)
const data = [
  { time: "09:00", open: 77000, high: 77500, low: 76800, close: 77200 },
  { time: "09:30", open: 77200, high: 77800, low: 77100, close: 77500 },
  { time: "10:00", open: 77500, high: 77600, low: 77000, close: 77100 },
  { time: "10:30", open: 77100, high: 77400, low: 77000, close: 77300 },
  { time: "11:00", open: 77300, high: 77500, low: 77200, close: 77400 },
  { time: "11:30", open: 77400, high: 77600, low: 77300, close: 77500 },
  { time: "12:00", open: 77500, high: 78000, low: 77400, close: 77900 },
  { time: "12:30", open: 77900, high: 78200, low: 77800, close: 78100 },
  { time: "13:00", open: 78100, high: 78300, low: 78000, close: 78000 },
  { time: "13:30", open: 78000, high: 78200, low: 77800, close: 77900 },
  { time: "14:00", open: 77900, high: 78400, low: 77900, close: 78300 },
  { time: "14:30", open: 78300, high: 78600, low: 78200, close: 78500 },
  { time: "15:00", open: 78500, high: 78800, low: 78400, close: 78600 },
  { time: "15:30", open: 78600, high: 78900, low: 78500, close: 78200 },
];

// 2. 데이터 전처리 (고가-저가 범위를 배열로 전달)
const processedData = data.map((item) => ({
  ...item,
  range: [item.low, item.high],
}));

// 3. Y축 범위를 데이터에 최적화하는 함수
const getYDomain = () => {
  const lows = data.map((d) => d.low);
  const highs = data.map((d) => d.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const padding = (max - min) * 0.15; // 상하 15% 여유 공간
  return [min - padding, max + padding];
};

const yDomain = getYDomain();

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
const CandleChart: React.FC = () => {
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
