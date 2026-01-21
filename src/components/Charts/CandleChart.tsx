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

const processedData = data.map((item) => ({
  ...item,
  range: [item.low, item.high],
}));

// Y축 domain을 데이터에 밀착시켜 변화가 잘 보이도록 함
const getYDomain = (): [number, number] => {
  const lows = data.map((d) => d.low);
  const highs = data.map((d) => d.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = max - min;
  // 변동폭의 10%만 패딩으로 추가
  const padding = range * 0.1;
  return [min - padding, max + padding];
};

const yDomain = getYDomain();

type CandleStickShapeProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: {
    open: number;
    close: number;
    high: number;
    low: number;
  };
};

const CandleStickShape = (props: CandleStickShapeProps) => {
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? "#EF4444" : "#3B82F6";

  const range = high - low;
  const safeRange = range === 0 ? Number.EPSILON : range;
  const ratio = height / safeRange;
  const bodyTop = y + (high - Math.max(open, close)) * ratio;
  const bodyHeight = Math.abs(open - close) * ratio;

  return (
    <g>
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      <rect
        x={x}
        y={bodyTop}
        width={width}
        height={Math.max(2, bodyHeight)}
        fill={color}
      />
    </g>
  );
};

const CandleChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={processedData}
        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E5E7EB"
        />
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#94A3B8" }}
        />
        <YAxis
          domain={yDomain}
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#94A3B8" }}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white/90 backdrop-blur p-3 rounded-lg shadow-xl border border-gray-100 text-xs">
                  <div className="font-bold mb-1 text-slate-700">
                    {data.time}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-gray-500">시가</span>
                    <span
                      className={`font-mono text-right ${data.open > data.close ? "text-blue-500" : "text-red-500"}`}
                    >
                      {data.open.toLocaleString()}
                    </span>
                    <span className="text-gray-500">고가</span>
                    <span className="font-mono text-right text-red-500">
                      {data.high.toLocaleString()}
                    </span>
                    <span className="text-gray-500">저가</span>
                    <span className="font-mono text-right text-blue-500">
                      {data.low.toLocaleString()}
                    </span>
                    <span className="text-gray-500">종가</span>
                    <span
                      className={`font-mono text-right ${data.close > data.open ? "text-red-500" : "text-blue-500"}`}
                    >
                      {data.close.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="range" shape={<CandleStickShape />} barSize={12}>
          {processedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.close >= entry.open ? "#EF4444" : "#3B82F6"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CandleChart;
