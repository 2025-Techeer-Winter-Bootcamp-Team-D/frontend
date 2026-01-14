import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/Layout/GlassCard";
import StockChart from "../components/Charts/StockChart";
import AIBubbleChart from "../components/Charts/AIBubbleChart";
import IndustryRankingCard from "../components/Ranking/IndustryRankingCard";
import { ArrowRight, Search, ShieldCheck, Zap } from "lucide-react";
import { PageView } from "../types";

interface DashboardProps {
  setPage: (page: PageView) => void;
  onIndustryClick: (industryId: string) => void;
  onShowNavbar: (show: boolean) => void;
}

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
      "platform-identity",
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
              onClick={() => scrollToSection("platform-identity")}
              className="px-8 py-4 bg-white text-shinhan-blue font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              서비스 소개
            </button>
            <button
              onClick={() => scrollToSection("market-dashboard")}
              className="px-8 py-4 bg-transparent border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
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

      {/* 2. IDENTITY SECTION - Snap Start */}
      <section
        id="platform-identity"
        className="min-h-screen w-full flex items-center py-32 px-6 bg-white relative overflow-hidden snap-start shrink-0"
      >
        <div
          className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center h-full transition-all duration-500 ease-out ${
            visibleSections.has("platform-identity")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-16"
          }`}
        >
          <div
            className={`space-y-8 transition-all duration-300 delay-75 ${
              visibleSections.has("platform-identity")
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <span className="text-shinhan-blue font-bold tracking-widest text-sm uppercase">
              Platform Identity
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              데이터로 완성하는
              <br />
              신뢰의 투자 판단
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              복잡한 텍스트 공시와 나열된 방대한 숫자들을
              <br />
              투자자가 직관적으로 이해할 수 있는
              <br />
              <span className="text-slate-800 font-bold">
                비주얼 데이터 언어
              </span>
              로 재해석합니다.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-shinhan-blue mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">01. 신뢰감</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  금융감독원 DART 정식 API 연동으로 왜곡 없는 고순도 데이터 제공
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 mb-4">
                  <Zap size={24} />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">02. 직관성</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  재무제표 핵심 지표를 트렌드 차트로 시각화하여 빠른 의사결정
                  지원
                </p>
              </div>
            </div>
          </div>

          <div
            className={`relative transition-all duration-300 delay-75 ${
              visibleSections.has("platform-identity")
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-10 scale-95"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-white rounded-3xl transform rotate-3 scale-105"></div>
            <GlassCard className="relative p-8 shadow-2xl shadow-blue-100/50 border-white/80 bg-white/80 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-8 opacity-50">
                <div className="w-20 h-4 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="w-full h-8 bg-gray-100 rounded-lg"></div>
                <div className="w-3/4 h-8 bg-gray-100 rounded-lg"></div>
              </div>
              <div className="h-48 flex items-end justify-between gap-4 mb-8 px-4">
                <div className="w-full bg-indigo-500/20 h-[40%] rounded-t-lg"></div>
                <div className="w-full bg-indigo-500/40 h-[60%] rounded-t-lg"></div>
                <div className="w-full bg-indigo-500/60 h-[50%] rounded-t-lg"></div>
                <div className="w-full bg-indigo-500 h-[80%] rounded-t-lg shadow-lg shadow-indigo-500/30 relative group">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Data
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                  Current Momentum
                </span>
                <div className="text-right">
                  <div className="text-4xl font-bold text-slate-800">98.2</div>
                  <div className="text-xs font-bold text-shinhan-blue tracking-wider">
                    STRONG BUY
                  </div>
                </div>
              </div>
            </GlassCard>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Disclosure Stream
                </h3>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  {
                    title: "Annual Performance Review 2024: Financial Sector",
                    time: "24m ago",
                  },
                  {
                    title: "Strategic Investment Disclosure: AI Infrastructure",
                    time: "45m ago",
                  },
                  {
                    title: "Dividend Distribution Policy Update",
                    time: "1h ago",
                  },
                  {
                    title: "New Governance Structure Announcement",
                    time: "2h ago",
                  },
                  {
                    title: "Q1 2024 Earnings Release Schedule",
                    time: "3h ago",
                  },
                ].map((news, i) => (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <h4 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-shinhan-blue transition-colors line-clamp-1">
                      {news.title}
                    </h4>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{news.time}</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        READ <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                ))}
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

              <div className="space-y-4">
                {[
                  {
                    tag: "방산수출",
                    time: "방금 전",
                    title:
                      '"60조 잠수함 따자"... 한화와 정부, 캐나다 합동 방문 추진',
                    source: "국방일보",
                  },
                  {
                    tag: "삼성전자",
                    time: "1시간 전",
                    title:
                      "삼성전자, 'HBM3E' 12단 업계 최초 양산... AI 반도체 주도권 잡나",
                    source: "테크M",
                  },
                  {
                    tag: "에코프로비엠",
                    time: "2시간 전",
                    title:
                      "에코프로비엠, 44조원 규모 양극재 공급 계약 체결... 잭팟 터졌다",
                    source: "에너지경제",
                  },
                ].map((news, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 text-slate-800 cursor-pointer hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-blue-100 text-shinhan-blue text-xs font-bold px-2 py-1 rounded">
                        {news.tag}
                      </span>
                      <span className="text-xs text-gray-400">{news.time}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-4 leading-snug group-hover:text-shinhan-blue transition-colors">
                      {news.title}
                    </h4>
                    <div className="text-xs text-gray-400 font-medium">
                      {news.source}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Dots */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
