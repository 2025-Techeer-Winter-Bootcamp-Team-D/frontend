import React, { useState, useMemo, useEffect } from "react";
import GlassCard from "../components/Layout/GlassCard";
import { Search, Star, TrendingUp, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageView } from "../types";
import { getCompanyRankings } from "../api/ranking";
import { searchCompanies, getStockOhlcv } from "../api/company";
import type { RankingItem } from "../types";
import { useStarred } from "../context/StarredContext";

// 단일 종목의 주가 및 등락률을 조회하는 헬퍼
const fetchPriceAndChange = async (
  stockCode: string,
): Promise<{ price: string; change: string; changeVal: number }> => {
  try {
    // 1m interval로 실시간 분봉 데이터 조회 (가장 빠름)
    const response = await getStockOhlcv(stockCode, "1m");
    const priceData = response?.data?.data?.data ?? [];

    if (priceData.length > 0) {
      const latest = priceData[0]?.close ?? 0;
      if (latest > 0) {
        const price = latest.toLocaleString();

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

// 여러 종목의 주가 및 등락률을 병렬로 가져오는 헬퍼 (동시성 제한)
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

// 시가총액 포맷 함수 (억/조 단위)
const formatMarketCap = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue) || numValue === 0) return "-";
  const uk = Math.floor(numValue / 100000000); // 억 단위로 변환
  if (uk >= 10000) {
    const jo = Math.floor(uk / 10000);
    const remainder = uk % 10000;
    return remainder > 0
      ? `${jo}조 ${remainder.toLocaleString()}억`
      : `${jo}조`;
  }
  return `${uk.toLocaleString()}억`;
};

// 가격 포맷 함수
const formatPrice = (price: number): string => {
  return price.toLocaleString();
};

interface CompanySearchProps {
  setPage: (page: PageView) => void;
  setCompanyCode: (code: string) => void;
}

const CompanySearch: React.FC<CompanySearchProps> = ({
  setPage,
  setCompanyCode,
}) => {
  // [수정: 25번 라인] Context에서 필요한 모든 상태 가져오기
  const {
    starred,
    toggleStar,
    favoriteMap,
    isLoading: isStarredLoading,
  } = useStarred();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

      // 모든 종목 코드 수집 후 배치로 주가 조회 (동시성 제한 적용)
      const stockCodes = data.map((item) => item.stock_code);
      const priceMap = await fetchPricesBatch(stockCodes);

      // 결과 매핑
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
      if (!responseData?.data) return [] as RankingItem[];
      return responseData.data.map((item: any, index: number) => ({
        rank: index + 1,
        name: item.name,
        code: item.companyId,
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
    setPage(PageView.COMPANY_DETAIL);
  };

  const displayList = useMemo(() => {
    return debouncedQuery.trim() ? searchResults : rankingData;
  }, [debouncedQuery, searchResults, rankingData]);

  const isLoading = debouncedQuery.trim() ? isSearching : isRankingLoading;

  // [수정: 82번 라인] starredList 생성 로직 (fav 에러 해결 핵심 부분)
  const starredList = useMemo(() => {
    return Array.from(favoriteMap.values()).map((fav) => {
      // 랭킹 데이터에 있으면 시세 정보를 가져오고, 없으면 기본값 표시
      const liveData = rankingData.find((r) => r.code === fav.companyId);
      return {
        code: fav.companyId,
        name: fav.companyName,
        price: liveData ? liveData.price : "-",
        change: liveData ? liveData.change : "-",
      };
    });
  }, [favoriteMap, rankingData]);

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
      {/* 검색창 섹션 */}
      <div className="flex flex-col items-center justify-center mb-10 pt-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">기업 검색</h1>
        <div className="w-full max-w-2xl relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={24} />
          </div>
          <input
            type="text"
            placeholder="기업명 또는 종목코드를 입력하세요..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-blue-500/5 text-lg focus:outline-none focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100 transition-all text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 메인 리스트 */}
        <div className="lg:col-span-3">
          <GlassCard className="p-0 overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-shinhan-blue" />
                {isLoading
                  ? "로딩 중..."
                  : debouncedQuery
                    ? `검색 결과 (${displayList.length})`
                    : "시가총액 상위 랭킹"}
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
                  {!isLoading &&
                    displayList.map((item: RankingItem, index: number) => (
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
                            className="text-gray-300 group-hover:text-shinhan-blue"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* [수정] 우측 사이드바: 나의 관심 기업 */}
        <div className="lg:col-span-1">
          <GlassCard className="p-0 overflow-hidden flex flex-col h-full bg-white border-2 border-shinhan-light/50">
            <div className="p-5 border-b border-gray-100 bg-shinhan-blue text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Star size={20} className="fill-white" /> 나의 관심 기업
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                {starred.size}개의 기업 구독 중
              </p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
              {starredList.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {starredList.map((item) => (
                    <div
                      key={item.code}
                      onClick={() => handleCompanyClick(item.code)}
                      className="p-4 hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(item.code);
                          }}
                          className="text-yellow-400"
                        >
                          <Star size={18} fill="currentColor" />
                        </button>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {item.code}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-700 text-sm">
                          {item.price}
                        </div>
                        <div
                          className={`text-xs font-bold ${item.change?.startsWith("+") ? "text-red-500" : item.change?.startsWith("-") ? "text-blue-500" : "text-slate-500"}`}
                        >
                          {item.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4">
                  {isStarredLoading ? (
                    <Loader2 className="animate-spin mx-auto text-gray-300" />
                  ) : (
                    <p className="text-slate-400 text-sm">
                      관심 기업이 없습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default CompanySearch;
