import React, { useRef, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, TrendingUp, Bell, X } from "lucide-react";

// Components
import GlassCard from "../components/Layout/GlassCard";
import StockChart from "../components/Charts/StockChart";
import AIBubbleChart from "../components/Charts/AIBubbleChart";
import ParallelCoordinatesChart from "../components/Charts/ParallelCoordinatesChart";
import IndustryRankingCard from "../components/Ranking/IndustryRankingCard";

// Types
import type {
  PageView,
  Stock,
  AxisKey,
  BrushRange,
  RecentReportItem,
} from "../types";
import { SAMPLE_STOCKS } from "../constants";

// API & 타입
import { getKospi, getKosdaq, saveInitialIndices } from "../api/indices";
import type { MarketIndexData } from "../api/indices";
import { getNewsKeywords, getNewsList, getNewsDetail } from "../api/news";
import type { NewsDetailItem } from "../api/news";
import {
  searchCompanies,
  getCompanyFinancials,
  getRecentReports,
} from "../api/company";
import { getCompanyRankings } from "../api/ranking";

// Constants
const MAX_SEARCH_RESULTS = 8;

interface DashboardProps {
  setPage: (page: PageView) => void;
  onIndustryClick: (indutyCode: string) => void;
  onShowNavbar: (show: boolean) => void;
}

// --- Sub Components ---

