import React, { useRef, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, Loader2, TrendingUp, Bell } from "lucide-react";

// Components
import GlassCard from "../components/Layout/GlassCard";
import StockChart from "../components/Charts/StockChart";
import AIBubbleChart from "../components/Charts/AIBubbleChart";
import ParallelCoordinatesChart from "../components/Charts/ParallelCoordinatesChart";
import IndustryRankingCard from "../components/Ranking/IndustryRankingCard";

// Types & Constants
import { PageView } from "../types";
import type { Stock, AxisKey, BrushRange } from "../types";
import { SAMPLE_STOCKS } from "../constants";

interface DashboardProps {
  setPage: (page: PageView) => void;
  onIndustryClick: (industryId: string) => void;
  onShowNavbar: (show: boolean) => void;
}

/**
 * API Mock Functions
 */
const fetchAINews = async () => {
  return [
    {
      tag: "방산수출",
      time: "방금 전",
      title: '"60조 잠수함 따자"... 한화와 정부, 캐나다 합동 방문 추진',
      source: "국방일보",
    },
    {
      tag: "삼성전자",
      time: "1시간 전",
      title: "삼성전자, 'HBM3E' 12단 업계 최초 양산... AI 반도체 주도권 잡나",
      source: "테크M",
    },
    {
      tag: "에코프로비엠",
      time: "2시간 전",
      title: "에코프로비엠, 44조원 규모 양극재 공급 계약 체결... 잭팟 터졌다",
      source: "에너지경제",
    },
    {
      tag: "현대차",
      time: "3시간 전",
      title: "현대차, 美 전기차 공장 가동 본격화... 테슬라 추격 시작",
      source: "조선비즈",
    },
    {
      tag: "카카오",
      time: "4시간 전",
      title: "카카오, AI 챗봇 '카나나' 출시... 네이버와 경쟁 본격화",
      source: "IT조선",
    },
  ];
};

const fetchStocks = async (): Promise<Stock[]> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(SAMPLE_STOCKS), 500),
  );
};

// --- Sub Components ---

