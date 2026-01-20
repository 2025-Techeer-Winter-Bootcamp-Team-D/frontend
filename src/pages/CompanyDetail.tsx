import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getCompanyDetail,
  getStockOhlcv,
  getCompanyNews,
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
} from "../types";

import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
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
    business: [{ name: "기타", value: 10, color: "#94A3B8" }],
    revenue: {
      current: formatMoney(baseRevenue),
      yoy: "15.0%",
      industryAvg: "2000%",
      history: historyYears.map((hy) => ({
        year: hy.toString(),
        value: 8000 + (hy - 2020) * 800,
        label: formatLabel(8000 + (hy - 2020) * 800),
      })),
    },
    operating: {
      current: formatMoney(baseOperating),
      yoy: "25.0%",
      industryAvg: "2058%",
      history: historyYears.map((hy) => ({
        year: hy.toString(),
        value: 400 + (hy - 2020) * 50,
        label: formatLabel(400 + (hy - 2020) * 50),
      })),
    },
    netIncome: {
      current: formatMoney(baseNet),
      yoy: "30.0%",
      industryAvg: "909%",
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
  companyCode: propCompanyCode = "055550",
  setCompanyCode,
}) => {
  const { id } = useParams<{ id: string }>();
  const companyCode = id || propCompanyCode;

  const [activeTab, setActiveTab] = useState("info");
  const [chartRange, setChartRange] = useState("1D");
  const [selectedYear] = useState("2024");
  const [selectedQuarter] = useState("1분기");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // 프론트엔드 시간 범위를 백엔드 interval로 매핑
  const getBackendInterval = (range: string): string => {
    const mapping: Record<string, string> = {
      "1D": "1d",
      "1W": "1d",
      "3M": "1d",
      "1Y": "1d",
    };
    return mapping[range] || "1d";
  };

  // --- API Fetching (수정된 섹션) ---

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
      console.log("industry data:", apiCompanyData?.industry);
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

  const financialData = useMemo(
    () => generateFinancialData(selectedYear, selectedQuarter),
    [selectedYear, selectedQuarter],
  );

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

  const renderFinancialBarChart = (title: string, data: FinancialMetric) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col h-full">
      <div className="flex items-center gap-1 mb-4">
        <h4 className="font-bold text-slate-800 text-lg">{title}</h4>
        <HelpCircle size={14} className="text-gray-300 cursor-help" />
      </div>
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-50">
        <div>
          <div className="text-xs text-gray-500 mb-1">
            {selectedYear}년 {selectedQuarter} {title}
          </div>
          <div className="text-xl font-bold text-slate-800">{data.current}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">작년 대비</div>
          <div className="text-sm font-bold text-red-500">{data.yoy} ▲</div>
        </div>
      </div>
      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.history}>
            <XAxis
              dataKey="year"
              axisLine={true}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94A3B8" }}
              dy={5}
              stroke="#E5E7EB"
            />
            <LabelList
              dataKey="label"
              position="top"
              fill="#64748B"
              fontSize={11}
              fontWeight={500}
              offset={10}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
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
                <span className="font-bold text-slate-800 text-sm">
                  {currentCompany.desc}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8" ref={priceRef}>
            <GlassCard className="p-6 h-full flex flex-col">
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
              <div className="flex-1 min-h-[300px]">
                {isStockLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin" />
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
            <GlassCard className="p-6 h-full">
              <h3 className="font-bold text-slate-800 mb-4">동종업계 순위</h3>
              {isPeerLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[300px]">
                  {peerCompanies.map((item) => (
                    <div
                      key={item.code}
                      onClick={() => handleCompanyClick(item.code)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${currentCompany.name === item.name ? "bg-blue-50 border-blue-200" : "bg-white border-transparent hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-700">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        <div ref={financialRef} className="scroll-mt-32">
          <GlassCard className="p-6 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              재무 데이터
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderFinancialBarChart("매출액", financialData.revenue)}
              {renderFinancialBarChart("영업이익", financialData.operating)}
            </div>
          </GlassCard>
        </div>

        <div ref={newsRef} className="scroll-mt-32">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">기업 뉴스</h3>
            {isNewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companyNews.slice(0, 4).map((news, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedNews(news)}
                    className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    <h4 className="font-bold text-slate-800 line-clamp-1">
                      {news.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-2">
                      {news.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {selectedNews && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedNews(null)}
          ></div>
          <div className="bg-white w-full max-w-2xl rounded-lg z-10 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">뉴스 상세</h3>
              <X
                className="cursor-pointer"
                onClick={() => setSelectedNews(null)}
              />
            </div>
            <h2 className="text-xl font-bold mb-4">{selectedNews.title}</h2>
            <p className="text-slate-600 leading-relaxed">
              {selectedNews.content || selectedNews.summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetail;
