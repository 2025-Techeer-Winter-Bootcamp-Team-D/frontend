import React, { useState } from "react";
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
import { BarChart2 } from "lucide-react";

export interface CompanyDataEx {
  name: string;
  ticker: string;
  revenue: number[];
  profit: number[];
  assets: number[];
  liabilities: number[];
  years: string[];
}

export const MOCK_COMPANIES: CompanyDataEx[] = [
  {
    name: "삼성전자(주)",
    ticker: "005930",
    years: ["2020", "2021", "2022", "2023"],
    revenue: [236.8, 279.6, 302.2, 258.9],
    profit: [36.0, 51.6, 43.4, 34.0], // Adjusted to match image
    assets: [378.2, 426.6, 448.4, 455.9],
    liabilities: [102.3, 121.7, 93.7, 92.4],
  },
  {
    name: "에스케이하이닉스(주)",
    ticker: "000660",
    years: ["2020", "2021", "2022", "2023"],
    revenue: [31.9, 43.0, 44.6, 32.8],
    profit: [5.0, 12.4, 7.0, 22.5], // Adjusted to match image
    assets: [71.1, 80.1, 103.8, 101.4],
    liabilities: [19.2, 28.5, 40.5, 47.6],
  },
  {
    name: "한미반도체(주)",
    ticker: "042700",
    years: ["2020", "2021", "2022", "2023"],
    revenue: [0.2, 0.3, 0.3, 0.15],
    profit: [0.06, 0.12, 0.11, 0.5], // Small value as shown in image
    assets: [0.5, 0.6, 0.7, 0.8],
    liabilities: [0.1, 0.1, 0.1, 0.1],
  },
];

type Category = "매출액" | "영업이익" | "순이익" | "시가총액";

const ComparisonGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("영업이익");

  const categories: Category[] = ["매출액", "영업이익", "순이익", "시가총액"];

  // Map data for Recharts
  const data = [
    {
      name: "현재",
      "삼성전자(주)":
        activeCategory === "매출액"
          ? 258.9
          : activeCategory === "영업이익"
            ? 34.0
            : 25.0,
      "에스케이하이닉스(주)":
        activeCategory === "매출액"
          ? 32.8
          : activeCategory === "영업이익"
            ? 22.5
            : 15.0,
      "한미반도체(주)":
        activeCategory === "매출액"
          ? 0.15
          : activeCategory === "영업이익"
            ? 0.5
            : 0.4,
    },
  ];

  // Colors based on the image
  const colors = ["#4341f2", "#d4be73", "#aeb5bc"];
  const companies = MOCK_COMPANIES.map((c) => c.name);

  const formatYAxis = (value: number) => {
    if (value >= 1) {
      const jo = Math.floor(value);
      const eok = Math.round((value - jo) * 10000);
      if (eok === 0) return `${jo}조`;
      return `${jo}조 ${eok.toLocaleString()}억`;
    }
    return `${Math.round(value * 10000).toLocaleString()}억`;
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden animate-fade-up w-full">
      {/* Header */}
      <div className="p-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-[#0046FF]" size={24} />
          <h2 className="text-xl font-black text-quasa-dark tracking-tight">
            {activeCategory} 비교
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#f2f4f6] p-1.5 rounded-2xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-[14px] font-black transition-all ${
                activeCategory === cat
                  ? "bg-white text-[#0046FF] shadow-sm"
                  : "text-quasa-gray hover:text-quasa-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="px-8 py-10">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                {
                  name: "현재",
                  value: data[0]["삼성전자(주)"],
                  company: companies[0],
                },
                {
                  name: "현재",
                  value: data[0]["에스케이하이닉스(주)"],
                  company: companies[1],
                },
                {
                  name: "현재",
                  value: data[0]["한미반도체(주)"],
                  company: companies[2],
                },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={12}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f2f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a1", fontSize: 13, fontWeight: 700 }}
                dy={10}
                // Only show "현재" once in the middle conceptually
                interval={1}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a1", fontSize: 13, fontWeight: 700 }}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const companyName = payload[0].payload.company;
                    const value = payload[0].value as number;
                    return (
                      <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-50">
                        <p className="text-xs font-black text-gray-400 mb-1">
                          {companyName}
                        </p>
                        <p className="text-lg font-black text-[#0046FF]">
                          {formatYAxis(value)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mt-8">
          {companies.map((company, idx) => (
            <div
              key={company}
              className="flex items-center gap-2 group cursor-default"
            >
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: colors[idx] }}
              ></div>
              <span className="text-[15px] font-bold text-quasa-gray group-hover:text-quasa-dark transition-colors">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 bg-blue-50/20 border-t border-gray-50 flex justify-center">
        <button className="text-[#0046FF] font-black flex items-center gap-2 hover:opacity-80 transition-all text-sm tracking-tight">
          실시간 종목 상세 분석하기
          <div className="w-5 h-5 bg-[#0046FF] rounded-full flex items-center justify-center text-white">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 7.5L7.5 2.5M7.5 2.5H3.5M7.5 2.5V6.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ComparisonGrid;
