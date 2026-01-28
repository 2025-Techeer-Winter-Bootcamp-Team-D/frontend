import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
  PieChart,
  Pie,
} from "recharts";
import { HelpCircle } from "lucide-react";
import type { FinancialData, FinancialMetric } from "../types";

// 재무 지표 설명 툴팁
const FINANCIAL_TOOLTIPS: Record<string, string> = {
  사업분석:
    "기업의 사업 부문별 매출 구성 비율을 보여줍니다. 주력사업, 신규사업, 해외사업 등으로 분류하여 수익 다각화 정도를 파악할 수 있습니다.",
  매출액:
    "기업이 제품이나 서비스를 판매하여 얻은 총 수익입니다. 기업의 규모와 성장성을 나타내는 가장 기본적인 지표입니다.",
  영업이익:
    "매출액에서 매출원가, 판매비, 관리비 등 영업비용을 뺀 이익입니다. 기업의 핵심 영업활동 수익성을 보여줍니다.",
  당기순이익:
    "영업이익에서 이자비용, 세금 등 모든 비용을 차감한 최종 순이익입니다. 주주에게 귀속되는 실제 이익을 나타냅니다.",
};

// 툴팁 컴포넌트
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({
  text,
  children,
}) => (
  <div className="relative group inline-flex" tabIndex={0}>
    {children}
    <div
      className="absolute left-full ml-3 top-0 px-3 py-2 bg-white text-slate-700 text-xs leading-relaxed rounded-lg opacity-0 invisible translate-x-1 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-x-0 transition-all duration-200 ease-out w-56 text-left z-50 shadow-lg border border-slate-200 pointer-events-none"
      role="tooltip"
    >
      {text}
      <div className="absolute right-full top-4 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-white"></div>
    </div>
  </div>
);

interface FinancialChartsSectionProps {
  financialData: FinancialData;
  fiscalYear?: number;
  selectedYear: string;
}

/**
 * 재무 차트 섹션 컴포넌트
 * Recharts를 정적 import하여 사용 (상단 import 참조)
 */
const FinancialChartsSection: React.FC<FinancialChartsSectionProps> = ({
  financialData,
  fiscalYear,
  selectedYear,
}) => {
  const renderFinancialBarChart = (title: string, data: FinancialMetric) => {
    const yoyValue = parseFloat(data.yoy?.replace(/[+%]/g, "") || "0");
    const isPositive = yoyValue >= 0;
    const yoyColor =
      data.yoy === "-"
        ? "text-gray-500"
        : isPositive
          ? "text-red-500"
          : "text-blue-500";
    const yoyArrow = data.yoy === "-" ? "" : isPositive ? " ▲" : " ▼";

    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col h-full shadow-sm">
        <div className="flex items-center gap-1 mb-4">
          <h4 className="font-bold text-slate-800 text-lg">{title}</h4>
          <Tooltip text={FINANCIAL_TOOLTIPS[title] || ""}>
            <HelpCircle
              size={14}
              className="text-gray-400 cursor-help hover:text-blue-500 transition-colors"
            />
          </Tooltip>
        </div>
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-50">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              {fiscalYear || selectedYear}년 {title}
            </div>
            <div className="text-xl font-bold text-slate-800">
              {data.current}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">작년 대비</div>
            <div className={`text-sm font-bold ${yoyColor}`}>
              {data.yoy}
              {yoyArrow}
            </div>
          </div>
        </div>
        <div className="w-full h-48 mt-auto outline-none focus:outline-none **:outline-none **:focus:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.history}
              margin={{ top: 30, right: 10, left: 10, bottom: 5 }}
            >
              <XAxis
                dataKey="year"
                axisLine={true}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                dy={5}
                stroke="#E5E7EB"
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                barSize={32}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="label"
                  position="top"
                  fill="#64748B"
                  fontSize={10}
                  fontWeight={500}
                  offset={8}
                />
                {data.history.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === data.history.length - 1 ? "#3B82F6" : "#E5E7EB"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderBusinessChart = () => {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col h-full shadow-sm">
        <div className="flex items-center gap-1 mb-4">
          <h4 className="font-bold text-slate-800 text-lg">사업분석</h4>
          <Tooltip text={FINANCIAL_TOOLTIPS["사업분석"]}>
            <HelpCircle
              size={14}
              className="text-gray-400 cursor-help hover:text-blue-500 transition-colors"
            />
          </Tooltip>
        </div>
        <div className="flex-1 flex items-center min-h-[180px]">
          <div className="w-1/2 focus:outline-none">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={financialData.business}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  dataKey="value"
                  stroke="none"
                >
                  {financialData.business.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-2">
            {financialData.business.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 truncate max-w-[80px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderBusinessChart()}
        {renderFinancialBarChart("매출액", financialData.revenue)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderFinancialBarChart("영업이익", financialData.operating)}
        {renderFinancialBarChart("당기순이익", financialData.netIncome)}
      </div>
    </div>
  );
};

export default FinancialChartsSection;
