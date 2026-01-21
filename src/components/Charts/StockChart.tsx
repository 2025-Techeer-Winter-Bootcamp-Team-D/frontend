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

interface StockChartProps {
  color?: string;
  showAxes?: boolean;
  period?: string;
}

const StockChart: React.FC<StockChartProps> = ({
  color = "#0046FF",
  showAxes = true,
  period = "1D",
}) => {
  // Y축 domain을 데이터에 밀착시키기 위한 함수
  const getYDomain = (data: { price: number }[]): [number, number] => {
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    // 변동폭의 5%만 패딩으로 추가하여 변화가 더 잘 보이도록 함
    const padding = range * 0.05;
    return [min - padding, max + padding];
  };

  const data = useMemo(() => {
    switch (period) {
      case "1W":
        return [
          { time: "Mon", price: 76000 },
          { time: "Tue", price: 75500 },
          { time: "Wed", price: 76200 },
          { time: "Thu", price: 77100 },
          { time: "Fri", price: 78200 },
        ];
      case "3M":
        return [
          { time: "Oct", price: 72000 },
          { time: "Nov", price: 74500 },
          { time: "Dec", price: 73000 },
          { time: "Jan", price: 76500 },
          { time: "Feb", price: 78200 },
        ];
      case "6M":
      case "1Y":
      case "All":
        return [
          { time: "23.08", price: 68000 },
          { time: "23.09", price: 69500 },
          { time: "23.10", price: 67000 },
          { time: "23.11", price: 71000 },
          { time: "23.12", price: 74000 },
          { time: "24.01", price: 73500 },
          { time: "24.02", price: 78200 },
        ];
      default: // Fallback or 1D (if used elsewhere)
        return [
          { time: "09:00", price: 76000 },
          { time: "10:00", price: 76500 },
          { time: "11:00", price: 76200 },
          { time: "12:00", price: 77100 },
          { time: "13:00", price: 78000 },
          { time: "14:00", price: 77800 },
          { time: "15:00", price: 78200 },
          { time: "15:30", price: 78500 },
        ];
    }
  }, [period]);

  // Y축 domain 계산
  const yDomain = useMemo(() => getYDomain(data), [data]);

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
          formatter={(value: number | undefined) => [
            value ? `${value.toLocaleString()}원` : "0원",
            "주가",
          ]}
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
