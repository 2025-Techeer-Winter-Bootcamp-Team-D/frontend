import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import {
  getCompanyDetail,
  getStockOhlcv,
  getCompanyNews,
} from "../api/company";
import { getIndustryCompanies } from "../api/industry";
import GlassCard from "../components/Layout/GlassCard";
import StockChart from "../components/Charts/StockChart";
import CandleChart from "../components/Charts/CandleChart";
import { IncomeSankeyChart } from "../components/Charts/IncomeSankeyChart";
import { ExpenseRanking } from "../components/Ranking/ExpenseRanking";
import type {
  SankeyData,
  ExpenseItem,
  OhlcvItem,
  PeerCompanyItem,
  FinancialData,
  FinancialMetric,
  NewsItem,
  CompanyApiData,
} from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LabelList,
} from "recharts";
import {
  Star,
  TrendingUp,
  DollarSign,
  ChevronDown,
  Globe,
  MapPin,
  User,
  Quote,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
  BarChart3,
  HelpCircle,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { PageView } from "../types";

interface DetailProps {
  setPage: (page: PageView) => void;
  starred: Set<string>;
  onToggleStar: (code: string) => void;
  companyCode?: string;
  setCompanyCode?: (code: string) => void;
}

const PIE_COLORS = ["#3B82F6", "#EF4444", "#F59E0B", "#10B981", "#94A3B8"];

// 기본 회사 데이터 (API 로딩 전 또는 실패 시 사용)
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

// Helper to generate dynamic financial data
const generateFinancialData = (
  year: string,
  quarter: string,
): FinancialData => {
  const y = parseInt(year);
  const q = parseInt(quarter.replace("분기", ""));

  // Deterministic random-like values based on inputs
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

  // Generate history for the chart (Ending at selected year)
  const historyYears = [y - 3, y - 2, y - 1, y];

  return {
    business: [
      { name: "도금재", value: 34 + (q % 2), color: "#3B82F6" },
      { name: "Bonding Wire", value: 24 - (q % 2), color: "#EF4444" },
      { name: "접점", value: 16, color: "#F59E0B" },
      { name: "증착재", value: 16, color: "#10B981" },
      { name: "기타", value: 10, color: "#94A3B8" },
    ],
    revenue: {
      current: formatMoney(baseRevenue),
      yoy: `${(15 + q * 2).toFixed(1)}%`,
      industryAvg: `${(2000 + q * 50).toFixed(0)}%`,
      history: historyYears.map((hy) => ({
        year: hy.toString(),
        value: 8000 + (hy - 2020) * 800,
        label: formatLabel(8000 + (hy - 2020) * 800),
      })),
    },
    operating: {
      current: formatMoney(baseOperating),
      yoy: `${(25 + q * 5).toFixed(1)}%`,
      industryAvg: "2058%",
      history: historyYears.map((hy) => ({
        year: hy.toString(),
        value: 400 + (hy - 2020) * 50,
        label: formatLabel(400 + (hy - 2020) * 50),
      })),
    },
    netIncome: {
      current: formatMoney(baseNet),
      yoy: `${(30 + q * 3).toFixed(1)}%`,
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
  // URL 파라미터에서 id 가져오기
  const { id } = useParams<{ id: string }>();

  // URL 파라미터가 있으면 우선 사용, 없으면 props 사용
  const companyCode = id || propCompanyCode;

  // API에서 가져온 기업 데이터
  const [apiCompanyData, setApiCompanyData] = useState<CompanyApiData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // 주가 데이터
  const [stockData, setStockData] = useState<OhlcvItem[]>([]);
  const [isStockLoading, setIsStockLoading] = useState(false);

  // 동종업계 순위 데이터
  const [peerCompanies, setPeerCompanies] = useState<PeerCompanyItem[]>([]);
  const [isPeerLoading, setIsPeerLoading] = useState(false);

  // 뉴스 데이터
  const [companyNews, setCompanyNews] = useState<NewsItem[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);

  // 기업 정보 API 호출
  const fetchCompanyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getCompanyDetail(companyCode);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = response.data as any;
      if (responseData?.data) {
        setApiCompanyData(responseData.data);
      }
    } catch (error) {
      console.error("기업 정보 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [companyCode]);

  // 주가 데이터 API 호출
  const fetchStockData = useCallback(
    async (interval: string) => {
      try {
        setIsStockLoading(true);
        const response = await getStockOhlcv(companyCode, interval);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = response.data as any;
        if (responseData?.data) {
          setStockData(responseData.data);
        }
      } catch (error) {
        console.error("주가 데이터 조회 실패:", error);
      } finally {
        setIsStockLoading(false);
      }
    },
    [companyCode],
  );

  // 동종업계 순위 API 호출
  const fetchPeerCompanies = useCallback(async (industryId: number) => {
    try {
      setIsPeerLoading(true);
      const response = await getIndustryCompanies(industryId);
      if (response?.data?.companies) {
        const peers = response.data.companies.map(
          (
            company: {
              stockCode: string;
              name: string;
              rank: number;
              marketCap: number;
            },
            index: number,
          ) => ({
            rank: company.rank || index + 1,
            name: company.name,
            code: company.stockCode,
            price: "-",
            change: "-",
          }),
        );
        setPeerCompanies(peers);
      }
    } catch (error) {
      console.error("동종업계 순위 조회 실패:", error);
    } finally {
      setIsPeerLoading(false);
    }
  }, []);

  // 뉴스 데이터 API 호출
  const fetchCompanyNews = useCallback(async () => {
    try {
      setIsNewsLoading(true);
      const response = await getCompanyNews(companyCode);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = response.data as any;
      if (responseData?.data) {
        setCompanyNews(responseData.data);
      }
    } catch (error) {
      console.error("뉴스 데이터 조회 실패:", error);
    } finally {
      setIsNewsLoading(false);
    }
  }, [companyCode]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  // 뉴스 데이터 초기 로드
  useEffect(() => {
    fetchCompanyNews();
  }, [fetchCompanyNews]);

  // 기업 정보 로드 후 동종업계 순위 조회
  useEffect(() => {
    if (apiCompanyData?.industry?.industry_id) {
      fetchPeerCompanies(apiCompanyData.industry.industry_id);
    }
  }, [apiCompanyData, fetchPeerCompanies]);

  const [activeTab, setActiveTab] = useState("info");
  const [chartRange, setChartRange] = useState("1D");

  // chartRange 변경 시 주가 데이터 재로드
  useEffect(() => {
    fetchStockData(chartRange);
  }, [chartRange, fetchStockData]);

  // Year & Quarter State
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedQuarter, setSelectedQuarter] = useState("1분기");
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isQuarterOpen, setIsQuarterOpen] = useState(false);

  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // News Carousel State
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Scroll state for hiding header info
  const [isScrolled, setIsScrolled] = useState(false);

  // Disclosure Tab State
  const [disclosureTab, setDisclosureTab] = useState("주요공시");

  // Refs for Scroll-to-Section
  const infoRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const financialRef = useRef<HTMLDivElement>(null);
  const sankeyRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const disclosureRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tab Configuration
  const tabs = [
    { id: "info", label: "기업정보", ref: infoRef },
    { id: "price", label: "주가", ref: priceRef },
    { id: "financial", label: "재무분석", ref: financialRef },
    { id: "sankey", label: "손익흐름도", ref: sankeyRef },
    { id: "ai", label: "AI 전망 분석", ref: aiRef },
    { id: "news", label: "뉴스", ref: newsRef },
    { id: "disclosure", label: "전자공시", ref: disclosureRef },
  ];

  const handleTabClick = (
    id: string,
    ref: React.RefObject<HTMLDivElement | null>,
  ) => {
    setActiveTab(id);
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Carousel Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoPlay) {
      interval = setInterval(() => {
        nextNews();
      }, 5000); // 5 seconds auto slide
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, currentNewsIndex]);

  const nextNews = () => {
    setCurrentNewsIndex(
      (prev) => (prev + 1) % Math.ceil(companyNews.length / 2),
    );
  };

  const prevNews = () => {
    setCurrentNewsIndex((prev) =>
      prev === 0 ? Math.ceil(companyNews.length / 2) - 1 : prev - 1,
    );
  };

  const handleCompanyClick = (code: string) => {
    if (setCompanyCode) {
      setCompanyCode(code);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // API 데이터가 있으면 변환하여 사용, 없으면 기본값
  const currentCompany = apiCompanyData
    ? {
        name: apiCompanyData.company_name,
        price: "-", // 주가는 별도 API에서 가져와야 함
        change: "-",
        marketCap: `${Math.floor(apiCompanyData.market_amount / 100000000).toLocaleString()}억`,
        ceo: apiCompanyData.ceo_name,
        sales: "-",
        industry: apiCompanyData.industry.name,
        desc: apiCompanyData.description,
        logo: apiCompanyData.company_name.substring(0, 2),
      }
    : DEFAULT_COMPANY;

  const COMPANY_CODE = companyCode;
  const COMPANY_URL = apiCompanyData?.homepage_url || "";

  const isStarred = starred.has(COMPANY_CODE);

  // Memoize Dynamic Financial Data
  const financialData = useMemo(() => {
    return generateFinancialData(selectedYear, selectedQuarter);
  }, [selectedYear, selectedQuarter]);

  // Sankey Chart Data
  const totalRevenue = 31000000000000; // 31조

  const sankeyData: SankeyData = useMemo(() => {
    // 매출 원천 (수익이 어디서 들어왔는지)
    const interestIncome = 17000000000000; // 이자이익 17조 (55%)
    const feeIncome = 6000000000000; // 수수료이익 6조 (19%)
    const tradingIncome = 5000000000000; // 유가증권이익 5조 (16%)
    const otherIncome = 3000000000000; // 기타이익 3조 (10%)

    // 비용 및 이익
    const profit = 4500000000000; // 4.5조
    const cogs = 18000000000000; // 18조
    const opex = 6000000000000; // 6조
    const interestTax = 2500000000000; // 2.5조

    return {
      nodes: [
        // 매출 원천 (왼쪽)
        //types.ts/SankeyNode
        {
          id: "interest_income",
          name: "이자이익",
          color: "#3B82F6",
          category: "Revenue" as const,
        },
        {
          id: "fee_income",
          name: "수수료이익",
          color: "#06B6D4",
          category: "Revenue" as const,
        },
        {
          id: "trading_income",
          name: "유가증권이익",
          color: "#8B5CF6",
          category: "Revenue" as const,
        },
        {
          id: "other_income",
          name: "기타이익",
          color: "#94A3B8",
          category: "Revenue" as const,
        },
        // 중앙 Hub
        {
          id: "hub",
          name: "총매출",
          color: "#0046FF",
          category: "Hub" as const,
        },
        // 비용 및 이익 (오른쪽)
        {
          id: "cogs",
          name: "매출원가",
          color: "#EF4444",
          category: "Expense" as const,
        },
        {
          id: "opex",
          name: "판관비",
          color: "#F59E0B",
          category: "Expense" as const,
        },
        {
          id: "interest_expense",
          name: "이자/세금",
          color: "#EC4899",
          category: "Expense" as const,
        },
        {
          id: "profit",
          name: "순이익",
          color: "#10B981",
          category: "Profit" as const,
        },
      ],
      links: [
        // 매출 원천 → Hub
        { source: "interest_income", target: "hub", value: interestIncome },
        { source: "fee_income", target: "hub", value: feeIncome },
        { source: "trading_income", target: "hub", value: tradingIncome },
        { source: "other_income", target: "hub", value: otherIncome },
        // Hub → 비용/이익
        { source: "hub", target: "cogs", value: cogs },
        { source: "hub", target: "opex", value: opex },
        { source: "hub", target: "interest_expense", value: interestTax },
        { source: "hub", target: "profit", value: profit },
      ],
    };
  }, []);

  // Expense Ranking Data
  const expenseData: ExpenseItem[] = useMemo(() => {
    const cogs = 18000000000000; // 18조
    const opex = 6000000000000; // 6조
    const interestTax = 2500000000000; // 2.5조

    return [
      {
        name: "매출원가",
        amount: cogs,
        percentage: (cogs / totalRevenue) * 100,
        category: "COGS" as const,
      },
      {
        name: "판매비와관리비",
        amount: opex,
        percentage: (opex / totalRevenue) * 100,
        category: "OpEx" as const,
      },
      {
        name: "이자비용",
        amount: interestTax * 0.6, // 이자비용 60%
        percentage: ((interestTax * 0.6) / totalRevenue) * 100,
        category: "Interest/Tax" as const,
      },
      {
        name: "법인세비용",
        amount: interestTax * 0.4, // 법인세 40%
        percentage: ((interestTax * 0.4) / totalRevenue) * 100,
        category: "Interest/Tax" as const,
      },
    ];
  }, []);

  // Helper to map quarter string to month string for display (e.g., '1분기' -> '03')
  const getQuarterMonth = (q: string) => {
    const map: Record<string, string> = {
      "1분기": "03",
      "2분기": "06",
      "3분기": "09",
      "4분기": "12",
    };
    return map[q] || "12";
  };

  // Helper for rendering Financial Bar Charts
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
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">업계평균 대비</div>
          <div className="text-sm font-bold text-red-500">
            {data.industryAvg} ▲
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            key={`${selectedYear}-${selectedQuarter}-${title}`}
            data={data.history}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
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
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              barSize={32}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.history.map((entry, index) => (
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
      <div className="text-right mt-2 text-[10px] text-gray-400">
        {selectedYear}.{getQuarterMonth(selectedQuarter)} 기준
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in pb-12">
      {/* 로딩 상태 UI */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="animate-spin text-shinhan-blue" />
            <p className="text-slate-500">기업 정보를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6 sticky top-14 z-40 bg-white/95 backdrop-blur-md -mx-4 px-4 border-b border-gray-100/50 shadow-sm">
        {/* Company Info - Hidden when scrolled */}
        <div
          className={`flex items-center gap-4 pt-4 transition-all duration-300 overflow-hidden ${isScrolled ? "max-h-0 opacity-0 pt-0 mb-0" : "max-h-24 opacity-100 mb-4"}`}
        >
          <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center">
            <span className="font-bold text-shinhan-blue text-2xl">
              {currentCompany.logo}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              {currentCompany.name}
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                {COMPANY_CODE}
              </span>
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className="font-medium text-slate-700">
                {currentCompany.industry}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>KOSPI</span>
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => onToggleStar(COMPANY_CODE)}
              className={`p-2.5 rounded-xl bg-white border transition-colors shadow-sm ${isStarred ? "border-shinhan-gold text-shinhan-gold bg-yellow-50" : "border-gray-200 text-gray-500 hover:text-shinhan-gold hover:border-shinhan-gold"}`}
            >
              <Star size={20} fill={isStarred ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => window.open(COMPANY_URL, "_blank")}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-shinhan-blue hover:border-shinhan-blue transition-colors shadow-sm"
              title="기업 웹사이트 이동"
            >
              <Globe size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.ref)}
              className={`px-6 py-3 text-sm font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-shinhan-blue"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-shinhan-blue"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. Corporate Info Grid (Full Width) */}
        <div ref={infoRef} className="scroll-mt-32">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-100 pb-3">
              기업정보
            </h3>
            {/* Changed to 2 columns to satisfy user request */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">산업</span>
                <span className="font-bold text-slate-800 text-sm">
                  {currentCompany.industry}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">사원수</span>
                <span className="font-bold text-slate-800 text-sm">
                  150명 (지주사 기준)
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">기업구분</span>
                <span className="font-bold text-slate-800 text-sm">
                  KOSPI 상장
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">설립일</span>
                <span className="font-bold text-slate-800 text-sm">
                  2001.09.01
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">자본금</span>
                <span className="font-bold text-slate-800 text-sm">
                  2조 5,000억원
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">매출액</span>
                <span className="font-bold text-slate-800 text-sm">
                  {currentCompany.sales}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">대표자</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  <User size={14} /> {currentCompany.ceo}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">대표전화</span>
                <span className="font-bold text-slate-800 text-sm">
                  02-6360-3000
                </span>
              </div>
              {/* Reordered items: Homepage & Address move up, Desc moves down */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">홈페이지</span>
                <a
                  href={COMPANY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-shinhan-blue text-sm hover:underline flex items-center gap-1"
                >
                  <Globe size={14} /> shinhanFG.com
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">주소</span>
                <span className="font-bold text-slate-800 text-sm truncate flex items-center gap-1">
                  <MapPin size={14} /> 서울 중구 세종대로 9길 20
                </span>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-gray-500 text-xs">주요사업</span>
                <span className="font-bold text-slate-800 text-sm">
                  {currentCompany.desc}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Grid for Price & Peer Ranking (Side-by-side) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Price Chart (Left 8) */}
          <div className="lg:col-span-8" ref={priceRef}>
            <GlassCard className="p-6 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    주가
                  </h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-slate-900">
                      {currentCompany.price}
                      <span className="text-xl text-gray-500 font-normal ml-1">
                        원
                      </span>
                    </span>
                    <span
                      className={`font-bold bg-opacity-10 px-2 py-0.5 rounded text-sm flex items-center gap-1 ${currentCompany.change.startsWith("+") ? "text-red-500 bg-red-50" : "text-blue-500 bg-blue-50"}`}
                    >
                      <TrendingUp size={14} /> {currentCompany.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    오늘 15:30 기준 · 장마감
                  </p>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  {["1D", "1W", "3M", "1Y", "All"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartRange(p)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                        chartRange === p
                          ? "bg-white text-shinhan-blue shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-h-[300px] w-full bg-slate-50/30 rounded-lg border border-slate-100/50 p-2">
                {chartRange === "1D" ? (
                  <CandleChart />
                ) : (
                  <StockChart period={chartRange} />
                )}
              </div>
            </GlassCard>
          </div>

          {/* Peer Ranking (Right 4) - Matched Height */}
          <div className="lg:col-span-4" ref={peerRef}>
            <GlassCard className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">동종업계 순위</h3>
                <span className="text-xs font-bold text-shinhan-blue bg-blue-50 px-2 py-1 rounded">
                  {currentCompany.industry || "-"}
                </span>
              </div>

              {/* 로딩 상태 */}
              {isPeerLoading ? (
                <div className="flex items-center justify-center flex-1">
                  <Loader2
                    size={24}
                    className="animate-spin text-shinhan-blue"
                  />
                </div>
              ) : (
                <>
                  {/* Compact Medal Graphic */}
                  <div className="flex justify-center mb-6 gap-4 items-end shrink-0">
                    {/* 2등 - 은메달 */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 via-gray-100 to-slate-400 flex items-center justify-center text-slate-700 font-bold border-2 border-white/60 shadow-lg mb-1 relative top-2 backdrop-blur-sm ring-2 ring-slate-300/50">
                        2
                      </div>
                      <div className="h-12 w-10 bg-gradient-to-b from-slate-300/80 to-slate-200/40 rounded-t-lg backdrop-blur-sm border border-white/30"></div>
                      <span className="text-[10px] font-bold mt-1 text-slate-700">
                        {peerCompanies[1]?.name || "-"}
                      </span>
                    </div>
                    {/* 1등 - 금메달 */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 flex items-center justify-center text-white text-lg font-bold border-2 border-white/60 shadow-xl mb-1 backdrop-blur-sm ring-2 ring-yellow-400/50">
                        1
                      </div>
                      <div className="h-20 w-14 bg-gradient-to-b from-yellow-400/80 via-amber-400/60 to-yellow-200/30 rounded-t-lg backdrop-blur-sm border border-white/30"></div>
                      <span className="text-[10px] font-bold mt-1 text-amber-600">
                        {peerCompanies[0]?.name || "-"}
                      </span>
                    </div>
                    {/* 3등 - 동메달 */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 via-amber-400 to-orange-500 flex items-center justify-center text-white font-bold border-2 border-white/60 shadow-lg mb-1 relative top-4 backdrop-blur-sm ring-2 ring-orange-400/50">
                        3
                      </div>
                      <div className="h-8 w-10 bg-gradient-to-b from-orange-400/80 to-orange-200/40 rounded-t-lg backdrop-blur-sm border border-white/30"></div>
                      <span className="text-[10px] font-bold mt-1 text-orange-700">
                        {peerCompanies[2]?.name || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                    {peerCompanies.map((item) => (
                      <div
                        key={item.name}
                        onClick={() => handleCompanyClick(item.code)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                          currentCompany.name === item.name
                            ? "bg-blue-50 border-blue-200 shadow-sm"
                            : "bg-white border-transparent hover:bg-gray-50 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-bold w-4 ${item.rank === 1 ? "text-shinhan-blue" : "text-gray-400"}`}
                          >
                            {item.rank}
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {item.name}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium ${item.change.startsWith("+") ? "text-red-500" : "text-blue-500"}`}
                        >
                          {item.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </GlassCard>
          </div>
        </div>

        {/* 3. Financial Analysis (Full Width Grid) */}
        <div ref={financialRef} className="scroll-mt-32">
          <GlassCard className="p-6 bg-slate-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">재무분석</h3>
              <div className="flex gap-2">
                {/* Year Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsYearOpen(!isYearOpen)}
                    className="bg-white border border-gray-200 text-slate-700 font-bold text-xs rounded-lg px-3 py-2 outline-none shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    {selectedYear}년{" "}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isYearOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isYearOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsYearOpen(false)}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-24 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-20 animate-fade-in-up">
                        {["2024", "2023", "2022", "2021"].map((year) => (
                          <button
                            key={year}
                            onClick={() => {
                              setSelectedYear(year);
                              setIsYearOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-blue-50 hover:text-shinhan-blue transition-colors ${selectedYear === year ? "text-shinhan-blue bg-blue-50" : "text-gray-600"}`}
                          >
                            {year}년
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Quarter Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsQuarterOpen(!isQuarterOpen)}
                    className="bg-white border border-shinhan-blue text-shinhan-blue font-bold text-xs rounded-lg px-3 py-2 outline-none shadow-sm flex items-center gap-2 hover:bg-blue-50 transition-colors"
                  >
                    {selectedQuarter}{" "}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isQuarterOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isQuarterOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsQuarterOpen(false)}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-24 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-20 animate-fade-in-up">
                        {["1분기", "2분기", "3분기", "4분기"].map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setSelectedQuarter(q);
                              setIsQuarterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-blue-50 hover:text-shinhan-blue transition-colors ${selectedQuarter === q ? "text-shinhan-blue bg-blue-50" : "text-gray-600"}`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Business Analysis (Pie) */}
              <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col h-full">
                <div className="flex items-center gap-1 mb-4">
                  <h4 className="font-bold text-slate-800 text-lg">사업분석</h4>
                  <HelpCircle size={14} className="text-gray-300 cursor-help" />
                </div>

                <div className="flex-1 flex items-center">
                  <div className="w-1/2 h-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart key={`${selectedYear}-${selectedQuarter}-pie`}>
                        <Pie
                          data={financialData.business}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {financialData.business.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              strokeWidth={0}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 pl-4 space-y-3">
                    {financialData.business.map((item, idx) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-shinhan-blue w-2">
                            {idx + 1}
                          </span>
                          <span
                            className={`font-bold ${idx < 3 ? "text-xl" : "text-sm text-gray-400"} text-shinhan-blue`}
                            style={{ color: idx < 3 ? item.color : "#94a3b8" }}
                          >
                            {item.value}%
                          </span>
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 mt-4 border-t border-gray-100 pt-2">
                  매출구성 현황을 바탕으로 상위 우선순위 5개 사업분야만
                  노출됩니다.
                  <span className="float-right">
                    {selectedYear}.{getQuarterMonth(selectedQuarter)} 기준
                  </span>
                </div>
              </div>

              {/* 2. Revenue (Bar) */}
              {renderFinancialBarChart("매출액", financialData.revenue)}

              {/* 3. Operating Profit (Bar) */}
              {renderFinancialBarChart("영업이익", financialData.operating)}

              {/* 4. Net Income (Bar) */}
              {renderFinancialBarChart("당기순이익", financialData.netIncome)}
            </div>
          </GlassCard>
        </div>

        {/* 4. 손익흐름도 (Sankey Chart) */}
        <div ref={sankeyRef} className="scroll-mt-32">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">손익흐름도</h3>
              <span className="text-xs text-gray-500">
                {selectedYear}년 {selectedQuarter} 기준
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sankey Chart - 왼쪽 8칸 */}
              <div className="lg:col-span-8 h-[500px]">
                <IncomeSankeyChart
                  data={sankeyData}
                  totalRevenue={totalRevenue}
                />
              </div>
              {/* Expense Ranking - 오른쪽 4칸 */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100 h-full">
                  <h4 className="font-bold text-slate-800 text-lg mb-4">
                    비용 순위
                  </h4>
                  <ExpenseRanking
                    expenses={expenseData}
                    totalRevenue={totalRevenue}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 5. AI Outlook (Moved from Bottom) */}
        <div ref={aiRef} className="scroll-mt-32">
          <GlassCard className="p-8" variant="dark">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                  <Star
                    className="text-shinhan-gold"
                    fill="#DDBB66"
                    size={24}
                  />
                  AI 전망 분석
                </h3>
                <p className="text-white/80 text-lg leading-relaxed italic mb-4">
                  "Oxygen gets you high. In a catastrophic emergency, we're
                  taking giant, panicked breaths. Suddenly you become{" "}
                  <span className="text-shinhan-gold font-bold">euphoric</span>,
                  docile."
                </p>
                <p className="text-xs text-white/40">- Market Sentiment AI</p>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1 md:w-40 bg-white/10 rounded-2xl p-5 text-center border border-white/10 hover:bg-white/20 transition-colors">
                  <TrendingUp className="mx-auto text-red-400 mb-3" size={32} />
                  <div className="text-sm text-white/60 mb-1">상승 여력</div>
                  <div className="text-2xl font-bold text-white">High</div>
                </div>
                <div className="flex-1 md:w-40 bg-white/10 rounded-2xl p-5 text-center border border-white/10 hover:bg-white/20 transition-colors">
                  <DollarSign
                    className="mx-auto text-green-400 mb-3"
                    size={32}
                  />
                  <div className="text-sm text-white/60 mb-1">외국인 수급</div>
                  <div className="text-2xl font-bold text-white">Buy</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 5. News Section */}
        <div ref={newsRef} className="scroll-mt-32">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-bold text-slate-800">관련 뉴스</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  prevNews();
                  setIsAutoPlay(false);
                }}
                className="p-2 rounded-full bg-white hover:bg-gray-100 shadow-sm border border-gray-100 text-gray-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  nextNews();
                  setIsAutoPlay(false);
                }}
                className="p-2 rounded-full bg-white hover:bg-gray-100 shadow-sm border border-gray-100 text-gray-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-hidden pb-4 -mx-2 px-2">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-4"
              style={{ transform: `translateX(-${currentNewsIndex * 100}%)` }}
            >
              {/* We group items in pairs for desktop view */}
              {Array.from({ length: Math.ceil(companyNews.length / 2) }).map(
                (_, slideIndex) => (
                  <div key={slideIndex} className="min-w-full flex gap-4">
                    {companyNews
                      .slice(slideIndex * 2, slideIndex * 2 + 2)
                      .map((news) => (
                        <div
                          key={news.id}
                          onClick={() => setSelectedNews(news)}
                          className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group relative overflow-hidden"
                        >
                          <div className="absolute top-4 left-4 opacity-10">
                            <Quote
                              size={40}
                              className="text-slate-400 fill-slate-400"
                            />
                          </div>

                          <div className="relative z-10 flex flex-col h-full">
                            <h4 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-shinhan-blue transition-colors">
                              {news.title}
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed flex-1 line-clamp-4">
                              {news.summary}
                            </p>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="font-medium text-slate-500">
                                  {news.source}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>{news.date}</span>
                              </div>
                              <span className="text-[10px] bg-blue-50 text-shinhan-blue px-2 py-1 rounded-full font-bold">
                                Read More
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    {/* If odd number of items, fill space with invisible div or handle layout */}
                    {slideIndex * 2 + 1 >= companyNews.length && (
                      <div className="flex-1 invisible"></div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* 6. Disclosure Table (Moved from Top) */}
        <div ref={disclosureRef} className="scroll-mt-32">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-slate-800">전자공시</h3>
              <button className="text-xs text-gray-500 hover:text-shinhan-blue flex items-center gap-1">
                전체공시 확인 <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex border-b border-gray-100 text-sm">
              {["주요공시", "공시분석", "공시 전체보기"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDisclosureTab(tab)}
                  className={`flex-1 py-3 font-medium transition-colors ${disclosureTab === tab ? "bg-white text-shinhan-blue border-b-2 border-shinhan-blue" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 주요공시 탭 컨텐츠 */}
            {disclosureTab === "주요공시" && (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium w-24">날짜</th>
                    <th className="px-6 py-3 font-medium w-32">공시구분</th>
                    <th className="px-6 py-3 font-medium">제목</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      date: "2024-03-25",
                      type: "정기공시",
                      title: "사업보고서 (2023.12)",
                    },
                    {
                      date: "2024-03-20",
                      type: "수시공시",
                      title: "주주총회소집결의",
                    },
                    {
                      date: "2024-02-08",
                      type: "공정공시",
                      title: "연결재무제표기준영업(잠정)실적(공정공시)",
                    },
                    {
                      date: "2024-02-08",
                      type: "기타경영",
                      title: "현금ㆍ현물배당결정",
                    },
                    {
                      date: "2024-01-15",
                      type: "수시공시",
                      title: "풍문또는보도에대한해명(미확정)",
                    },
                  ].map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-medium hover:text-shinhan-blue transition-colors">
                        {item.title}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 공시분석 탭 컨텐츠 */}
            {disclosureTab === "공시분석" && (
              <div className="p-6">
                {/* 공시분석 카드 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 relative">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* 좌측 영역 */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-slate-800">
                            {currentCompany.name}
                          </span>
                          <span className="text-gray-400 text-sm">
                            타법인 주식 및 출자증권 취득결정
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-red-500 leading-tight">
                          최대주주등
                          <br />
                          소유주식 변동 공시
                        </h2>
                      </div>
                      <p className="text-xs text-gray-400 mt-6">
                        01/08 09:00 기준
                      </p>
                    </div>

                    {/* 우측 영역 */}
                    <div className="flex-1">
                      <div className="flex justify-end mb-4">
                        <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          공시 원본 보기
                        </button>
                      </div>

                      {/* 테이블 리스트 */}
                      <div className="space-y-0">
                        <div className="flex py-3 border-b border-gray-100">
                          <span className="w-28 text-sm text-gray-500 shrink-0">
                            투자내용 및 목적
                          </span>
                          <div className="flex-1 text-sm text-slate-700">
                            <p>경영참여(직접 또는 계열사를 통한 이사 선임)</p>
                            <p className="text-gray-500">
                              투자회사: 신한라이프생명
                            </p>
                          </div>
                        </div>
                        <div className="flex py-3 border-b border-gray-100">
                          <span className="w-28 text-sm text-red-500 shrink-0">
                            공시일
                          </span>
                          <span className="flex-1 text-sm text-slate-700">
                            2025.01.08
                          </span>
                        </div>
                        <div className="flex py-3 border-b border-gray-100">
                          <span className="w-28 text-sm text-gray-500 shrink-0">
                            투자금액
                          </span>
                          <span className="flex-1 text-sm text-slate-700">
                            2,840억원
                          </span>
                        </div>
                        <div className="flex py-3 border-b border-gray-100">
                          <span className="w-28 text-sm text-gray-500 shrink-0">
                            투자기간
                          </span>
                          <span className="flex-1 text-sm text-slate-700">
                            2025.01.08 ~ 장기보유
                          </span>
                        </div>
                        <div className="flex py-3 border-b border-gray-100">
                          <span className="w-28 text-sm text-gray-500 shrink-0">
                            이사회결의일
                          </span>
                          <span className="flex-1 text-sm text-slate-700">
                            2025.01.07
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 하단 화살표 버튼 */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      // TODO: 추가 공시 데이터 로드 기능 구현
                    }}
                    className="w-10 h-10 rounded-full bg-shinhan-blue text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                  >
                    <ArrowDown size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* 공시 전체보기 탭 컨텐츠 */}
            {disclosureTab === "공시 전체보기" && (
              <div className="p-6 text-center text-gray-500">
                <p>전체 공시 목록을 불러오는 중...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- News Detail Modal --- */}
      {selectedNews && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedNews(null)}
          ></div>
          <div className="bg-white w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-lg shadow-2xl z-10 animate-fade-in-up flex flex-col relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex-none bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-bold text-base text-slate-800">뉴스 상세</h3>
              <button
                onClick={() => setSelectedNews(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              <article>
                <h2 className="text-2xl font-bold text-slate-900 leading-snug mb-3">
                  {selectedNews.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <span className="font-medium text-slate-700">
                    {selectedNews.source}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{selectedNews.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{selectedNews.author}</span>
                </div>

                <div className="prose prose-sm max-w-none text-slate-700 leading-7 whitespace-pre-line">
                  <div className="float-right ml-4 mb-4 w-1/3 min-w-[120px]">
                    <div className="aspect-video bg-gray-200 rounded-md overflow-hidden shadow-sm">
                      <div className="w-full h-full bg-gradient-to-tr from-blue-50 to-indigo-50 flex items-center justify-center">
                        <BarChart3 className="text-blue-200 w-10 h-10" />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 text-center">
                      자료: {selectedNews.source}
                    </p>
                  </div>
                  {selectedNews.content}
                </div>
              </article>

              {/* Related Keywords */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                  <Tag size={16} className="text-gray-400" /> 관련 키워드
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedNews.keywords?.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1.5 bg-blue-50 rounded-md text-xs font-bold text-shinhan-blue"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetail;