const AINewsBriefing: React.FC<{ visibleSections: Set<string> }> = ({
  visibleSections,
}) => {
  // 선택된 뉴스 상태 (모달용 - 상세 데이터)
  const [selectedNews, setSelectedNews] = useState<NewsDetailItem | null>(null);
  const [isNewsDetailLoading, setIsNewsDetailLoading] = useState(false);

  // 실제 뉴스 API 연동
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["latestNews"],
    queryFn: async () => {
      const response = await getNewsList({ page: 1, page_size: 10 });
      return response.data?.results ?? [];
    },
    refetchInterval: 60000, // 1분마다 갱신
  });

  // 뉴스 상세 조회 핸들러
  const handleNewsClick = async (newsId: number) => {
    setIsNewsDetailLoading(true);
    try {
      const response = await getNewsDetail(newsId);
      setSelectedNews(response.data);
    } catch (error) {
      console.error("뉴스 상세 조회 실패:", error);
    } finally {
      setIsNewsDetailLoading(false);
    }
  };

  // 시간 포맷 함수
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  // 날짜 포맷 함수 (모달용)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div
        className={`bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col h-[600px] transition-all duration-700 ${visibleSections.has("ai-issue") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-1 block">
              Real-time Signals
            </span>
            <h3 className="text-2xl font-bold">AI 속보 브리핑</h3>
          </div>
          <div className="p-2 bg-red-500/20 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {news.map((item) => (
              <div
                key={item.news_id}
                onClick={() => handleNewsClick(item.news_id)}
                className="block bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded text-white font-bold">
                    {item.keywords?.[0] ?? item.press}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {formatTimeAgo(item.published_at)}
                  </span>
                </div>
                <h4 className="text-base font-semibold leading-relaxed group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-white/30 mt-3">{item.press}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 뉴스 상세 모달 */}
      {(selectedNews || isNewsDetailLoading) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isNewsDetailLoading && setSelectedNews(null)}
          ></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl z-10 p-8 shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
            {isNewsDetailLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : (
              selectedNews && (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedNews.keywords?.slice(0, 3).map((keyword, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedNews(null)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={24} className="text-gray-400" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-slate-800 leading-tight">
                    {selectedNews.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    {selectedNews.press && (
                      <span className="font-medium text-slate-700">
                        {selectedNews.press}
                      </span>
                    )}
                    {selectedNews.author && (
                      <span>· {selectedNews.author}</span>
                    )}
                    {selectedNews.published_at && (
                      <span>· {formatDate(selectedNews.published_at)}</span>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 mb-4">
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                      {selectedNews.content || selectedNews.summary}
                    </p>
                  </div>
                  {selectedNews.url && (
                    <div className="pt-4 border-t border-gray-100">
                      <a
                        href={selectedNews.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        원문 보기
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
};

// --- Main Dashboard Component ---

const Dashboard: React.FC<DashboardProps> = ({
  onIndustryClick,
  onShowNavbar,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(["hero"]),
  );

  // 기업 검색 쿼리
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["companySearch", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await searchCompanies(searchQuery);
      return response.data?.data?.results ?? [];
    },
    enabled: searchQuery.trim().length > 0,
    staleTime: 1000 * 60,
  });

  // 검색 결과 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 기업 클릭 핸들러
  const handleCompanySelect = (stockCode: string) => {
    setShowSearchResults(false);
    setSearchQuery("");
    navigate(`/company/${stockCode}`);
  };

  // 0. 시장지수 1년치 데이터 초기화 (앱 시작 시 한 번만 실행)
  useQuery({
    queryKey: ["initialIndices"],
    queryFn: saveInitialIndices,
    staleTime: Infinity, // 한 번 실행 후 다시 실행하지 않음
    retry: 1,
  });

  // 1. 시장 지수 데이터 (수정된 타입 적용)
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

  // 2. 기업 랭킹 데이터 조회 (평형좌표계용)
  const { data: companyRankingsData = [], isLoading: isRankingsLoading } =
    useQuery({
      queryKey: ["dashboardCompanyRankings"],
      queryFn: async () => {
        const response = await getCompanyRankings();
        const data = response?.data ?? response ?? [];
        // 상위 100개만 가져오기
        return data.slice(0, 100);
      },
      staleTime: 1000 * 60 * 5,
    });

  // 각 기업의 재무 데이터 상태 관리
  const [financialsMap, setFinancialsMap] = useState<
    Record<
      string,
      {
        roe: number;
        pbr: number;
        per: number;
        debtRatio: number;
        divYield: number;
      }
    >
  >({});

  // 기업 목록이 변경되면 각 기업의 재무 데이터를 가져옴
  useEffect(() => {
    if (companyRankingsData.length === 0) return;

    const abortController = new AbortController();
    const requestId = Date.now();
    let currentRequestId = requestId;

    const fetchFinancials = async () => {
      const newFinancialsMap: Record<
        string,
        {
          roe: number;
          pbr: number;
          per: number;
          debtRatio: number;
          divYield: number;
        }
      > = {};

      // 동시성 제한을 위한 청크 처리 (한번에 10개씩)
      const CONCURRENCY_LIMIT = 10;
      const companies = companyRankingsData as Array<{ stock_code: string }>;

      for (let i = 0; i < companies.length; i += CONCURRENCY_LIMIT) {
        // 요청이 취소되었거나 새 요청이 시작된 경우 중단
        if (abortController.signal.aborted || currentRequestId !== requestId) {
          return;
        }

        const chunk = companies.slice(i, i + CONCURRENCY_LIMIT);

        const chunkResults = await Promise.all(
          chunk.map(async (company) => {
            let roe = 0,
              pbr = 0,
              per = 0,
              debtRatio = 0,
              divYield = 0;

            try {
              const response = await getCompanyFinancials(
                company.stock_code,
                abortController.signal,
              );
              const financialStatements =
                response?.data?.data?.financial_statements;
              if (financialStatements && financialStatements.length > 0) {
                const latest = financialStatements[0];
                roe = latest.roe ?? 0;
                pbr = latest.pbr ?? 0;
                per = latest.per ?? 0;
                debtRatio = latest.debt_ratio ?? 0;
                divYield = latest.dividend_yield ?? 0;
              }
            } catch (error) {
              // AbortError/CanceledError는 무시 (정상적인 취소)
              if (
                error instanceof Error &&
                (error.name === "AbortError" || error.name === "CanceledError")
              ) {
                return null;
              }
              console.error(
                `Failed to fetch financials for ${company.stock_code}:`,
                error,
              );
            }

            return {
              stockCode: company.stock_code,
              data: { roe, pbr, per, debtRatio, divYield },
            };
          }),
        );

        // 유효한 결과만 맵에 추가
        chunkResults.forEach((result) => {
          if (result) {
            newFinancialsMap[result.stockCode] = result.data;
          }
        });
      }

      // race condition 방지: 현재 요청이 최신인 경우에만 상태 업데이트
      if (!abortController.signal.aborted && currentRequestId === requestId) {
        setFinancialsMap(newFinancialsMap);
      }
    };

    fetchFinancials();

    // cleanup: 컴포넌트 언마운트 또는 의존성 변경 시 요청 취소
    return () => {
      currentRequestId = 0; // race condition 방지
      abortController.abort();
    };
  }, [companyRankingsData]);

  // 차트에 표시할 주식 데이터 (API 데이터 + 재무 데이터)
  const stocks = useMemo(() => {
    if (companyRankingsData.length === 0) return SAMPLE_STOCKS;

    return companyRankingsData.map(
      (company: {
        stock_code: string;
        name: string;
        sector?: string;
        logo?: string;
      }) => {
        const financials = financialsMap[company.stock_code];
        return {
          id: company.stock_code,
          name: company.name,
          sector: company.sector ?? "-",
          per: financials?.per ?? 0,
          pbr: financials?.pbr ?? 0,
          roe: financials?.roe ?? 0,
          debtRatio: financials?.debtRatio ?? 0,
          divYield: financials?.divYield ?? 0,
          logo: company.logo,
        };
      },
    );
  }, [companyRankingsData, financialsMap]);

  const isStocksLoading =
    isRankingsLoading ||
    (companyRankingsData.length > 0 && Object.keys(financialsMap).length === 0);

  // 3. 뉴스 키워드 데이터 (AI 이슈포착 버블 차트용)
  const { data: keywordsData } = useQuery({
    queryKey: ["newsKeywords"],
    queryFn: async () => {
      const response = await getNewsKeywords({ size: 15 });
      return response.data?.data?.keywords ?? [];
    },
    refetchInterval: 60000 * 5, // 5분마다 갱신
  });

  // 4. 최신 보고서 데이터 (자본시장 공시용)
  const {
    data: recentReports = [],
    isLoading: isReportsLoading,
    isError: isReportsError,
  } = useQuery<RecentReportItem[]>({
    queryKey: ["recentReports"],
    queryFn: async () => {
      const response = await getRecentReports();
      return response.data.data ?? [];
    },
    refetchInterval: 60000 * 5, // 5분마다 갱신
  });

  const [filters, setFilters] = useState<Partial<Record<AxisKey, BrushRange>>>(
    {},
  );
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const filteredIds = useMemo(() => {
    const ids = new Set<string>();
    stocks.forEach((stock: Stock) => {
      let pass = true;
      for (const key of Object.keys(filters) as AxisKey[]) {
        const range = filters[key];
        if (range) {
          const min = range.min ?? -Infinity;
          const max = range.max ?? Infinity;
          const value = Number(stock[key]);
          if (isNaN(value) || value < min || value > max) {
            pass = false;
            break;
          }
        }
      }
      if (pass) ids.add(stock.id);
    });
    return ids;
  }, [filters, stocks]);

  // ParallelCoordinatesChart에서 기업 클릭 시 상세 페이지로 이동
  const handleChartStockSelect = (stock: Stock | null) => {
    setSelectedStock(stock);
    if (stock) {
      navigate(`/company/${stock.id}`);
    }
  };

  // 섹션 감지 및 스크롤 핸들러
  useEffect(() => {
    const sectionIds = [
      "hero",
      "parallel-coordinates",
      "market-dashboard",
      "ai-issue",
    ];
    const observers = sectionIds.map((id) => {
      const element = document.getElementById(id);
      if (!element) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting)
            setVisibleSections((prev) => new Set([...prev, id]));
        },
        { threshold: 0.1 },
      );
      observer.observe(element);
      return observer;
    });

    const handleScroll = () => {
      if (!scrollRef.current) return;
      onShowNavbar(scrollRef.current.scrollTop > 100);
    };

    const div = scrollRef.current;
    div?.addEventListener("scroll", handleScroll);
    return () => {
      observers.forEach((obs) => obs?.disconnect());
      div?.removeEventListener("scroll", handleScroll);
    };
  }, [onShowNavbar]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto bg-slate-50 scroll-smooth snap-y snap-proximity"
    >
      {/* 1. HERO SECTION */}
      <section
        id="hero"
        className="h-screen w-full flex flex-col items-center justify-center relative bg-[#0046FF] px-6 snap-start"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div
          className={`relative z-10 max-w-4xl text-center transition-all duration-1000 ${visibleSections.has("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white text-xs font-bold mb-8">
            <TrendingUp size={14} /> NEXT-GEN QUANT TERMINAL
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">
            데이터로 읽는
            <br />
            기업의 <span className="text-blue-300">미래 가치</span>
          </h1>
        </div>
        {/* 스크롤 다운 인디케이터 */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 z-10">
          <span className="text-xs tracking-widest uppercase">Scroll Down</span>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* 2. QUANT ANALYSIS (평형좌표계) SECTION */}
      <section
        id="parallel-coordinates"
        className="min-h-screen w-full py-24 px-6 bg-white snap-start flex flex-col justify-center"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-700 ${visibleSections.has("parallel-coordinates") ? "opacity-100" : "opacity-0 translate-y-10"}`}
        >
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              다차원 가치 지표 분석
            </h2>
            <p className="text-slate-500 mt-1">
              다차원 필터를 통해 원하는 조건의 기업을 실시간으로 필터링하세요.
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm">
            {isStocksLoading ? (
              <div className="h-[500px] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : (
              <ParallelCoordinatesChart
                data={stocks}
                onFilterChange={setFilters}
                filters={filters}
                filteredIds={filteredIds}
                onStockSelect={handleChartStockSelect}
                selectedStockId={selectedStock?.id ?? null}
              />
            )}
          </div>
        </div>
      </section>

      {/* 3. MARKET DASHBOARD SECTION */}
      <section
        id="market-dashboard"
        className="min-h-screen w-full py-24 px-6 bg-slate-50 snap-start"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-700 ${visibleSections.has("market-dashboard") ? "opacity-100" : "opacity-0 translate-y-10"}`}
        >
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900">
              실시간 시장 대시보드
            </h2>
            <p className="text-slate-500 mt-2">
              주요 지수 및 섹터별 랭킹을 한눈에 확인하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-shrink-0">
                {/* KOSPI CARD */}
                <GlassCard
                  className="p-8 bg-white border border-slate-100 cursor-pointer hover:shadow-md transition-shadow min-h-[280px]"
                  onClick={() => onIndustryClick("kospi")}
                >
                  <div className="flex justify-between items-start mb-4">
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
                  <span className="text-4xl font-extrabold text-slate-900">
                    {isKospiLoading ? (
                      <Loader2
                        className="animate-spin text-slate-400"
                        size={24}
                      />
                    ) : isKospiError ? (
                      <span className="text-red-400 text-lg">연결 실패</span>
                    ) : (
                      (kospiData?.current_price?.toLocaleString() ?? "---")
                    )}
                  </span>
                  <div className="h-32 mt-4">
                    <StockChart
                      color={
                        kospiData && kospiData.change_rate >= 0
                          ? "#10B981"
                          : "#EF4444"
                      }
                      showAxes={false}
                    />
                  </div>
                </GlassCard>

                {/* KOSDAQ CARD */}
                <GlassCard
                  className="p-8 bg-white border border-slate-100 cursor-pointer hover:shadow-md transition-shadow min-h-[280px]"
                  onClick={() => onIndustryClick("kosdaq")}
                >
                  <div className="flex justify-between items-start mb-4">
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
                  <span className="text-4xl font-extrabold text-slate-900">
                    {isKosdaqLoading ? (
                      <Loader2
                        className="animate-spin text-slate-400"
                        size={24}
                      />
                    ) : isKosdaqError ? (
                      <span className="text-red-400 text-lg">연결 실패</span>
                    ) : (
                      (kosdaqData?.current_price?.toLocaleString() ?? "---")
                    )}
                  </span>
                  <div className="h-32 mt-4">
                    <StockChart
                      color={
                        kosdaqData && kosdaqData.change_rate >= 0
                          ? "#10B981"
                          : "#EF4444"
                      }
                      showAxes={false}
                    />
                  </div>
                </GlassCard>
              </div>
              <IndustryRankingCard
                onCompanyClick={(id) => navigate(`/company/${id}`)}
              />
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* 검색바 */}
              <div className="relative w-full" ref={searchRef}>
                <div className="relative flex items-center">
                  <Search
                    className="absolute left-4 text-slate-400 z-10 pointer-events-none"
                    size={20}
                  />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:border-blue-400 transition-all"
                    placeholder="기업명 혹은 종목코드"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                  />
                </div>
                {/* 검색 결과 드롭다운 */}
                {showSearchResults && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-80 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2
                          className="animate-spin text-blue-500"
                          size={24}
                        />
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults
                        .slice(0, MAX_SEARCH_RESULTS)
                        .map((company) => (
                          <button
                            key={company.stock_code}
                            onClick={() =>
                              handleCompanySelect(company.stock_code)
                            }
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                          >
                            <div className="w-8 h-8 flex-shrink-0">
                              {company.logo_url ? (
                                <img
                                  src={company.logo_url}
                                  alt={company.company_name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                                  {(company.company_name &&
                                    company.company_name.charAt(0)) ||
                                    (company.stock_code &&
                                      company.stock_code.charAt(0)) ||
                                    "?"}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-800 truncate">
                                {company.company_name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {company.stock_code}
                              </div>
                            </div>
                          </button>
                        ))
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-sm">
                        검색 결과가 없습니다
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 자본시장 공시 */}
              <div className="bg-white rounded-3xl p-8 flex-1 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Bell size={20} className="text-blue-600" /> 자본시장 공시
                </h3>
                <div className="space-y-6">
                  {isReportsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2
                        className="animate-spin text-blue-500"
                        size={24}
                      />
                    </div>
                  ) : isReportsError ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      공시 데이터를 불러오지 못했습니다
                    </div>
                  ) : recentReports.length > 0 ? (
                    recentReports.slice(0, 4).map((report) => (
                      <div
                        key={report.id}
                        className="pb-4 border-b border-slate-50"
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
                        <span className="text-[11px] text-slate-400 mt-2 block">
                          {new Date(report.submitted_at).toLocaleDateString(
                            "ko-KR",
                          )}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      최신 공시가 없습니다
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate("/disclosures")}
                    className="w-full pt-2 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span className="text-sm font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                      전체공시 보기
                    </span>
                    <svg
                      className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI ISSUE TRACKING SECTION */}
      <section
        id="ai-issue"
        className="min-h-screen w-full py-24 px-6 bg-white snap-start flex flex-col justify-center"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-700 ${visibleSections.has("ai-issue") ? "opacity-100" : "opacity-0 translate-y-10"}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  AI 이슈포착
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  수만 개의 뉴스 데이터 속에서{" "}
                  <span className="text-blue-600 font-bold">
                    인공지능이 추출한 핵심 마켓 시그널
                  </span>
                  을 확인하세요.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                <AIBubbleChart keywords={keywordsData} />
              </div>
            </div>
            <AINewsBriefing visibleSections={visibleSections} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
