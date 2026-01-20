import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getCompanyDetail,
  getStockOhlcv,
  getCompanyNews,
  getCompanyFinancials,
} from "../api/company";
import { getIndustryCompanies } from "../api/industry";
import GlassCard from "../components/Layout/GlassCard";
import StockChart from "../components/Charts/StockChart";
import CandleChart from "../components/Charts/CandleChart";

import type {
  NewsItem,
  PeerCompanyItem,
  FinancialData,
  FinancialMetric,
  CompanyApiData,
  PageView,
  OhlcvItem,
  CompanyFinancialsData,
} from "../types";

import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
  PieChart,
  Pie,
} from "recharts";
import { Star, User, X, HelpCircle, Loader2 } from "lucide-react";

interface DetailProps {
  setPage: (page: PageView) => void;
  starred: Set<string>;
  onToggleStar: (code: string) => void;
  companyCode?: string;
  setCompanyCode?: (code: string) => void;
}

const DEFAULT_COMPANY = {
  name: "-",
  price: "-",
  change: "-",
  marketCap: "-",
  ceo: "-",
  sales: "-",
  industry: "-",
  desc: "-",
  logo: "--",
};

// 데이터가 없을 때를 대비한 Mock Data 생성 함수
const generateFinancialData = (
  year: string,
  quarter: string,
): FinancialData => {
  const y = parseInt(year);
  const q = parseInt(quarter.replace("분기", ""));
  const baseRevenue = 8000 + (y - 2020) * 800 + q * 150;
  const baseOperating = 400 + (y - 2020) * 50 + q * 20;
  const baseNet = 300 + (y - 2020) * 40 + q * 15;

  const formatMoney = (val: number) => {
    const trillion = Math.floor(val / 10000);
    const billion = Math.floor(val % 10000);
    return trillion > 0
      ? `${trillion}조 ${billion.toLocaleString()}억원`
      : `${billion.toLocaleString()}억원`;
  };

  const formatLabel = (val: number) => {
    const trillion = Math.floor(val / 10000);
    const billion = Math.floor(val % 10000);
    return trillion > 0 ? `${trillion}조 ${billion}` : `${billion}억`;
  };

  const historyYears = [y - 3, y - 2, y - 1, y];

  return {
    business: [
      { name: "주력사업", value: 45, color: "#3B82F6" },
      { name: "신규사업", value: 25, color: "#10B981" },
      { name: "해외사업", value: 20, color: "#F59E0B" },
      { name: "기타", value: 10, color: "#94A3B8" },
    ],
    revenue: {
      current: formatMoney(baseRevenue),
      yoy: "15.0%",
      industryAvg: "-",
      history: historyYears.map((hy) => ({
        year: hy.toString(),
        value: 8000 + (hy - 2020) * 800,
        label: formatLabel(8000 + (hy - 2020) * 800),
      })),
    },
    operating: {
      current: formatMoney(baseOperating),
      yoy: "25.0%",
      industryAvg: "-",
      history: historyYears.map((hy) => ({
        year: hy.toString(),
        value: 400 + (hy - 2020) * 50,
        label: formatLabel(400 + (hy - 2020) * 50),
      })),
    },
    netIncome: {
      current: formatMoney(baseNet),
      yoy: "30.0%",
      industryAvg: "-",
      history: historyYears.map((hy) => ({
        year: hy.toString(),
        value: 300 + (hy - 2020) * 40,
        label: formatLabel(300 + (hy - 2020) * 40),
      })),
    },
  };
};

