import React, { useEffect, useState, useRef } from "react";
import { IncomeSankeyChart } from "../components/Charts/IncomeSankeyChart";
import OutlookCard from "../components/dash_data/outlookCard";
import ComparisonGrid from "../components/dash_data/ComparisonGrid";
import { motion } from "framer-motion";
import { PageView } from "../types";
import type { SankeyData, CompanySearchItem } from "../types";
import { searchCompanies } from "../api/company";

import {
  Search,
  ArrowRight,
  Zap,
  Wifi,
  Battery,
  Signal,
  TrendingUp,
  BrainCircuit,
  Plus,
  BarChart3,
  PieChart,
  ChevronRight,
} from "lucide-react";

interface DashboardProps {
  setPage: (page: PageView) => void;
  onIndustryClick: (indutyCode: string) => void;
  onShowNavbar: (visible: boolean) => void;
  onCompanySelect?: (stockCode: string) => void;
}

// 샘플 Sankey 데이터
const sankeyData: SankeyData = {
  nodes: [
    { id: "revenue1", name: "DS 부문", color: "#0046FF", category: "Revenue" },
    { id: "revenue2", name: "DX 부문", color: "#3b82f6", category: "Revenue" },
    { id: "revenue3", name: "SDC", color: "#60a5fa", category: "Revenue" },
    { id: "hub", name: "총매출", color: "#1e40af", category: "Hub" },
    { id: "profit", name: "영업이익", color: "#22c55e", category: "Profit" },
    { id: "expense1", name: "매출원가", color: "#f97316", category: "Expense" },
    { id: "expense2", name: "판관비", color: "#eab308", category: "Expense" },
  ],
  links: [
    { source: "revenue1", target: "hub", value: 80000000000000 },
    { source: "revenue2", target: "hub", value: 160000000000000 },
    { source: "revenue3", target: "hub", value: 60000000000000 },
    { source: "hub", target: "profit", value: 50000000000000 },
    { source: "hub", target: "expense1", value: 200000000000000 },
    { source: "hub", target: "expense2", value: 50000000000000 },
  ],
};

