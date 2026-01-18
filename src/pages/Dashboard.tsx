import React, { useRef, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, Loader2 } from "lucide-react";

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
 * API Mock Functions (실제 API 호출로 대체 가능)
 */
const fetchAINews = async () => {
  // 실제 환경에서는 axios.get('/api/news') 등으로 대체
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const newsContainerRef = useRef<HTMLDivElement>(null);

  // TanStack Query: 뉴스 데이터 가져오기
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["aiNews"],
    queryFn: fetchAINews,
    refetchInterval: 60000, // 1분마다 자동 갱신
  });

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    if (newsContainerRef.current) {
      const scrollAmount =
        index * (newsContainerRef.current.scrollHeight / news.length);
      newsContainerRef.current.scrollTo({
        top: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (newsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        newsContainerRef.current;
      const scrollableHeight = scrollHeight - clientHeight;
      if (scrollableHeight > 0) {
        const scrollRatio = scrollTop / scrollableHeight;
        const newIndex = Math.round(scrollRatio * (news.length - 1));
        setCurrentIndex(newIndex);
      }
    }
  };

  return (
    <div
      className={`bg-shinhan-dark text-white rounded-2xl p-8 lg:p-12 shadow-2xl relative overflow-hidden min-h-[600px] transition-all duration-300 delay-75 ${
        visibleSections.has("ai-issue")
          ? "opacity-100 translate-x-0 scale-100"
          : "opacity-0 translate-x-10 scale-95"
      }`}
    >
      <div className="absolute top-6 right-6 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
      <div className="mb-10">
        <span className="text-xs font-bold text-blue-300 tracking-widest uppercase mb-2 block">
          Market Signals
        </span>
        <h3 className="text-2xl font-bold">AI 속보 브리핑</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div
          ref={newsContainerRef}
          onScroll={handleScroll}
          className="space-y-4 max-h-[400px] overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          {news.map((item, i) => (
            <div
              key={i}
              className="bg-white/15 backdrop-blur-md rounded-xl p-6 text-white cursor-pointer hover:bg-white/25 transition-all border border-white/20 shadow-lg group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                  {item.tag}
                </span>
                <span className="text-xs text-white/60">{item.time}</span>
              </div>
              <h4 className="font-bold text-lg mb-4 leading-snug group-hover:text-blue-200 transition-colors">
                {item.title}
              </h4>
              <div className="text-xs text-white/50 font-medium">
                {item.source}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {news.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${currentIndex === i ? "bg-white" : "bg-white/30"}`}
          />
        ))}
      </div>
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

  // TanStack Query: 주식 데이터 관리
  const { data: stocks = [], isLoading: isStocksLoading } = useQuery({
    queryKey: ["stocks"],
    queryFn: fetchStocks,
    staleTime: 5 * 60 * 1000,
  });

  // Filtering State
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

  // Intersection Observer for scroll animations
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
        { threshold: 0.15, rootMargin: "-50px 0px" },
      );
      observer.observe(element);
      return observer;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  // Navbar visibility logic
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      onShowNavbar(scrollRef.current.scrollTop > window.innerHeight * 0.8);
    };
    const div = scrollRef.current;
    div?.addEventListener("scroll", handleScroll);
    return () => div?.removeEventListener("scroll", handleScroll);
  }, [onShowNavbar]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto no-scrollbar relative bg-white snap-y snap-proximity scroll-smooth"
    >
      {/* 1. HERO SECTION */}
      <section
        id="hero"
        className="h-screen w-full flex flex-col items-center justify-center relative bg-[#0046FF] px-6 text-center overflow-hidden snap-start"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div
          className={`relative z-10 max-w-4xl transition-all duration-500 ${visibleSections.has("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 text-blue-100 text-xs font-bold tracking-widest mb-8">
            PROFESSIONAL QUANT ANALYSIS PLATFORM
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            흩어진 기업 정보를
            <br />
            한눈에, <span className="text-blue-200">더 명확하게</span>
          </h1>
          <button
            onClick={() => scrollToSection("market-dashboard")}
            className="px-8 py-4 bg-white text-shinhan-blue font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2 mx-auto"
          >
            대시보드 시작 <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* 2. PARALLEL COORDINATES SECTION */}
      <section
        id="parallel-coordinates"
        className="min-h-screen w-full flex flex-col justify-center py-32 px-6 bg-white snap-start"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-500 ${visibleSections.has("parallel-coordinates") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
        >
          <div className="text-center mb-12">
            <span className="text-shinhan-blue font-bold tracking-widest text-sm uppercase">
              Quant Analysis
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2">
              나만의 저평가 우량주 발굴
            </h2>
          </div>

          {isStocksLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Loader2 className="animate-spin text-shinhan-blue" />
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

          {selectedStock && (
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{selectedStock.name}</h3>
                <p className="text-slate-500">{selectedStock.sector}</p>
              </div>
              <button
                onClick={() => navigate(`/company/${selectedStock.id}`)}
                className="px-6 py-3 bg-shinhan-blue text-white font-bold rounded-xl flex items-center gap-2"
              >
                상세 분석 <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. MARKET DASHBOARD SECTION */}
      <section
        id="market-dashboard"
        className="min-h-screen w-full flex flex-col justify-center py-32 px-6 bg-slate-50 snap-start"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-500 ${visibleSections.has("market-dashboard") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-8">
              실시간 시장 대시보드
            </h2>
            <div className="max-w-2xl mx-auto relative group">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
                size={24}
              />
              <input
                type="text"
                className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white shadow-xl focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder="기업명 또는 종목번호를 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard
                className="p-6 bg-white"
                onClick={() => onIndustryClick("finance")}
              >
                <h3 className="font-bold">KOSPI</h3>
                <span className="text-3xl font-bold">2,755.02</span>
                <StockChart color="#10B981" showAxes={false} />
              </GlassCard>
              <GlassCard className="p-6 bg-white">
                <h3 className="font-bold">KOSDAQ</h3>
                <span className="text-3xl font-bold">855.12</span>
                <StockChart color="#EF4444" showAxes={false} />
              </GlassCard>
              <div className="md:col-span-2">
                <IndustryRankingCard
                  onCompanyClick={(id) => navigate(`/company/${id}`)}
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl p-6 h-full border border-slate-200">
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-shinhan-blue animate-pulse"></span>
                  자본시장 공시
                </h3>
                <div className="space-y-3">
                  {/* 정적 공시 데이터 생략 (상단과 동일 구조) */}
                  <p className="text-xs text-slate-400 text-center">
                    최신 공시 데이터를 불러오는 중...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI ISSUE TRACKING */}
      <section
        id="ai-issue"
        className="min-h-screen w-full flex flex-col justify-center py-32 px-6 bg-white"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-500 ${visibleSections.has("ai-issue") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6">AI 이슈포착</h2>
              <p className="text-lg text-slate-600 mb-12">
                실시간 뉴스데이터와 검색량을 기반으로 시장 주도 섹터를
                분석합니다.
              </p>
              <AIBubbleChart />
            </div>
            <AINewsBriefing visibleSections={visibleSections} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
