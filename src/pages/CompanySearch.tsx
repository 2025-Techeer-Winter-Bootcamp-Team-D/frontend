import React, { useState, useMemo, useEffect } from "react";
import GlassCard from "../components/Layout/GlassCard";
import {
  Search,
  Star,
  TrendingUp,
  Filter,
  ChevronRight,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageView } from "../types";
import { getCompanyRankings } from "../api/ranking";
import { searchCompanies } from "../api/company";
import type { RankingItem } from "../types";

interface CompanySearchProps {
  setPage: (page: PageView) => void;
  starred: Set<string>;
  onToggleStar: (code: string) => void;
  setCompanyCode: (code: string) => void;
}

const CompanySearch: React.FC<CompanySearchProps> = ({
  setPage,
  starred,
  onToggleStar,
  setCompanyCode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: rankingData = [], isLoading: isRankingLoading } = useQuery({
    queryKey: ["companyRankings"],
    queryFn: async () => {
      const response = await getCompanyRankings();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response.data || []) as RankingItem[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["companySearch", debouncedQuery],
    queryFn: () => searchCompanies(debouncedQuery),
    enabled: !!debouncedQuery.trim(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (response: any) => {
      const responseData = response.data;
      if (!responseData?.data) return [] as RankingItem[];

      return responseData.data.map(
        (
          item: { companyId: string; name: string; logo: string },
          index: number,
        ) => ({
          rank: index + 1,
          name: item.name,
          code: item.companyId,
          sector: "-",
          price: "-",
          change: "-",
          changeVal: 0,
          marketCap: "-",
        }),
      ) as RankingItem[];
    },
  });

  const handleCompanyClick = (code: string) => {
    setCompanyCode(code);
    setPage(PageView.COMPANY_DETAIL);
  };

  const displayList = useMemo(() => {
    if (debouncedQuery.trim()) {
      return searchResults;
    }
    return rankingData;
  }, [debouncedQuery, searchResults, rankingData]);

  const isLoading = isRankingLoading || (!!debouncedQuery && isSearching);

  const starredList = useMemo(() => {
    return rankingData.filter((item) => starred.has(item.code));
  }, [starred, rankingData]);

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
      <div className="flex flex-col items-center justify-center mb-10 pt-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">기업 검색</h1>
        <div className="w-full max-w-2xl relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={24} />
          </div>
          <input
            type="text"
            placeholder="기업명, 종목코드 또는 산업군을 입력하세요..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-blue-500/5 text-lg focus:outline-none focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400 text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <GlassCard className="p-0 overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-shinhan-blue" />
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    로딩 중...
                  </span>
                ) : debouncedQuery ? (
                  `검색 결과 (${displayList.length})`
                ) : (
                  "시가총액 상위 랭킹"
                )}
              </h2>
              <button className="text-sm font-medium text-gray-500 hover:text-shinhan-blue flex items-center gap-1">
                <Filter size={14} /> 필터
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 font-medium border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 w-16 text-center">순위</th>
                    <th className="px-6 py-4 w-16">관심</th>
                    <th className="px-6 py-4">기업명</th>
                    <th className="px-6 py-4 text-center">산업</th>
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
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-bold ${index < 3 ? "text-shinhan-blue text-lg" : "text-slate-500"}`}
                          >
                            {item.rank}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onToggleStar(item.code)}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <StarIcon isActive={starred.has(item.code)} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-base">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">
                            {item.code}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                            {item.sector}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700">
                          {item.price === "-" ? "-" : `${item.price}원`}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-bold ${item.change.startsWith("+") ? "text-red-500" : "text-blue-500"}`}
                        >
                          {item.change}
                          <div className="text-[10px] font-normal opacity-70">
                            {item.change.startsWith("+") ? "▲" : "▼"}{" "}
                            {Math.abs(item.changeVal).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-600 font-medium">
                          {item.marketCap}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight
                            size={18}
                            className="text-gray-300 group-hover:text-shinhan-blue transition-colors"
                          />
                        </td>
                      </tr>
                    ))}
                  {!isLoading && displayList.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-20 text-center text-gray-400"
                      >
                        {debouncedQuery
                          ? "검색 결과가 없습니다."
                          : "데이터가 없습니다."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-0 overflow-hidden flex flex-col h-full bg-white border-2 border-shinhan-light/50">
            <div className="p-5 border-b border-gray-100 bg-shinhan-blue text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Star size={20} className="fill-white" />
                나의 관심 기업
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                {starred.size}개의 기업을 구독 중입니다.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar bg-white">
              {starredList.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {starredList.map((item: RankingItem) => (
                    <div
                      key={item.code}
                      onClick={() => handleCompanyClick(item.code)}
                      className="relative p-4 hover:bg-blue-50 transition-colors cursor-pointer group flex items-center justify-between overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                      <div className="relative flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(item.code);
                          }}
                          className="text-yellow-400 hover:text-yellow-500 transition-colors"
                        >
                          <Star size={18} fill="currentColor" />
                        </button>
                        <div>
                          <div className="font-bold text-slate-800 text-sm group-hover:text-shinhan-blue transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {item.code}
                          </div>
                        </div>
                      </div>
                      <div className="relative text-right">
                        <div className="font-bold text-slate-700 text-sm">
                          {item.price}
                        </div>
                        <div
                          className={`text-xs font-bold ${item.change.startsWith("+") ? "text-red-500" : "text-blue-500"}`}
                        >
                          {item.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star size={24} className="text-gray-300" />
                  </div>
                  <p className="text-slate-500 font-bold mb-1">
                    관심 기업이 없습니다
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    왼쪽 리스트에서{" "}
                    <Star size={10} className="inline mx-0.5 text-gray-400" />{" "}
                    버튼을 눌러
                    <br />
                    관심 기업을 추가해보세요.
                  </p>
                </div>
              )}

              {starred.size > starredList.length && (
                <div className="text-center text-xs text-gray-400 py-3 border-t border-gray-50">
                  + 그 외 {starred.size - starredList.length}개 기업
                  <br />
                  (로딩 중이거나 순위권 밖)
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <button className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 font-bold text-sm hover:border-shinhan-blue hover:text-shinhan-blue hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                관심 그룹 관리 <ArrowRight size={14} />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default CompanySearch;
