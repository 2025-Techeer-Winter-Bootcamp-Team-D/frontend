import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/Layout/GlassCard";
import { Search, TrendingUp, ChevronRight, Bell } from "lucide-react";
import {
  Skeleton,
  SkeletonSearchResults,
  SkeletonDisclosure,
} from "../components/Skeleton";
import { useQuery } from "@tanstack/react-query";
import type { PageView, RecentReportItem } from "../types";
import { getCompanyRankings } from "../api/ranking";
import {
  searchCompanies,
  getStockOhlcv,
  getRecentReports,
} from "../api/company";
import type { RankingItem } from "../types";
import { useStarred } from "../context/StarredContext";
import { getKospi, getKosdaq } from "../api/indices";
import type { MarketIndexData } from "../api/indices";
import StockChart from "../components/Charts/StockChart";
import IndustryRankingCard from "../components/Ranking/IndustryRankingCard";

// 단일 종목의 주가 및 등락률을 조회하는 헬퍼
const fetchPriceAndChange = async (
  stockCode: string,
): Promise<{ price: string; change: string; changeVal: number }> => {
  try {
    const response = await getStockOhlcv(stockCode, "1m");
    const priceData = (response?.data?.data?.data ?? []) as unknown as Array<{
      close: number;
    }>;

    if (priceData.length > 0) {
      const latest = priceData[0]?.close ?? 0;
      if (latest > 0) {
        const price = formatPrice(latest);

        if (priceData.length > 1) {
          const previous = priceData[1]?.close ?? 0;
          if (previous > 0) {
            const changePercent = ((latest - previous) / previous) * 100;
            const change =
              changePercent >= 0
                ? `+${changePercent.toFixed(2)}%`
                : `${changePercent.toFixed(2)}%`;
            return { price, change, changeVal: changePercent };
          }
        }
        return { price, change: "-", changeVal: 0 };
      }
    }
    return { price: "-", change: "-", changeVal: 0 };
  } catch (error) {
    console.error(`주가 조회 실패 (${stockCode}):`, error);
    return { price: "-", change: "-", changeVal: 0 };
  }
};

const fetchPricesBatch = async (
  stockCodes: string[],
): Promise<
  Map<string, { price: string; change: string; changeVal: number }>
> => {
  const CONCURRENCY_LIMIT = 10;
  const resultMap = new Map<
    string,
    { price: string; change: string; changeVal: number }
  >();

  for (let i = 0; i < stockCodes.length; i += CONCURRENCY_LIMIT) {
    const chunk = stockCodes.slice(i, i + CONCURRENCY_LIMIT);
    const results = await Promise.all(
      chunk.map(async (code) => ({
        code,
        data: await fetchPriceAndChange(code),
      })),
    );
    results.forEach(({ code, data }) => {
      resultMap.set(code, data);
    });
  }

  return resultMap;
};

const formatMarketCap = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue) || numValue === 0) return "-";
  const uk = Math.floor(numValue / 100000000);
  if (uk >= 10000) {
    const jo = Math.floor(uk / 10000);
    const remainder = uk % 10000;
    return remainder > 0
      ? `${jo}조 ${remainder.toLocaleString()}억`
      : `${jo}조`;
  }
  return `${uk.toLocaleString()}억`;
};

const formatPrice = (price: number): string => {
  return price.toLocaleString();
};

interface CompanySearchProps {
  setPage: (page: PageView) => void;
  setCompanyCode: (code: string) => void;
}

