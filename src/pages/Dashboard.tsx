import React, { useRef, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/Layout/GlassCard";
import StockChart from "../components/Charts/StockChart";
import AIBubbleChart from "../components/Charts/AIBubbleChart";
import ParallelCoordinatesChart from "../components/Charts/ParallelCoordinatesChart";
import IndustryRankingCard from "../components/Ranking/IndustryRankingCard";
import { ArrowRight, Search } from "lucide-react";
import { PageView } from "../types";
import type { Stock, AxisKey, BrushRange } from "../types";
import { SAMPLE_STOCKS } from "../constants";

interface DashboardProps {
  setPage: (page: PageView) => void;
  onIndustryClick: (industryId: string) => void;
  onShowNavbar: (show: boolean) => void;
}

// AI 속보 브리핑 컴포넌트
const aiNewsData = [
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

const AINewsBriefing: React.FC<{ visibleSections: Set<string> }> = ({
  visibleSections,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const newsContainerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    if (newsContainerRef.current) {
      const scrollAmount =
        index * (newsContainerRef.current.scrollHeight / aiNewsData.length);
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
        const newIndex = Math.round(scrollRatio * (aiNewsData.length - 1));
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
      {/* Decorative dot */}
      <div className="absolute top-6 right-6 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>

      <div className="mb-10">
        <span className="text-xs font-bold text-blue-300 tracking-widest uppercase mb-2 block">
          Market Signals
        </span>
        <h3 className="text-2xl font-bold">AI 속보 브리핑</h3>
      </div>

      <div
        ref={newsContainerRef}
        onScroll={handleScroll}
        className="space-y-4 max-h-[400px] overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.2) transparent",
        }}
      >
        {aiNewsData.map((news, i) => (
          <div
            key={i}
            className="bg-white/15 backdrop-blur-md rounded-xl p-6 text-white cursor-pointer hover:bg-white/25 transition-all border border-white/20 shadow-lg group"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                {news.tag}
              </span>
              <span className="text-xs text-white/60">{news.time}</span>
            </div>
            <h4 className="font-bold text-lg mb-4 leading-snug group-hover:text-blue-200 transition-colors">
              {news.title}
            </h4>
            <div className="text-xs text-white/50 font-medium">
              {news.source}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots - Clickable */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {aiNewsData.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 hover:scale-150 ${
              currentIndex === i ? "bg-white" : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`뉴스 ${i + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({
  setPage,
  onIndustryClick,
  onShowNavbar,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(["hero"]),
  );
  const navigate = useNavigate();

  // Parallel Coordinates Chart State
  const [filters, setFilters] = useState<Partial<Record<AxisKey, BrushRange>>>(
    {},
  );
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const filteredIds = useMemo(() => {
    const ids = new Set<string>();
    SAMPLE_STOCKS.forEach((stock) => {
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
  }, [filters]);

  const handleCompanyClick = (companyCode: string) => {
    navigate(`/company/${companyCode}`);
  };

  useEffect(() => {
    // Initial check: Hide navbar if at the top (Onboarding section)
    if (scrollRef.current) {
      const threshold = window.innerHeight * 0.8;
      onShowNavbar(scrollRef.current.scrollTop > threshold);
    } else {
      onShowNavbar(false);
    }

    const handleScroll = () => {
      if (!scrollRef.current) return;
      const scrollTop = scrollRef.current.scrollTop;
      const threshold = window.innerHeight * 0.8;

      // Show navbar after scrolling past most of the first section
      if (scrollTop > threshold) {
        onShowNavbar(true);
      } else {
        onShowNavbar(false);
      }
    };

    const div = scrollRef.current;
    if (div) {
      div.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (div) {
        div.removeEventListener("scroll", handleScroll);
      }
    };
  }, [onShowNavbar]);

  useEffect(() => {
    const handleScrollTop = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("dashboard-scroll-top", handleScrollTop);
    return () =>
      window.removeEventListener("dashboard-scroll-top", handleScrollTop);
  }, []);

  // Scroll-driven Interaction: IntersectionObserver for section animations
  useEffect(() => {
    const sectionIds = [
      "hero",
      "parallel-coordinates",
      "market-dashboard",
      "ai-issue",
    ];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleSections((prev) => new Set([...prev, id]));
              }
            });
          },
          {
            threshold: 0.15,
            rootMargin: "-50px 0px",
          },
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto no-scrollbar relative bg-white snap-y snap-proximity scroll-smooth"
    >
      {/* 1. HERO SECTION - Snap Start */}
      <section
        id="hero"
        className="h-screen w-full flex flex-col items-center justify-center relative bg-[#0046FF] px-6 text-center overflow-hidden snap-start shrink-0"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>

        <div
          className={`relative z-10 max-w-4xl mx-auto transition-all duration-500 ease-out ${
            visibleSections.has("hero")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 text-blue-100 text-xs font-bold tracking-widest mb-8 backdrop-blur-sm">
            PROFESSIONAL QUANT ANALYSIS PLATFORM
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
            흩어진 기업 정보를
            <br />
            한눈에, <span className="text-blue-200">더 명확하게</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100/80 mb-12 leading-relaxed max-w-2xl mx-auto">
            숫자와 공시로 기업의 본질을 봅니다.
            <br />
            당신의 투자 판단을 위한 가장 견고한 데이터 레이어.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection("market-dashboard")}
              className="px-8 py-4 bg-white text-shinhan-blue font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              대시보드 시작 <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-xs flex flex-col items-center gap-2 animate-bounce">
          <span>SCROLL DOWN</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent"></div>
        </div>
      </section>

      {/* 2. PARALLEL COORDINATES SECTION - Snap Start */}
      <section
        id="parallel-coordinates"
        className="min-h-screen w-full flex flex-col justify-center py-32 px-6 bg-white snap-start shrink-0"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-500 ease-out ${
            visibleSections.has("parallel-coordinates")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-16"
          }`}
        >
          <div className="text-center mb-12">
            <span className="text-shinhan-blue font-bold tracking-widest text-sm uppercase">
              Quant Analysis
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2">
              나만의 저평가 우량주 발굴
            </h2>
            <p className="text-slate-500 mt-4">
              각 축을 드래그하여 조건을 설정하고, 조건에 맞는 종목을 찾아보세요
            </p>
          </div>

          <ParallelCoordinatesChart
            data={SAMPLE_STOCKS}
            onFilterChange={setFilters}
            filters={filters}
            filteredIds={filteredIds}
            onStockSelect={setSelectedStock}
            selectedStockId={selectedStock?.id ?? null}
          />

          {/* Selected Stock Info */}
          {selectedStock && (
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {selectedStock.name}
                  </h3>
                  <span className="text-sm text-slate-500">
                    {selectedStock.sector}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/company/${selectedStock.id}`)}
                  className="px-6 py-3 bg-shinhan-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  상세 분석 <ArrowRight size={18} />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">PER</div>
                  <div className="text-xl font-bold text-slate-900">
                    {selectedStock.per.toFixed(1)}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">PBR</div>
                  <div className="text-xl font-bold text-slate-900">
                    {selectedStock.pbr.toFixed(2)}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">ROE</div>
                  <div className="text-xl font-bold text-slate-900">
                    {selectedStock.roe.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">부채비율</div>
                  <div className="text-xl font-bold text-slate-900">
                    {selectedStock.debtRatio}%
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">배당수익률</div>
                  <div className="text-xl font-bold text-slate-900">
                    {selectedStock.divYield.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Summary */}
          <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
            <span>
              필터링 결과:{" "}
              <strong className="text-shinhan-blue">{filteredIds.size}</strong>
              개 종목
            </span>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => setFilters({})}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. MARKET DASHBOARD SECTION - Snap Start */}
      <section
        id="market-dashboard"
        className="min-h-screen w-full flex flex-col justify-center py-32 px-6 bg-slate-50 snap-start shrink-0"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-500 ease-out ${
            visibleSections.has("market-dashboard")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-16"
          }`}
        >
          <div
            className={`text-center mb-16 transition-all duration-300 delay-75 ${
              visibleSections.has("market-dashboard")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-8">
              실시간 시장 대시보드
            </h2>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search
                  className="text-gray-400 group-focus-within:text-shinhan-blue transition-colors"
                  size={24}
                />
              </div>
              <input
                type="text"
                className="w-full pl-16 pr-6 py-5 rounded-2xl border-2 border-transparent bg-white shadow-xl shadow-blue-900/5 text-lg placeholder:text-gray-400 focus:outline-none focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder="기업명 또는 종목번호를 입력하세요 (예: 삼성전자, 005930)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setPage(PageView.COMPANY_SEARCH);
                }}
              />
            </div>
          </div>

          <div
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-300 delay-150 ${
              visibleSections.has("market-dashboard")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            {/* Indices */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard
                className="p-6 bg-white hover:-translate-y-1 transition-transform cursor-pointer"
                onClick={() => onIndustryClick("finance")}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">KOSPI</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-bold text-slate-900">
                        2,755.02
                      </span>
                    </div>
                    <div className="text-sm font-bold text-red-500 mt-1">
                      ▲ 24.32 (0.89%)
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">
                    TODAY
                  </span>
                </div>
                <div className="h-24 w-full">
                  <StockChart color="#10B981" showAxes={false} />
                </div>
              </GlassCard>
              <GlassCard className="p-6 bg-white hover:-translate-y-1 transition-transform cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">KOSDAQ</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-bold text-slate-900">
                        855.12
                      </span>
                    </div>
                    <div className="text-sm font-bold text-blue-500 mt-1">
                      ▼ 12.11 (1.40%)
                    </div>
                  </div>
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded">
                    TODAY
                  </span>
                </div>
                <div className="h-24 w-full">
                  <StockChart color="#EF4444" showAxes={false} />
                </div>
              </GlassCard>

              {/* Industry Ranking */}
              <div className="md:col-span-2">
                <IndustryRankingCard onCompanyClick={handleCompanyClick} />
              </div>
            </div>

            {/* Disclosure Stream */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl p-6 h-full border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-shinhan-blue animate-pulse"></div>
                    <h3 className="text-sm font-bold text-slate-800">
                      자본시장 공시
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    LIVE
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      title: "삼성전자, 10조원 규모 자사주 매입 결정",
                      time: "24분 전",
                      tag: "자사주",
                    },
                    {
                      title: "카카오, 1,500억원 규모 전환사채(CB) 발행 공고",
                      time: "45분 전",
                      tag: "CB발행",
                    },
                    {
                      title: "현대차, 1:5 무상증자 결정... 주주가치 제고",
                      time: "1시간 전",
                      tag: "무상증자",
                    },
                    {
                      title: "LG에너지솔루션, 자사주 300만주 소각 공시",
                      time: "2시간 전",
                      tag: "소각",
                    },
                    {
                      title: "네이버, 액면분할(1:10) 주주총회 의결",
                      time: "3시간 전",
                      tag: "액면분할",
                    },
                  ].map((news, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[#0046FF] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {news.tag}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {news.time}
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-700 text-sm leading-snug group-hover:text-slate-900 transition-colors line-clamp-2">
                        {news.title}
                      </h4>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 text-sm font-medium text-slate-500 hover:text-shinhan-blue border border-slate-200 rounded-xl hover:border-shinhan-blue transition-all flex items-center justify-center gap-2">
                  전체 공시 보기 <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI ISSUE TRACKING - NO SNAP START (Free Scroll after Dashboard) */}
      <section
        id="ai-issue"
        className="min-h-screen w-full flex flex-col justify-center py-32 px-6 bg-white overflow-hidden shrink-0"
      >
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-500 ease-out ${
            visibleSections.has("ai-issue")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-16"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div
              className={`transition-all duration-300 delay-75 ${
                visibleSections.has("ai-issue")
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <h2 className="text-5xl font-bold text-black mb-6">
                AI 이슈포착
              </h2>
              <p className="text-lg text-slate-900 mb-12 leading-relaxed">
                실시간 뉴스데이터와 검색량을 기반으로
                <br />
                시장 주도 섹터의 임계점을 분석합니다.
              </p>

              <div className="relative">
                {/* Decorate Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                <div className="relative z-10">
                  <AIBubbleChart />
                </div>
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
