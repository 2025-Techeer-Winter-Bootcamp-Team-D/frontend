import React, { useState, useMemo } from "react";
import GlassCard from "../Layout/GlassCard";
import { TrendingUp, Building2 } from "lucide-react";

// 기업 순위 데이터 타입
interface CompanyRankItem {
  rank: number;
  name: string;
  code: string;
  sector: string;
  changePercent: number; // 등락률 (예: 1.5, -0.8)
}

// 산업 순위 데이터 타입
interface IndustryRankItem {
  rank: number;
  name: string;
}

interface IndustryRankingCardProps {
  companyData?: CompanyRankItem[];
  industryData?: IndustryRankItem[];
  onCompanyClick?: (code: string) => void;
}

// Mock 데이터
const DEFAULT_COMPANY_DATA: CompanyRankItem[] = [
  {
    rank: 1,
    name: "삼성전자",
    code: "005930",
    sector: "반도체",
    changePercent: 1.5,
  },
  {
    rank: 2,
    name: "SK하이닉스",
    code: "000660",
    sector: "반도체",
    changePercent: 2.1,
  },
  {
    rank: 3,
    name: "LG에너지솔루션",
    code: "373220",
    sector: "2차전지",
    changePercent: -1.5,
  },
  {
    rank: 4,
    name: "삼성바이오로직스",
    code: "207940",
    sector: "바이오",
    changePercent: 2.5,
  },
];

const DEFAULT_INDUSTRY_DATA: IndustryRankItem[] = [
  { rank: 1, name: "반도체" },
  { rank: 2, name: "2차전지" },
  { rank: 3, name: "바이오" },
  { rank: 4, name: "자동차" },
  { rank: 5, name: "금융" },
];

const IndustryRankingCard: React.FC<IndustryRankingCardProps> = ({
  companyData = DEFAULT_COMPANY_DATA,
  industryData = DEFAULT_INDUSTRY_DATA,
  onCompanyClick,
}) => {
  // 선택된 산업 상태 (null이면 전체)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  // 선택된 산업에 따라 기업 필터링
  const filteredCompanyData = useMemo(() => {
    if (!selectedIndustry) return companyData;
    return companyData
      .filter((item) => item.sector === selectedIndustry)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [companyData, selectedIndustry]);

  // 순위 포맷 (01, 02, ...)
  const formatRank = (rank: number) => rank.toString().padStart(2, "0");

  // 등락률 색상 (양수: 빨간색, 음수: 초록색)
  const getChangeColor = (percent: number) => {
    if (percent > 0) return "text-red-500";
    if (percent < 0) return "text-green-500";
    return "text-gray-500";
  };

  // 등락률 포맷
  const formatChange = (percent: number) => {
    const sign = percent > 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="flex">
        {/* 왼쪽: 산업별 기업 순위 (2/3) */}
        <div className="flex-[2] min-w-0">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-shinhan-blue" />
                {selectedIndustry
                  ? `${selectedIndustry} 기업 순위`
                  : "산업별 기업 순위"}
              </h2>
              {selectedIndustry && (
                <button
                  onClick={() => setSelectedIndustry(null)}
                  className="text-xs text-gray-500 hover:text-shinhan-blue transition-colors px-2 py-1 rounded hover:bg-blue-50"
                >
                  전체 보기
                </button>
              )}
            </div>
          </div>

          {/* 리스트 - 최대 4개만 표시 */}
          <div className="divide-y divide-gray-50">
            {filteredCompanyData.slice(0, 4).map((item) => (
              <div
                key={item.code}
                onClick={() => onCompanyClick?.(item.code)}
                className={`px-6 py-4 flex items-center gap-4 hover:bg-blue-50/50 transition-colors ${
                  onCompanyClick ? "cursor-pointer" : ""
                }`}
              >
                {/* 순위 */}
                <span
                  className={`text-xl font-bold min-w-[32px] ${
                    item.rank <= 3 ? "text-shinhan-blue" : "text-gray-400"
                  }`}
                >
                  {formatRank(item.rank)}
                </span>

                {/* 기업 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 text-base truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    <span className="font-mono">{item.code}</span>
                    <span className="mx-1.5">|</span>
                    <span>{item.sector}</span>
                  </div>
                </div>

                {/* 등락률 */}
                <div
                  className={`font-bold text-base ${getChangeColor(item.changePercent)}`}
                >
                  {formatChange(item.changePercent)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 세로 구분선 */}
        <div className="w-px bg-gray-200" />

        {/* 오른쪽: 산업 순위 (1/3) */}
        <div className="flex-1 min-w-0">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building2 size={20} className="text-shinhan-blue" />
              산업 순위
            </h2>
          </div>

          {/* 리스트 - 최대 5개만 표시 */}
          <div className="divide-y divide-gray-50">
            {industryData.slice(0, 5).map((item) => (
              <div
                key={item.name}
                onClick={() =>
                  setSelectedIndustry(
                    item.name === selectedIndustry ? null : item.name,
                  )
                }
                className={`px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors ${
                  selectedIndustry === item.name
                    ? "bg-shinhan-blue text-white"
                    : "hover:bg-blue-50/50"
                }`}
              >
                {/* 순위 */}
                <span
                  className={`text-xl font-bold min-w-[32px] ${
                    selectedIndustry === item.name
                      ? "text-white"
                      : item.rank <= 3
                        ? "text-shinhan-blue"
                        : "text-gray-400"
                  }`}
                >
                  {formatRank(item.rank)}
                </span>

                {/* 산업명 */}
                <div
                  className={`font-bold text-base ${
                    selectedIndustry === item.name
                      ? "text-white"
                      : "text-slate-800"
                  }`}
                >
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default IndustryRankingCard;
