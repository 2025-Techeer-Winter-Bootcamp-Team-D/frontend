import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { MOCK_COMPANIES } from "./ComparisonGrid";

const ChartSection: React.FC = () => {
  const company = MOCK_COMPANIES[0];
  const chartData = company.years.map((year, i) => ({
    name: year,
    revenue: company.revenue[i],
    profit: company.profit[i],
  }));

  return (
    <div className="bg-white overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-end">
        <div>
          <h3 className="text-xs font-black text-[#0046FF] mb-1 uppercase tracking-widest">
            Real-time Data
          </h3>
          <h2 className="text-2xl font-black text-quasa-dark tracking-tight">
            {company.name} 실적 리포트
          </h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-300">
            CURRENCY: KRW (TRILLION)
          </p>
        </div>
      </div>
      <div className="p-8 space-y-12">
        <div className="h-64 w-full">
          <p className="text-sm font-bold text-quasa-gray mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0046FF]"></span> 연간
            매출액 성장률
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorQuasa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0046FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0046FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f2f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a1", fontSize: 12, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a1", fontSize: 12, fontWeight: 700 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
                cursor={{ stroke: "#0046FF", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0046FF"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorQuasa)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-64 w-full">
          <p className="text-sm font-bold text-quasa-gray mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1c1c1e]"></span> 분기별
            영업이익 변동
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f2f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a1", fontSize: 12, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a1", fontSize: 12, fontWeight: 700 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
                cursor={{ fill: "#f8f9fa" }}
              />
              <Bar
                dataKey="profit"
                fill="#0046FF"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