const Dashboard: React.FC<DashboardProps> = ({
  setPage,
  onIndustryClick,
  onShowNavbar,
  onCompanySelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CompanySearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  // 수정: 이미지 로드 실패 상태 추가
  const [imageLoadFailed, setImageLoadFailed] = useState<
    Record<string, boolean>
  >({});

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 검색어 변경 시 API 호출 (디바운스 적용)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await searchCompanies(searchQuery);
        // API 구조에 맞춰 결과 추출 (optional chaining)
        type SearchCompaniesResponse =
          | { data?: { results?: CompanySearchItem[] } }
          | { results?: CompanySearchItem[] };
        const data = (response.data ?? {}) as SearchCompaniesResponse;
        const results =
          "results" in data
            ? (data.results ?? [])
            : "data" in data
              ? (data.data?.results ?? [])
              : [];
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error("검색 실패:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCompanyClick = (stockCode: string) => {
    if (onCompanySelect) {
      onCompanySelect(stockCode);
    } else {
      setPage(PageView.COMPANY_DETAIL);
    }
    setSearchQuery("");
    setShowDropdown(false);
  };

  // 컴포넌트 마운트 시 Navbar 항상 표시
  useEffect(() => {
    onShowNavbar(true);
  }, [onShowNavbar]);

  return (
    <div className="min-h-screen bg-white selection:bg-[#0046FF] selection:text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-16 px-5 overflow-hidden bg-gradient-to-b from-[#f2f4f6] to-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-[#0046FF] font-semibold text-sm mb-8 border border-blue-100">
              <Zap size={14} fill="currentColor" />
              <span>QUAntitative Stock Analysis</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-quasa-dark leading-[1.1] mb-8 tracking-tight">
              기업의 가치,
              <br />
              <span className="text-[#0046FF]">데이터</span>로 읽다.
            </h1>
            <p className="text-base md:text-lg font-normal text-quasa-gray mb-12 leading-relaxed">
              파편화된 공시 데이터를 AI가 하나의 흐름으로 통합합니다.{" "}
              <br className="hidden md:block text-md" />
              복잡한 재무제표를 QUASA만의 직관적인 인사이트로 재정의하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setPage(PageView.COMPANY_SEARCH)}
                className="bg-[#0046FF] text-white text-base font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
              >
                지금 시작하기 <ArrowRight size={18} />
              </button>
              <div ref={searchRef} className="relative flex-1 max-w-sm">
                <label className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl py-4 px-5 focus-within:border-[#0046FF]/30 focus-within:ring-2 focus-within:ring-[#0046FF]/10 transition-all cursor-text">
                  <Search
                    className="text-gray-400 group-focus-within:text-[#0046FF] transition-colors flex-shrink-0"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="기업명 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    className="flex-1 bg-transparent focus:outline-none font-medium text-base text-quasa-dark"
                  />
                </label>
                {/* 검색 드롭다운 */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        검색 중...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((company) => (
                        <button
                          key={company.stock_code}
                          onClick={() => handleCompanyClick(company.stock_code)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                        >
                          {company.logo_url &&
                          !imageLoadFailed[company.stock_code] ? (
                            <img
                              src={company.logo_url}
                              alt={company.company_name}
                              className="w-8 h-8 rounded-lg object-contain bg-white border border-gray-100"
                              onError={() =>
                                setImageLoadFailed((prev) => ({
                                  ...prev,
                                  [company.stock_code]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-sm text-slate-600">
                              {company.company_name?.[0] || "?"}
                            </div>
                          )}
                          <div className="flex-1">
                            <span className="font-semibold text-slate-700">
                              {company.company_name}
                            </span>
                            <span className="ml-2 text-xs text-gray-400 font-mono">
                              {company.stock_code}
                            </span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 1 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            viewport={{ once: true }}
            className="relative lg:block hidden"
          >
            <div className="absolute -inset-16 bg-[#0046FF]/5 blur-[100px] rounded-full"></div>

            {/* Tablet Bezel */}
            <div className="relative z-10 bg-[#1c1c1e] p-3 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border-[1px] border-white/5 mx-auto max-w-[600px]">
              <div className="relative bg-white rounded-[2rem] overflow-hidden flex flex-col aspect-[1.5/1] w-full shadow-inner">
                {/* Status Bar */}
                <div className="flex justify-between items-center px-6 py-3 bg-white/95 backdrop-blur-sm z-20 shrink-0">
                  <div className="text-xs font-semibold text-quasa-dark">
                    9:41
                  </div>
                  <div className="flex items-center gap-2 text-quasa-dark opacity-60">
                    <Signal size={12} />
                    <Wifi size={12} />
                    <Battery size={14} />
                  </div>
                </div>

                <div className="flex-1 min-h-0 z-10 relative bg-white flex items-center justify-center p-4">
                  <div className="w-full h-full relative">
                    <IncomeSankeyChart
                      data={sankeyData}
                      totalRevenue={1000000000000}
                    />
                  </div>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-200 rounded-full z-20"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 px-5 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-bold text-quasa-dark mb-4 tracking-tight"
          >
            데이터를 보는 가장 직관적인 경험
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-sm md:text-base text-quasa-gray font-normal mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            수치로만 존재하던 재무 지표를 실시간 흐름으로 재정의합니다.
            <br />
            어려운 투자를 쉬운 분석으로 바꾸는 QUASA의 기술력을 만나보세요.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <VisualCard
              variant="light"
              icon={
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute w-20 h-14 bg-blue-100 rounded-xl -rotate-12 border border-white shadow-lg flex flex-col p-2 gap-1.5">
                    <div className="w-1/2 h-1.5 bg-blue-400/20 rounded"></div>
                    <div className="w-full h-1.5 bg-blue-400/10 rounded"></div>
                  </div>
                  <div className="relative w-24 h-10 bg-white rounded-lg border border-blue-50 shadow-lg flex items-center justify-center font-bold text-[#0046FF] tracking-tight text-sm">
                    FINANCIAL
                  </div>
                </div>
              }
              title="공시 원문 요약"
              desc="수백 장의 사업보고서를 핵심 키워드로 시각화해요"
            />

            <VisualCard
              variant="dark"
              icon={
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-14 h-14 bg-[#0046FF] rounded-2xl rotate-45 flex items-center justify-center shadow-lg animate-pulse">
                    <TrendingUp className="text-white -rotate-45" size={24} />
                  </div>
                  <div className="absolute top-3 right-8 w-7 h-7 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
                    <Plus size={14} className="text-white" />
                  </div>
                </div>
              }
              title="실시간 주가 연동"
              desc="재무 지표와 주가의 상관관계를 실시간으로 분석해요"
            />

            <VisualCard
              variant="blue"
              icon={
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-12 h-24 bg-white/20 rounded-full border border-white/40 shadow-inner flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                      <BrainCircuit size={16} className="text-[#0046FF]" />
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-blue-300/40 border border-white/10 backdrop-blur-sm"></div>
                  </div>
                </div>
              }
              title="AI 퀀트 분석"
              desc="데이터에 기반한 객관적인 기업 등급을 산출해요"
            />

            <VisualCard
              variant="white"
              icon={
                <div className="relative w-full h-full flex items-center justify-center scale-110">
                  <div className="w-20 h-24 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden flex flex-col">
                    <div className="h-2 bg-gray-50 border-b border-gray-100 w-full"></div>
                    <div className="flex-1 p-2.5 flex items-end gap-1.5">
                      <div className="flex-1 bg-[#0046FF]/20 rounded-t h-[40%]"></div>
                      <div className="flex-1 bg-[#0046FF]/50 rounded-t h-[70%]"></div>
                      <div className="flex-1 bg-[#0046FF] rounded-t h-[100%]"></div>
                    </div>
                  </div>
                </div>
              }
              title="산업 리포트"
              desc="업종 내 주요 지표의 순위와 변화를 한눈에 봐요"
            />
          </div>
        </div>
      </section>

      {/* AI Insight Section */}
      <section className="py-20 px-5 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-blue-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3 block">
              ANALYSIS CORE
            </span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-bold text-quasa-dark mb-4 tracking-tight"
            >
              QUASA Intelligence
            </motion.h2>
            <p className="text-base md:text-lg text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed">
              복잡한 시장 데이터를 AI가 실시간으로 분석하여{" "}
              <br className="hidden md:block" />
              가장 명확하고 직관적인 투자 가이드를 제시합니다.
            </p>
          </div>

          <OutlookCard
            data={{
              analysis:
                "반도체 업황의 강력한 회복세와 HBM3E 공급 확대가 삼성전자의 실적 턴어라운드를 주도하고 있습니다.",
              positive_factor: [
                "HBM3E 등 고대역폭 메모리 시장 선점",
                "AI 가속기 시장 성장으로 인한 파운드리 수주 증가",
                "스마트폰 신제품 출시 및 폴더블폰 판매 호조",
                "DDR5 등 차세대 D램 가격 상승세 지속",
              ],
              risk_factor: [
                "글로벌 경기 침체 장기화 가능성",
                "미중 기술 갈등 심화에 따른 불확실성",
                "환율 변동성 확대 및 원자재 가격 상승 압력",
              ],
              opinion:
                "종합적인 AI 분석 결과, 삼성전자에 대한 '매수' 의견을 유지합니다.",
              target_price: 110000,
              current_price: 85000,
              previous_target_price: 100000,
              analyzed_at: "2025.12.24",
              analyst_rating: 4,
            }}
          />
        </div>
      </section>

      {/* Corporate Comparison Section */}
      <section className="py-40 px-6 bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center">
          <div className="flex-1 w-full">
            <ComparisonGrid
              onNavigate={() => setPage(PageView.COMPANY_COMPARE)}
            />
          </div>
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-bold text-quasa-dark mb-4 tracking-tight"
            >
              라이벌 기업들과
              <br />
              <span className="text-[#0046FF]">실시간 대조</span>
            </motion.h2>
            <p className="text-lg text-quasa-gray font-medium leading-relaxed mb-16">
              동종 업계 라이벌들의 재무 지표를 클릭 한 번으로 비교 분석하세요.
              <br />
              퀀트 기반의 상대적 가치 평가가 즉시 이루어집니다.
            </p>
            <div className="space-y-6">
              <ComparisonFeature
                number="01"
                text="기업별 매출액 및 주가 비교"
              />
              <ComparisonFeature
                number="02"
                text="기업별 이익성장성 대비 시장평가 비교"
              />
              <ComparisonFeature number="03" text="기업별 투자지표 비교" />
            </div>
          </div>
        </div>
      </section>

      {/* Final Slogan Section */}
      <section className="relative py-32 px-5 bg-[#191f28] text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <motion.div
            animate={{ y: [0, -30, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-[5%] p-6 bg-[#0046FF]/20 rounded-2xl border border-white/10 backdrop-blur-xl"
          >
            <BarChart3 size={48} className="text-blue-400" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 40, 0], rotate: [0, -15, 0], scale: [1, 0.9, 1] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-1/4 right-[8%] p-8 bg-indigo-500/20 rounded-3xl border border-white/10 backdrop-blur-xl"
          >
            <PieChart size={56} className="text-indigo-400" />
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-snug text-white">
              성공적인 투자는
              <br />
              <span className="text-[#0046FF]">분석</span>에서 시작됩니다.
            </h2>
            <button
              onClick={() => setPage(PageView.COMPANY_SEARCH)}
              className="group relative bg-[#0046FF] text-white text-base font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-all shadow-lg overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                대시보드로 이동하기{" "}
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-5 border-t border-gray-100 text-quasa-gray">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="max-w-sm text-left">
            <div className="text-xl font-bold text-quasa-dark mb-4">QUASA</div>
            <p className="text-sm font-medium leading-relaxed mb-2 text-quasa-dark">
              전자공시시스템 연동 프리미엄 기업 분석 플랫폼
            </p>
            <p className="text-xs font-normal text-gray-400">
              © {new Date().getFullYear()} QUASA Inc. All rights reserved.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-left">
            <FooterColumn
              title="서비스"
              links={["대시보드", "기업비교", "공시요약", "퀀트리포트"]}
            />
            <FooterColumn
              title="고객지원"
              links={["고객센터", "공지사항", "제휴문의", "이용가이드"]}
            />
            <FooterColumn
              title="법적고지"
              links={["이용약관", "개인정보처리방침", "책임의 한계"]}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-components
const FooterColumn: React.FC<{ title: string; links: string[] }> = ({
  title,
  links,
}) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-quasa-dark">{title}</h4>
    <div className="flex flex-col gap-2">
      {links.map((link) => (
        <a
          key={link}
          href="#"
          className="text-xs font-medium text-gray-400 hover:text-[#0046FF] transition-colors"
        >
          {link}
        </a>
      ))}
    </div>
  </div>
);

const ComparisonFeature: React.FC<{ number: string; text: string }> = ({
  number,
  text,
}) => (
  <div className="flex items-center gap-5 px-6 py-5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-lg">
    <span className="text-3xl font-black text-[#0046FF]">{number}</span>
    <span className="text-lg font-semibold text-quasa-dark">{text}</span>
  </div>
);

interface VisualCardProps {
  variant: "light" | "dark" | "blue" | "white";
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const VisualCard: React.FC<VisualCardProps> = ({
  variant,
  icon,
  title,
  desc,
}) => {
  const styles = {
    light: "bg-[#f2f4f6] text-[#020913e6]",
    dark: "bg-[#000000] text-white",
    blue: "bg-[#0046FF] text-white",
    white: "bg-white text-[#020913e6] border border-gray-100",
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      className={`flex flex-col h-[420px] rounded-[30px] overflow-hidden text-left transition-all duration-500 hover:shadow-xl group ${styles[variant]}`}
    >
      <div className="flex-1 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700 ease-out p-8">
        <div className="w-full h-full max-h-[140px]">{icon}</div>
      </div>
      <div className="flex flex-col px-8 pb-10">
        <span className="text-[24px] font-bold leading-[1.6] mb-3 tracking-tight">
          {title}
        </span>
        <span className="text-[16px] font-medium leading-[1.6] opacity-70">
          {desc}
        </span>
      </div>
    </motion.div>
  );
};

export default Dashboard;
