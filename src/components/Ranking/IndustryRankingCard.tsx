import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import GlassCard from "../Layout/GlassCard";
import { TrendingUp, Building2, Loader2 } from "lucide-react";
import { getCompanyRankings } from "../../api/ranking";
import { getIndustryRankings, getIndustryCompanies } from "../../api/industry";
import { getStockOhlcv } from "../../api/company";

// 기업 순위 데이터 타입
interface CompanyRankItem {
  rank: number;
  name: string;
  code: string;
  sector: string;
  changePercent: number;
}

// 산업 순위 데이터 타입
interface IndustryRankItem {
  rank: number;
  industryId: string;
  name: string;
  amount: number;
}

interface IndustryRankingCardProps {
  onCompanyClick?: (code: string) => void;
}

const IndustryRankingCard: React.FC<IndustryRankingCardProps> = ({
  onCompanyClick,
}) => {
  // 선택된 산업 상태 (null이면 전체 기업 순위)
  const [selectedIndustry, setSelectedIndustry] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 전체 기업 순위 조회 (기본)
  const { data: companyRankings = [], isLoading: isCompanyLoading } = useQuery({
    queryKey: ["companyRankings"],
    queryFn: async () => {
      const response = await getCompanyRankings();
      const data = response?.data ?? response ?? [];

      // 각 기업의 주가 등락률 조회
      const rankingsWithChange = await Promise.all(
        data.slice(0, 4).map(async (item: any) => {
          let changePercent = 0;
          try {
            const priceResponse = await getStockOhlcv(item.stock_code, "");
            const responseData = priceResponse?.data?.data as unknown as Record<
              string,
              { data?: Array<{ close: number }> }
            > | null;

            // interval 순서대로 데이터 찾기 (1d 우선)
            const intervals = ["1d", "1h", "15m", "1m"];
            for (const intv of intervals) {
              const priceData = responseData?.[intv]?.data ?? [];
              if (priceData.length > 1) {
                const latest = priceData[0]?.close ?? 0;
                const previous = priceData[1]?.close ?? 0;
                if (previous > 0) {
                  changePercent = ((latest - previous) / previous) * 100;
                  break;
                }
              }
            }
          } catch (error) {
            console.error(`주가 조회 실패 (${item.stock_code}):`, error);
          }

          return {
            rank: item.rank,
            name: item.name,
            code: item.stock_code,
            sector: "-",
            changePercent,
          };
        }),
      );

      return rankingsWithChange as CompanyRankItem[];
    },
    enabled: !selectedIndustry,
    staleTime: 1000 * 60 * 5,
  });

  // 산업 순위 조회
  const { data: industryRankings = [], isLoading: isIndustryLoading } =
    useQuery({
      queryKey: ["industryRankings"],
      queryFn: async () => {
        const response = await getIndustryRankings();
        return (response?.data ?? []) as IndustryRankItem[];
      },
      staleTime: 1000 * 60 * 5,
    });

  // 선택된 산업의 기업 순위 조회
  const {
    data: industryCompanies = [],
    isLoading: isIndustryCompaniesLoading,
  } = useQuery({
    queryKey: ["industryCompanies", selectedIndustry?.id],
    queryFn: async () => {
      if (!selectedIndustry) return [];
      const response = await getIndustryCompanies(selectedIndustry.id);
      const companies = response?.data ?? [];

      // 각 기업의 주가 등락률 조회
      const companiesWithChange = await Promise.all(
        companies.slice(0, 4).map(async (item: any, index: number) => {
          let changePercent = 0;
          try {
            const priceResponse = await getStockOhlcv(item.stock_code, "");
            const responseData = priceResponse?.data?.data as unknown as Record<
              string,
              { data?: Array<{ close: number }> }
            > | null;

            // interval 순서대로 데이터 찾기 (1d 우선)
            const intervals = ["1d", "1h", "15m", "1m"];
            for (const intv of intervals) {
              const priceData = responseData?.[intv]?.data ?? [];
              if (priceData.length > 1) {
                const latest = priceData[0]?.close ?? 0;
                const previous = priceData[1]?.close ?? 0;
                if (previous > 0) {
                  changePercent = ((latest - previous) / previous) * 100;
                  break;
                }
              }
            }
          } catch (error) {
            console.error(`주가 조회 실패 (${item.stock_code}):`, error);
          }

          return {
            rank: item.rank ?? index + 1,
            name: item.name,
            code: item.stock_code,
            sector: selectedIndustry.name,
            changePercent,
          };
        }),
      );

      return companiesWithChange as CompanyRankItem[];
    },
    enabled: !!selectedIndustry,
    staleTime: 1000 * 60 * 5,
  });

  // 표시할 기업 데이터
  const displayCompanyData = useMemo(() => {
    if (selectedIndustry) {
      return industryCompanies;
    }
    return companyRankings;
  }, [selectedIndustry, industryCompanies, companyRankings]);

  const isCompanyDataLoading = selectedIndustry
    ? isIndustryCompaniesLoading
    : isCompanyLoading;

  // 순위 포맷 (01, 02, ...)
  const formatRank = (rank: number) => rank.toString().padStart(2, "0");

  // 등락률 색상 (양수: 빨간색, 음수: 파란색)
  const getChangeColor = (percent: number) => {
    if (percent > 0) return "text-red-500";
    if (percent < 0) return "text-blue-500";
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
                  ? `${selectedIndustry.name} 기업 순위`
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
            {isCompanyDataLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-400" />
              </div>
            ) : displayCompanyData.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                데이터가 없습니다
              </div>
            ) : (
              displayCompanyData.slice(0, 4).map((item) => (
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
              ))
            )}
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
            {isIndustryLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-400" />
              </div>
            ) : (
              industryRankings.slice(0, 5).map((item) => (
                <div
                  key={item.industryId}
                  onClick={() =>
                    setSelectedIndustry(
                      selectedIndustry?.id === item.industryId
                        ? null
                        : { id: item.industryId, name: item.name },
                    )
                  }
                  className={`px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors ${
                    selectedIndustry?.id === item.industryId
                      ? "bg-shinhan-blue text-white"
                      : "hover:bg-blue-50/50"
                  }`}
                >
                  {/* 순위 */}
                  <span
                    className={`text-xl font-bold min-w-[32px] ${
                      selectedIndustry?.id === item.industryId
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
                      selectedIndustry?.id === item.industryId
                        ? "text-white"
                        : "text-slate-800"
                    }`}
                  >
                    {item.name}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default IndustryRankingCard;