const CompanyDetail: React.FC<DetailProps> = ({
  setPage,
  starred,
  onToggleStar,
  companyCode: propCompanyCode = "005930",
  setCompanyCode,
}) => {
  const { id } = useParams<{ id: string }>();
  const companyCode = id ? id : propCompanyCode;

  const [activeTab, setActiveTab] = useState("info");
  const [chartRange, setChartRange] = useState("1D");
  const [selectedYear] = useState("2024");
  const [selectedQuarter] = useState("1분기");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const getBackendInterval = (range: string): string => {
    const mapping: Record<string, string> = {
      "1D": "1d",
      "1W": "1d",
      "3M": "1d",
      "1Y": "1d",
    };
    return mapping[range] || "1d";
  };

  // --- API 호출 ---
  const {
    data: apiCompanyData,
    isLoading: isDetailLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["company", "detail", companyCode],
    queryFn: async () => {
      const response = await getCompanyDetail(companyCode);
      return response.data.data as unknown as CompanyApiData;
    },
  });

  const { data: stockData = [], isLoading: isStockLoading } = useQuery({
    queryKey: ["company", "stock", companyCode, chartRange],
    queryFn: async () => {
      const response = await getStockOhlcv(
        companyCode,
        getBackendInterval(chartRange),
      );
      return response.data.data as unknown as OhlcvItem[];
    },
  });

  const { data: peerCompanies = [], isLoading: isPeerLoading } = useQuery({
    queryKey: ["industry", "peers", apiCompanyData?.industry?.induty_code],
    queryFn: async () => {
      const indutyCode = apiCompanyData?.industry?.induty_code;
      if (!indutyCode) return [];
      const response = await getIndustryCompanies(indutyCode);
      const companies = response?.data?.data?.companies || [];
      return companies.map((company: any, index: number) => ({
        rank: company.rank || index + 1,
        name: company.name,
        code: company.stockCode,
        price: "-",
        change: "-",
      })) as PeerCompanyItem[];
    },
    enabled: !!apiCompanyData?.industry?.induty_code,
  });

  const { data: companyNews = [], isLoading: isNewsLoading } = useQuery({
    queryKey: ["company", "news", companyCode],
    queryFn: async () => {
      const response = await getCompanyNews(companyCode);
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: financialsData, isLoading: isFinancialsLoading } = useQuery({
    queryKey: ["company", "financials", companyCode],
    queryFn: async () => {
      const response = await getCompanyFinancials(companyCode);
      return response.data.data as CompanyFinancialsData;
    },
  });

  const infoRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const financialRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentCompany = useMemo(() => {
    if (!apiCompanyData) return DEFAULT_COMPANY;
    return {
      name: apiCompanyData.company_name,
      price: "-",
      change: "-",
      marketCap: `${Math.floor(apiCompanyData.market_amount / 100000000).toLocaleString()}억`,
      ceo: apiCompanyData.ceo_name,
      sales: "-",
      industry: apiCompanyData.industry?.name || "-",
      desc: apiCompanyData.description,
      logo: apiCompanyData.company_name.substring(0, 2),
    };
  }, [apiCompanyData]);

  // --- 재무 데이터 가공 로직 (수정됨) ---
  const financialData = useMemo(() => {
    if (!financialsData?.financial_statements?.length) {
      return generateFinancialData(selectedYear, selectedQuarter);
    }

    const statements = financialsData.financial_statements;
    const sortedStatements = [...statements].sort(
      (a, b) => b.fiscal_year - a.fiscal_year,
    );
    const latestStatement = sortedStatements[0];
    const previousStatement = sortedStatements[1];

    const safeNum = (val: any) => (val ? Number(val) : 0);

    const formatMoney = (val: number) => {
      const v = safeNum(val);
      const trillion = Math.floor(v / 1_000_000_000_000);
      const billion = Math.floor((v % 1_000_000_000_000) / 100_000_000);
      return trillion > 0
        ? `${trillion}조 ${billion.toLocaleString()}억원`
        : `${billion.toLocaleString()}억원`;
    };

    const formatLabel = (val: number) => {
      const v = safeNum(val);
      const trillion = Math.floor(v / 1_000_000_000_000);
      const billion = Math.floor((v % 1_000_000_000_000) / 100_000_000);
      return trillion > 0 ? `${trillion}조 ${billion}` : `${billion}억`;
    };

    const calculateYoY = (current: number, previous: number | undefined) => {
      const curr = safeNum(current);
      const prev = safeNum(previous);
      if (prev === 0) return "-";
      const change = ((curr - prev) / Math.abs(prev)) * 100;
      return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    };

    const buildHistory = (
      key: "revenue" | "operating_profit" | "net_income",
    ) => {
      return sortedStatements
        .slice(0, 4)
        .reverse()
        .map((s) => ({
          year: s.fiscal_year.toString(),
          value: safeNum(s[key]) / 100_000_000,
          label: formatLabel(s[key]),
        }));
    };

    return {
      business: [
        { name: "주력사업", value: 45, color: "#3B82F6" },
        { name: "신규사업", value: 25, color: "#10B981" },
        { name: "해외사업", value: 20, color: "#F59E0B" },
        { name: "기타", value: 10, color: "#94A3B8" },
      ],
      revenue: {
        current: formatMoney(latestStatement.revenue),
        yoy: calculateYoY(latestStatement.revenue, previousStatement?.revenue),
        industryAvg: "-",
        history: buildHistory("revenue"),
      },
      operating: {
        current: formatMoney(latestStatement.operating_profit),
        yoy: calculateYoY(
          latestStatement.operating_profit,
          previousStatement?.operating_profit,
        ),
        industryAvg: "-",
        history: buildHistory("operating_profit"),
      },
      netIncome: {
        current: formatMoney(latestStatement.net_income),
        yoy: calculateYoY(
          latestStatement.net_income,
          previousStatement?.net_income,
        ),
        industryAvg: "-",
        history: buildHistory("net_income"),
      },
    } as FinancialData;
  }, [financialsData, selectedYear, selectedQuarter]);

  const handleTabClick = (
    id: string,
    ref: React.RefObject<HTMLDivElement | null>,
  ) => {
    setActiveTab(id);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCompanyClick = (code: string) => {
    if (setCompanyCode) {
      setCompanyCode(code);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const tabs = [
    { id: "info", label: "기업정보", ref: infoRef },
    { id: "price", label: "주가", ref: priceRef },
    { id: "financial", label: "재무분석", ref: financialRef },
    { id: "news", label: "뉴스", ref: newsRef },
  ];

  // --- 차트 렌더링 (높이 및 레이아웃 수정) ---
  const renderFinancialBarChart = (title: string, data: FinancialMetric) => {
    const yoyValue = parseFloat(data.yoy?.replace(/[+%]/g, "") || "0");
    const isPositive = yoyValue >= 0;
    const yoyColor =
      data.yoy === "-"
        ? "text-gray-500"
        : isPositive
          ? "text-red-500"
          : "text-blue-500";
    const yoyArrow = data.yoy === "-" ? "" : isPositive ? " ▲" : " ▼";

    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col h-full shadow-sm">
        <div className="flex items-center gap-1 mb-4">
          <h4 className="font-bold text-slate-800 text-lg">{title}</h4>
          <HelpCircle size={14} className="text-gray-300 cursor-help" />
        </div>
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-50">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              {financialsData?.financial_statements?.[0]?.fiscal_year ||
                selectedYear}
              년 {title}
            </div>
            <div className="text-xl font-bold text-slate-800">
              {data.current}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">작년 대비</div>
            <div className={`text-sm font-bold ${yoyColor}`}>
              {data.yoy}
              {yoyArrow}
            </div>
          </div>
        </div>
        {/* Recharts 에러 해결을 위해 부모 div에 명시적 높이(h-48) 부여 */}
        <div className="w-full h-48 mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.history}
              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            >
              <XAxis
                dataKey="year"
                axisLine={true}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                dy={5}
                stroke="#E5E7EB"
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                <LabelList
                  dataKey="label"
                  position="top"
                  fill="#64748B"
                  fontSize={10}
                  fontWeight={500}
                  offset={8}
                />
                {data.history.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === data.history.length - 1 ? "#3B82F6" : "#E5E7EB"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderBusinessChart = () => {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col h-full shadow-sm">
        <div className="flex items-center gap-1 mb-4">
          <h4 className="font-bold text-slate-800 text-lg">사업분석</h4>
          <HelpCircle size={14} className="text-gray-300 cursor-help" />
        </div>
        <div className="flex-1 flex items-center min-h-[180px]">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={financialData.business}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  dataKey="value"
                  stroke="none"
                >
                  {financialData.business.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-2">
            {financialData.business.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 truncate max-w-[80px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isDetailLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <p>데이터를 불러오는데 실패했습니다.</p>
        <p className="text-sm text-gray-500">{(error as Error)?.message}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12">
      {/* 상단 헤더 섹션 */}
      <div className="mb-6 sticky top-14 z-40 bg-white/95 backdrop-blur-md -mx-4 px-4 border-b border-gray-100/50 shadow-sm">
        <div
          className={`flex items-center gap-4 pt-4 transition-all duration-300 overflow-hidden ${isScrolled ? "max-h-0 opacity-0 pt-0 mb-0" : "max-h-24 opacity-100 mb-4"}`}
        >
          <div
            className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center cursor-pointer"
            onClick={() => setPage("DASHBOARD" as PageView)}
          >
            <span className="font-bold text-blue-600 text-2xl">
              {currentCompany.logo}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              {currentCompany.name}
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                {companyCode}
              </span>
            </h1>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => onToggleStar(companyCode)}
              className={`p-2.5 rounded-xl bg-white border transition-colors shadow-sm ${(starred?.has(companyCode) ?? false) ? "border-yellow-500 text-yellow-500 bg-yellow-50" : "border-gray-200 text-gray-500 hover:text-yellow-500"}`}
            >
              <Star
                size={20}
                fill={
                  (starred?.has(companyCode) ?? false) ? "currentColor" : "none"
                }
              />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.ref)}
              className={`px-6 py-3 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div ref={infoRef} className="scroll-mt-32">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-100 pb-3">
              기업정보
            </h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">산업</span>
                <span className="font-bold text-slate-800 text-sm">
                  {currentCompany.industry}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">대표자</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  <User size={14} /> {currentCompany.ceo}
                </span>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-gray-500 text-xs">주요사업</span>
                <span className="font-bold text-slate-800 text-sm leading-relaxed">
                  {currentCompany.desc}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8" ref={priceRef}>
            <GlassCard className="p-6 h-full flex flex-col min-h-[450px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">주가 분석</h3>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  {["1D", "1W", "3M", "1Y"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartRange(p)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold ${chartRange === p ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full h-full">
                {isStockLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin text-blue-400" />
                  </div>
                ) : chartRange === "1D" ? (
                  <CandleChart {...({ data: stockData } as any)} />
                ) : (
                  <StockChart
                    {...({ data: stockData, period: chartRange } as any)}
                  />
                )}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-4">
            <GlassCard className="p-6 h-full flex flex-col">
              <h3 className="font-bold text-slate-800 mb-4">동종업계 순위</h3>
              {isPeerLoading ? (
                <div className="flex justify-center items-center flex-1">
                  <Loader2 className="animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1">
                  {peerCompanies.map((item) => (
                    <div
                      key={item.code}
                      onClick={() => handleCompanyClick(item.code)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${currentCompany.name === item.name ? "bg-blue-50 border-blue-200" : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"}`}
                    >
                      <span className="text-sm font-bold text-slate-700">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400">{item.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        <div ref={financialRef} className="scroll-mt-32">
          <GlassCard className="p-6 bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              재무 데이터 분석
            </h3>
            {isFinancialsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderBusinessChart()}
                  {renderFinancialBarChart("매출액", financialData.revenue)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFinancialBarChart("영업이익", financialData.operating)}
                  {renderFinancialBarChart(
                    "당기순이익",
                    financialData.netIncome,
                  )}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        <div ref={newsRef} className="scroll-mt-32">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">기업 뉴스</h3>
            {isNewsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companyNews.slice(0, 4).map((news, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedNews(news)}
                    className="p-4 border border-gray-100 rounded-xl hover:bg-white hover:shadow-md hover:border-blue-100 transition-all cursor-pointer"
                  >
                    <h4 className="font-bold text-slate-800 line-clamp-1 mb-2">
                      {news.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {news.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* 뉴스 상세 모달 */}
      {selectedNews && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedNews(null)}
          ></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl z-10 p-8 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                News Detail
              </span>
              <button
                onClick={() => setSelectedNews(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              {selectedNews.title}
            </h2>
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {selectedNews.content || selectedNews.summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetail;