const CompanySearch: React.FC<CompanySearchProps> = ({
  setPage: _setPage,
  setCompanyCode,
}) => {
  void _setPage;
  const navigate = useNavigate();
  const { starred, toggleStar } = useStarred();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 시장 지수 데이터
  const {
    data: kospiData,
    isLoading: isKospiLoading,
    isError: isKospiError,
  } = useQuery<MarketIndexData>({
    queryKey: ["kospi"],
    queryFn: getKospi,
    refetchInterval: 60000,
    retry: 2,
  });

  const {
    data: kosdaqData,
    isLoading: isKosdaqLoading,
    isError: isKosdaqError,
  } = useQuery<MarketIndexData>({
    queryKey: ["kosdaq"],
    queryFn: getKosdaq,
    refetchInterval: 60000,
    retry: 2,
  });

  // 최신 보고서 데이터
  const {
    data: recentReports = [],
    isLoading: isReportsLoading,
    isError: isReportsError,
  } = useQuery<RecentReportItem[]>({
    queryKey: ["recentReports"],
    queryFn: async () => {
      const response = await getRecentReports();
      // API가 배열을 직접 반환함
      return response.data ?? [];
    },
    refetchInterval: 60000 * 5,
  });

  // 지수 데이터를 StockChart 형식으로 변환
  const kospiChartData = useMemo(() => {
    if (!kospiData?.indices) return [];
    return kospiData.indices.map((item) => ({
      time: new Date(item.date).getTime() / 1000,
      bucket: item.date,
      open: item.value,
      high: item.value,
      low: item.value,
      close: item.value,
      volume: item.volume,
      amount: item.amount,
    }));
  }, [kospiData]);

  const kosdaqChartData = useMemo(() => {
    if (!kosdaqData?.indices) return [];
    return kosdaqData.indices.map((item) => ({
      time: new Date(item.date).getTime() / 1000,
      bucket: item.date,
      open: item.value,
      high: item.value,
      low: item.value,
      close: item.value,
      volume: item.volume,
      amount: item.amount,
    }));
  }, [kosdaqData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: rankingData = [], isLoading: isRankingLoading } = useQuery({
    queryKey: ["companyRankingsWithPrices"],
    queryFn: async () => {
      const response = await getCompanyRankings();
      const data = (response?.data ?? response ?? []) as Array<{
        rank: number;
        name: string;
        stock_code: string;
        amount?: number;
      }>;

      const stockCodes = data.map((item) => item.stock_code);
      const priceMap = await fetchPricesBatch(stockCodes);

      return data.map((item): RankingItem => {
        const priceData = priceMap.get(item.stock_code) ?? {
          price: "-",
          change: "-",
          changeVal: 0,
        };
        return {
          rank: item.rank,
          name: item.name,
          code: item.stock_code,
          sector: "-",
          price: priceData.price,
          change: priceData.change,
          changeVal: priceData.changeVal,
          marketCap: item.amount ? String(item.amount) : "-",
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["companySearch", debouncedQuery],
    queryFn: () => searchCompanies(debouncedQuery),
    enabled: !!debouncedQuery.trim(),
    select: (response: any) => {
      const responseData = response.data;
      if (!responseData?.data?.results) return [] as RankingItem[];
      return responseData.data.results.map((item: any, index: number) => ({
        rank: index + 1,
        name: item.company_name,
        code: item.stock_code,
        sector: "-",
        price: "-",
        change: "-",
        changeVal: 0,
        marketCap: "-",
      })) as RankingItem[];
    },
  });

  const handleCompanyClick = (code: string) => {
    setCompanyCode(code);
    setIsDropdownOpen(false);
    setSearchQuery("");
    navigate(`/company/${code}`);
  };

  // 검색 드롭다운과 랭킹 테이블 분리 - 테이블은 항상 랭킹 데이터만 표시

  const StarIcon = ({ isActive }: { isActive: boolean }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={isActive ? "#F59E0B" : "none"}
      stroke={isActive ? "#F59E0B" : "#CBD5E1"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  return (
    <div className="animate-fade-in pb-12">
      {/* 실시간 시장 대시보드 섹션 */}
      <div className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* KOSPI CARD */}
              <GlassCard className="p-6 bg-white border border-slate-100 cursor-pointer hover:shadow-md transition-shadow min-h-[240px]">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-500 uppercase tracking-tighter">
                    KOSPI
                  </h3>
                  {kospiData && (
                    <span
                      className={`font-bold text-sm ${kospiData.change_rate >= 0 ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {kospiData.change_rate >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(kospiData.change_rate).toFixed(2)}%
                    </span>
                  )}
                </div>
                <span className="text-3xl font-extrabold text-slate-900">
                  {isKospiLoading ? (
                    <Skeleton className="h-9 w-24 inline-block" />
                  ) : isKospiError ? (
                    <span className="text-red-400 text-base">연결 실패</span>
                  ) : (
                    (kospiData?.current_price?.toLocaleString() ?? "---")
                  )}
                </span>
                <div className="h-24 mt-3">
                  <StockChart
                    data={kospiChartData}
                    color={
                      kospiData && kospiData.change_rate >= 0
                        ? "#10B981"
                        : "#EF4444"
                    }
                    showAxes={false}
                    period="1M"
                  />
                </div>
              </GlassCard>

              {/* KOSDAQ CARD */}
              <GlassCard className="p-6 bg-white border border-slate-100 cursor-pointer hover:shadow-md transition-shadow min-h-[240px]">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-500 uppercase tracking-tighter">
                    KOSDAQ
                  </h3>
                  {kosdaqData && (
                    <span
                      className={`font-bold text-sm ${kosdaqData.change_rate >= 0 ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {kosdaqData.change_rate >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(kosdaqData.change_rate).toFixed(2)}%
                    </span>
                  )}
                </div>
                <span className="text-3xl font-extrabold text-slate-900">
                  {isKosdaqLoading ? (
                    <Skeleton className="h-9 w-24 inline-block" />
                  ) : isKosdaqError ? (
                    <span className="text-red-400 text-base">연결 실패</span>
                  ) : (
                    (kosdaqData?.current_price?.toLocaleString() ?? "---")
                  )}
                </span>
                <div className="h-24 mt-3">
                  <StockChart
                    data={kosdaqChartData}
                    color={
                      kosdaqData && kosdaqData.change_rate >= 0
                        ? "#10B981"
                        : "#EF4444"
                    }
                    showAxes={false}
                    period="1M"
                  />
                </div>
              </GlassCard>
            </div>
            <IndustryRankingCard
              onCompanyClick={(id) => navigate(`/company/${id}`)}
            />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* 기업 검색 */}
            <div className="relative" ref={searchContainerRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                placeholder="기업명 또는 종목코드 검색..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0046ff] focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
              {isDropdownOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-64 overflow-y-auto z-50">
                  {isSearching ? (
                    <SkeletonSearchResults count={3} />
                  ) : searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map((item: RankingItem) => (
                        <li
                          key={item.code}
                          onClick={() => handleCompanyClick(item.code)}
                          className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">
                                {item.code}
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-300" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-4 text-center text-gray-500 text-sm">
                      검색 결과가 없습니다
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 자본시장 공시 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-base font-bold mb-5 flex items-center gap-2">
                <Bell size={18} className="text-blue-600" /> 자본시장 공시
              </h3>
              <div className="space-y-4">
                {isReportsLoading ? (
                  <SkeletonDisclosure count={4} />
                ) : isReportsError ? (
                  <div className="py-6 text-center text-slate-400 text-sm">
                    공시 데이터를 불러오지 못했습니다
                  </div>
                ) : recentReports.length > 0 ? (
                  recentReports.slice(0, 5).map((report) => (
                    <div
                      key={report.id}
                      className="pb-3 border-b border-slate-50"
                    >
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        {report.company_name}
                      </span>
                      <a
                        href={report.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-800 mt-1 line-clamp-2 hover:text-blue-600 cursor-pointer block"
                      >
                        {report.report_name}
                      </a>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        {new Date(report.submitted_at).toLocaleDateString(
                          "ko-KR",
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-sm">
                    최신 공시가 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 시가총액 랭킹 리스트 */}
      <div className="mt-8">
        <GlassCard className="p-0 overflow-hidden min-h-[600px] flex flex-col">
          <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-gray-100/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#0046ff]" />
              {isRankingLoading ? "로딩 중..." : "시가총액 상위 랭킹"}
            </h2>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 font-medium border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">순위</th>
                  <th className="px-6 py-4 w-16">관심</th>
                  <th className="px-6 py-4">기업명</th>
                  <th className="px-6 py-4 text-right">현재가</th>
                  <th className="px-6 py-4 text-right">등락률</th>
                  <th className="px-6 py-4 text-right">시가총액</th>
                  <th className="px-6 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!isRankingLoading &&
                  rankingData.map((item: RankingItem, index: number) => (
                    <tr
                      key={item.code}
                      onClick={() => handleCompanyClick(item.code)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 text-center font-bold text-slate-500">
                        {index + 1}
                      </td>
                      <td
                        className="px-6 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleStar(item.code)}
                          className="p-1.5 hover:bg-gray-100 rounded-full"
                        >
                          <StarIcon isActive={starred.has(item.code)} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {item.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        {item.price}원
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${item.change?.startsWith("+") ? "text-red-500" : item.change?.startsWith("-") ? "text-blue-500" : "text-slate-500"}`}
                      >
                        {item.change}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        {formatMarketCap(item.marketCap)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight
                          size={18}
                          className="text-gray-300 group-hover:text-[#0046ff]"
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default CompanySearch;