const AINewsBriefing: React.FC<{ visibleSections: Set<string> }> = ({
  visibleSections,
}) => {
  const newsContainerRef = useRef<HTMLDivElement>(null);
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["aiNews"],
    queryFn: fetchAINews,
    refetchInterval: 60000,
  });

  return (
    <div
      className={`bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col h-[600px] transition-all duration-700 ${
        visibleSections.has("ai-issue")
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10"
      }`}
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
        <div
          ref={newsContainerRef}
          className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar"
        >
          {news.map((item, i) => (
            <div
              key={i}
              className="bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="flex justify-between mb-2">
                <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded text-white font-bold">
                  {item.tag}
                </span>
                <span className="text-[10px] text-white/40">{item.time}</span>
              </div>
              <h4 className="text-base font-semibold leading-relaxed group-hover:text-blue-300 transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] text-white/30 mt-3">{item.source}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Dashboard Component ---

const Dashboard: React.FC<DashboardProps> = ({
  setPage,
  onIndustryClick,
  onShowNavbar,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(["hero"]),
  );

  const { data: stocks = [], isLoading: isStocksLoading } = useQuery({
    queryKey: ["stocks"],
    queryFn: fetchStocks,
    staleTime: 5 * 60 * 1000,
  });

  const [filters, setFilters] = useState<Partial<Record<AxisKey, BrushRange>>>(
    {},
  );
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const filteredIds = useMemo(() => {
    const ids = new Set<string>();
    stocks.forEach((stock) => {
      let pass = true;
      for (const key of Object.keys(filters) as AxisKey[]) {
        const range = filters[key];
        if (range && (stock[key] < range.min || stock[key] > range.max)) {
          pass = false;
          break;
        }
      }
      if (pass) ids.add(stock.id);
    });
    return ids;
  }, [filters, stocks]);

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
        { threshold: 0.1, rootMargin: "-10% 0px" },
      );
      observer.observe(element);
      return observer;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      onShowNavbar(scrollRef.current.scrollTop > 100);
    };
    const div = scrollRef.current;
    div?.addEventListener("scroll", handleScroll);
    return () => div?.removeEventListener("scroll", handleScroll);
  }, [onShowNavbar]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto bg-slate-50 scroll-smooth snap-y snap-proximity"
    >
      {/* 1. HERO SECTION - 비율 유지하되 깔끔하게 정리 */}
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
          <button
            onClick={() =>
              document
                .getElementById("parallel-coordinates")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-10 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 mx-auto"
          >
            분석 도구 시작 <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* 2. QUANT ANALYSIS SECTION - 시각적 여백 확보 */}
      <section
        id="parallel-coordinates"
        className="min-h-screen w-full py-24 px-6 bg-white snap-start flex flex-col justify-center"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-700 ${visibleSections.has("parallel-coordinates") ? "opacity-100" : "opacity-0 translate-y-10"}`}
        >
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              나만의 저평가 우량주 발굴
            </h2>
            <p className="text-slate-500 mt-2">
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
                onStockSelect={setSelectedStock}
                selectedStockId={selectedStock?.id ?? null}
              />
            )}
          </div>

          {selectedStock && (
            <div className="mt-8 p-6 bg-blue-600 rounded-3xl text-white flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div>
                <span className="text-blue-100 text-sm font-medium">
                  {selectedStock.sector}
                </span>
                <h3 className="text-2xl font-bold">
                  {selectedStock.name}{" "}
                  <span className="text-lg opacity-80 font-normal ml-2">
                    {selectedStock.id}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => navigate(`/company/${selectedStock.id}`)}
                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl flex items-center gap-2 hover:bg-blue-50 transition-colors"
              >
                상세 리포트 보기 <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. MARKET DASHBOARD - 그리드 및 검색바 강조 */}
      <section
        id="market-dashboard"
        className="min-h-screen w-full py-24 px-6 bg-slate-50 snap-start"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-700 ${visibleSections.has("market-dashboard") ? "opacity-100" : "opacity-0 translate-y-10"}`}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                실시간 시장 대시보드
              </h2>
              <p className="text-slate-500 mt-2">
                주요 지수 및 섹터별 랭킹을 한눈에 확인하세요.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-none shadow-lg focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="기업명 혹은 종목코드"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard
                  className="p-8 bg-white border border-slate-100"
                  onClick={() => onIndustryClick("finance")}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-500 uppercase tracking-tighter">
                      KOSPI
                    </h3>
                    <span className="text-emerald-500 font-bold text-sm">
                      +1.24%
                    </span>
                  </div>
                  <span className="text-4xl font-extrabold text-slate-900">
                    2,755.02
                  </span>
                  <div className="h-32 mt-4">
                    <StockChart color="#10B981" showAxes={false} />
                  </div>
                </GlassCard>
                <GlassCard className="p-8 bg-white border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-500 uppercase tracking-tighter">
                      KOSDAQ
                    </h3>
                    <span className="text-red-500 font-bold text-sm">
                      -0.45%
                    </span>
                  </div>
                  <span className="text-4xl font-extrabold text-slate-900">
                    855.12
                  </span>
                  <div className="h-32 mt-4">
                    <StockChart color="#EF4444" showAxes={false} />
                  </div>
                </GlassCard>
              </div>
              <IndustryRankingCard
                onCompanyClick={(id) => navigate(`/company/${id}`)}
              />
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-8 h-full border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Bell size={20} className="text-blue-600" /> 자본시장 공시
                </h3>
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="pb-4 border-b border-slate-50 last:border-0"
                    >
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        공시
                      </span>
                      <p className="text-sm font-semibold text-slate-800 mt-1 line-clamp-2 hover:text-blue-600 cursor-pointer">
                        {i % 2 === 0
                          ? "[기재정정] 사업보고서 (2025.12)"
                          : "주요사항보고서 (유상증자 결정)"}
                      </p>
                      <span className="text-[11px] text-slate-400 mt-2 block">
                        14:2{i} | 금융감독원
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI ISSUE TRACKING - 레이아웃 균형 조정 */}
      <section
        id="ai-issue"
        className="min-h-screen w-full py-24 px-6 bg-white snap-start"
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
                <p className="text-xl text-slate-600 leading-relaxed">
                  수만 개의 뉴스 데이터 속에서{" "}
                  <span className="text-blue-600 font-bold">
                    인공지능이 추출한
                  </span>{" "}
                  핵심 마켓 시그널을 확인하세요.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                <AIBubbleChart />
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
