import React, { useState } from "react";
import Navbar from "../components/Layout/Navbar";
import { IncomeSankeyChart } from "../components/Charts/IncomeSankeyChart";
import ComparisonGrid from "../components/dash_data/ComparisonGrid";
import OutlookCard from "../components/dash_data/outlookCard";
import { motion } from "framer-motion";
import { PageView } from "../types";
import type { SankeyData } from "../types";

import CompanyCompare from "./CompanyCompare";
import CompanyDetail from "./CompanyDetail";
import CompanySearch from "./CompanySearch";
import IndustryCompare from "./IndustryCompare";
import Login from "./Login";
import SignUp from "./SignUp";

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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>(PageView.DASHBOARD);

  return (
    <div className="min-h-screen bg-white selection:bg-[#0046FF] selection:text-white">
      <Navbar currentPage={currentPage} setPage={setCurrentPage} />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-16 px-5 overflow-hidden bg-gradient-to-b from-[#f2f4f6] to-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-[#0046FF] font-semibold text-xs mb-6 border border-blue-100">
              <Zap size={12} fill="currentColor" />
              <span>QUASA Intelligence v2.5 정식 출시</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-quasa-dark leading-[1.15] mb-5 tracking-tight">
              기업을
              <br />
              <span className="text-[#0046FF]">분석</span>하다.
            </h1>
            <p className="text-base md:text-lg font-normal text-quasa-gray mb-10 leading-relaxed">
              전자공시시스템의 파편화된 데이터를 인공지능이 통합 분석합니다.{" "}
              <br className="hidden md:block" />
              복잡한 재무제표를 QUASA만의 인사이트로 재정의하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setCurrentPage(PageView.SIGNUP)}
                className="bg-[#0046FF] text-white text-sm font-semibold px-6 py-3.5 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
              >
                지금 시작하기 <ArrowRight size={16} />
              </button>
              <div className="relative group flex-1 max-w-xs">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0046FF] transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="기업명 검색"
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0046FF]/30 focus:ring-2 focus:ring-[#0046FF]/10 transition-all font-medium text-sm text-quasa-dark"
                />
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

            {/* Tablet Bezel (Black frame) */}
            <div className="relative z-10 bg-[#1c1c1e] p-3 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border-[1px] border-white/5 mx-auto max-w-[600px]">
              {/* Tablet Screen */}
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

                {/* Main Screen Content */}
                <div className="flex-1 min-h-0 z-10 relative bg-white flex items-center justify-center">
                  {/* 1. 내부 컨테이너의 높이를 90%로 제한하여 상하 베젤 여백 확보 
                      2. aspect-video(16:9) 비율을 강제하여 Sankey가 가장 예쁘게 그려지는 공간 생성
                    */}
                  <div className="w-[92%] h-[85%] relative flex items-center justify-center">
                    <div className="w-full h-full transform scale-[1.05] origin-center">
                      <IncomeSankeyChart
                        data={sankeyData}
                        totalRevenue={1000000000000}
                      />
                    </div>
                  </div>
                </div>
                {/* Home Indicator */}
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
            {/* 1. 공시 원문 요약 */}
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

            {/* 2. 실시간 주가 연동 */}
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

            {/* 3. AI 퀀트 분석 */}
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

            {/* 4. 산업 리포트 */}
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
        {" "}
        {/* 배경색을 gray-50으로 변경하여 컨텐츠가 더 돋보이게 합니다. */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-blue-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3 block">
              QUASA Intelligence
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6 tracking-tight">
              AI 기업 전망 분석
            </h2>
            <p className="text-base md:text-lg text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed">
              복잡한 시장 데이터를 AI가 실시간으로 분석하여{" "}
              <br className="hidden md:block" />
              가장 명확하고 직관적인 투자 가이드를 제시합니다.
            </p>
          </div>

          {/* 새로운 OutlookCard 컴포넌트 렌더링 (샘플 데이터) */}
          <OutlookCard
            data={{
              analysis:
                "반도체 업황의 강력한 회복세와 HBM3E 공급 확대가 삼성전자의 실적 턴어라운드를 주도하고 있습니다. 특히 AI 반도체 수요 폭증에 따른 파운드리 사업부의 성장 잠재력이 높게 평가됩니다.",
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
                "종합적인 AI 분석 결과, 삼성전자에 대한 '매수(Strong Buy)' 의견을 유지하며, 목표주가 상향 조정의 여지가 충분합니다. 장기적 관점에서 비중 확대를 추천합니다.",
              target_price: 110000,
              current_price: 85000,
              previous_target_price: 100000, // 이전 목표가 (변동성 표시용)
              analyzed_at: "2025.12.24",
              analyst_rating: 4, // 5점 만점에 4점
            }}
          />
        </div>
      </section>
      {/* Final Slogan & Enhanced CTA Section */}
      <section className="relative py-16 px-5 bg-[#191f28] text-white overflow-hidden">
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
            <p className="text-base md:text-lg text-gray-400 font-normal mb-10 leading-relaxed max-w-2xl mx-auto">
              이제 전문가의 시선을 당신의 손끝에.
              <br />
              대한민국 1위 전자공시 분석 플랫폼 QUASA와 함께하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setCurrentPage("signup" as PageView)}
                className="group relative bg-[#0046FF] text-white text-base font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-all shadow-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  무료로 시작하기{" "}
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-5 border-t border-gray-100 text-quasa-gray">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="max-w-sm text-left">
            <img
              src="/publish/logo.png"
              alt="Quasa Logo"
              className="h-8 w-auto mb-4 object-contain"
            />
            <p className="text-sm font-medium leading-relaxed mb-2 text-quasa-dark">
              전자공시시스템 연동 프리미엄 기업 분석 플랫폼
            </p>
            <p className="text-xs font-normal text-gray-400">
              금융위원회 정식 등록 데이터 서비스 사업자
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
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} QUASA Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-quasa-dark transition-colors">
              Instagram
            </a>
            <a href="#" className="hover:text-quasa-dark transition-colors">
              Youtube
            </a>
            <a href="#" className="hover:text-quasa-dark transition-colors">
              Blog
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

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

interface VisualCardProps {
  variant: "light" | "dark" | "blue" | "white";
  icon: React.ReactNode; // 다시 추가
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
      {/* 상단 아이콘 영역: 기존 그래픽 유지 */}
      <div className="flex-1 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700 ease-out p-8">
        <div className="w-full h-full max-h-[140px]">{icon}</div>
      </div>

      {/* 하단 텍스트 영역: 토스 스타일 적용 */}
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

export default App;
