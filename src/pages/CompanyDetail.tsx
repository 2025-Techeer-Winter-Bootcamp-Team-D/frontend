import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getCompanyDetail,
  getStockOhlcv,
  getCompanyNews,
  getCompanyNewsDetail,
  getCompanyReports,
  getReportAnalysis,
  getCompanyFinancials,
  getCompanyOutlook,
} from "../api/company";
import { getIndustryCompanies } from "../api/industry";
import GlassCard from "../components/Layout/GlassCard";
import StockChart from "../components/Charts/StockChart";
import CandleChart from "../components/Charts/CandleChart";
import { IncomeSankeyChart } from "../components/Charts/IncomeSankeyChart";

import type {
  NewsItem,
  PeerCompanyItem,
  FinancialData,
  FinancialMetric,
  CompanyApiData,
  PageView,
  OhlcvItem,
  CompanyReportItem,
  CompanyFinancialsData,
  CompanyOutlookData,
  RevenueComposition,
  IndustryCompany,
  SankeyData,
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
import {
  Star,
  User,
  X,
  HelpCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";

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
  market: "-",
  establishmentDate: "-",
  homepage: "",
  address: "-",
};

// 재무 지표 설명 툴팁
const FINANCIAL_TOOLTIPS: Record<string, string> = {
  사업분석:
    "기업의 사업 부문별 매출 구성 비율을 보여줍니다. 주력사업, 신규사업, 해외사업 등으로 분류하여 수익 다각화 정도를 파악할 수 있습니다.",
  매출액:
    "기업이 제품이나 서비스를 판매하여 얻은 총 수익입니다. 기업의 규모와 성장성을 나타내는 가장 기본적인 지표입니다.",
  영업이익:
    "매출액에서 매출원가, 판매비, 관리비 등 영업비용을 뺀 이익입니다. 기업의 핵심 영업활동 수익성을 보여줍니다.",
  당기순이익:
    "영업이익에서 이자비용, 세금 등 모든 비용을 차감한 최종 순이익입니다. 주주에게 귀속되는 실제 이익을 나타냅니다.",
};

// 툴팁 컴포넌트
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({
  text,
  children,
}) => (
  <div className="relative group inline-flex" tabIndex={0}>
    {children}
    <div
      className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-white text-slate-700 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 w-64 text-left z-50 shadow-lg border border-gray-200 pointer-events-none"
      role="tooltip"
    >
      {text}
      <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-white"></div>
    </div>
  </div>
);

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
  const [isNewsLoading2, setIsNewsLoading2] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [disclosureTab, setDisclosureTab] = useState<
    "main" | "analysis" | "all"
  >("main");

  const {
    data: companyReports = [],
    isLoading: isReportsLoading,
    isError: isReportsError,
    error: reportsError,
  } = useQuery({
    queryKey: ["company", "reports", companyCode],
    queryFn: async () => {
      const response = await getCompanyReports(companyCode);
      const data = response.data?.data;
      return data?.reports || [];
    },
  });

  // 공시분석 탭에서 모든 분석을 한번에 가져오기
  const MAX_ANALYSIS_COUNT = 10;

  const analysisQueries = useQueries({
    queries:
      disclosureTab === "analysis" && companyReports.length > 0
        ? companyReports
            .slice(0, MAX_ANALYSIS_COUNT)
            .map((report: CompanyReportItem) => ({
              queryKey: ["reportAnalysis", companyCode, report.rcept_no],
              queryFn: async () => {
                const response = await getReportAnalysis(
                  companyCode,
                  report.rcept_no,
                );
                return { ...response.data.data, report };
              },
              enabled: disclosureTab === "analysis",
            }))
        : [],
  });

  // 뉴스 상세 조회 핸들러
  const handleNewsClick = async (newsId: number) => {
    setIsNewsLoading2(true);
    try {
      const response = await getCompanyNewsDetail(companyCode, newsId);
      const data = response.data?.data;
      if (data) {
        setSelectedNews({
          id: data.news_id,
          title: data.title,
          summary: data.summary,
          source: data.press,
          date: data.published_at,
          author: data.author,
          content: data.content,
          keywords: data.keywords,
          url: data.url,
        });
      }
    } catch (error) {
      console.error("뉴스 상세 조회 실패:", error);
    } finally {
      setIsNewsLoading2(false);
    }
  };

  const getBackendInterval = (range: string): string => {
    const mapping: Record<string, string> = {
      "1D": "1d",
      "1W": "1d",
      "3M": "1d",
      "1Y": "1d",
    };
    return mapping[range] || "1d";
  };

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
      // getIndustryCompanies는 이미 .then(res => res.data)를 하므로 response가 곧 서버 응답
      const companies = Array.isArray(response)
        ? response
        : response?.data || response?.companies || [];
      return companies.map((company: IndustryCompany, index: number) => {
        // 시가총액 포맷팅 (amount를 억 단위로 변환)
        const formatMarketCap = (amount: number | string | undefined) => {
          if (!amount) return "-";
          const numAmount =
            typeof amount === "string" ? Number(amount) : amount;
          if (isNaN(numAmount)) return "-";
          const billion = Math.floor(numAmount / 100000000);
          if (billion >= 10000) {
            const trillion = Math.floor(billion / 10000);
            const remainBillion = billion % 10000;
            return remainBillion > 0
              ? `${trillion}조 ${remainBillion.toLocaleString()}억`
              : `${trillion}조`;
          }
          return `${billion.toLocaleString()}억`;
        };
        return {
          rank: company.rank || index + 1,
          name: company.name,
          code: company.stockCode,
          marketCap: formatMarketCap(company.marketCap),
        };
      }) as PeerCompanyItem[];
    },
    enabled: !!apiCompanyData?.industry?.induty_code,
  });

  const { data: companyNews = [], isLoading: isNewsLoading } = useQuery({
    queryKey: ["company", "news", companyCode],
    queryFn: async () => {
      const response = await getCompanyNews(companyCode);
      // API 응답: { data: { results: [...] } }
      const results = response.data?.data?.results ?? [];
      // API 필드 -> NewsItem 필드로 매핑
      return results.map((item: any) => ({
        id: item.news_id,
        title: item.title,
        summary: item.summary,
        source: item.press,
        date: item.published_at,
        author: item.author,
        content: item.summary, // content가 없으면 summary 사용
        keywords: item.keywords,
        url: item.url,
      })) as NewsItem[];
    },
  });

  const { data: financialsData, isLoading: isFinancialsLoading } = useQuery({
    queryKey: ["company", "financials", companyCode],
    queryFn: async () => {
      const response = await getCompanyFinancials(companyCode);
      return response.data.data as CompanyFinancialsData;
    },
  });

  const { data: outlookData, isLoading: isOutlookLoading } = useQuery({
    queryKey: ["company", "outlook", companyCode],
    queryFn: async () => {
      const response = await getCompanyOutlook(companyCode);
      return response.data.data as CompanyOutlookData;
    },
  });

  const infoRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const financialRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const disclosureRef = useRef<HTMLDivElement>(null);
  const outlookRef = useRef<HTMLDivElement>(null);

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
      market: apiCompanyData.market || "-",
      establishmentDate: apiCompanyData.establishment_date || "-",
      homepage: apiCompanyData.homepage_url || "",
      address: apiCompanyData.address || "-",
    };
  }, [apiCompanyData]);

  // 사업분석 색상 팔레트
  const BUSINESS_COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EF4444",
    "#06B6D4",
    "#94A3B8",
  ];

  // revenue_composition을 차트 데이터로 변환하는 함수
  const convertRevenueComposition = (composition: RevenueComposition[]) => {
    if (!composition || composition.length === 0) {
      return [{ name: "데이터 없음", value: 100, color: "#94A3B8" }];
    }
    return composition
      .filter((item) => item && item.segment && item.ratio > 0)
      .map((item, index) => ({
        name: item.segment || "기타",
        value:
          typeof item.ratio === "number"
            ? item.ratio
            : parseFloat(item.ratio) || 0,
        color: BUSINESS_COLORS[index % BUSINESS_COLORS.length],
      }));
  };

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

    const safeNum = (val: number | string | null | undefined): number =>
      val ? Number(val) : 0;

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

    // API에서 가져온 revenue_composition 사용, 없으면 기본 mock 데이터
    const businessData = financialsData.revenue_composition
      ? convertRevenueComposition(financialsData.revenue_composition)
      : [
          { name: "주력사업", value: 45, color: "#3B82F6" },
          { name: "신규사업", value: 25, color: "#10B981" },
          { name: "해외사업", value: 20, color: "#F59E0B" },
          { name: "기타", value: 10, color: "#94A3B8" },
        ];

    return {
      business: businessData,
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

  // Sankey 차트 데이터 생성
  const sankeyChartData = useMemo((): {
    data: SankeyData;
    totalRevenue: number;
  } | null => {
    if (!financialsData?.financial_statements?.length) {
      return null;
    }

    const statements = financialsData.financial_statements;
    const sortedStatements = [...statements].sort(
      (a, b) => b.fiscal_year - a.fiscal_year,
    );
    const latest = sortedStatements[0];

    const revenue = latest.revenue || 0;
    const operatingProfit = latest.operating_profit || 0;
    const netIncome = latest.net_income || 0;

    // 비용 계산 (매출 - 영업이익 = 영업비용)
    const operatingExpense = revenue - operatingProfit;
    // 영업외비용 (영업이익 - 당기순이익)
    const nonOperatingExpense = operatingProfit - netIncome;

    const nodes = [
      {
        id: "revenue",
        name: "매출액",
        color: "#3B82F6",
        category: "Revenue" as const,
      },
      {
        id: "hub",
        name: "손익구조",
        color: "#64748B",
        category: "Hub" as const,
      },
      {
        id: "operating_expense",
        name: "영업비용",
        color: "#EF4444",
        category: "Expense" as const,
      },
      {
        id: "operating_profit",
        name: "영업이익",
        color: "#10B981",
        category: "Profit" as const,
      },
      {
        id: "non_operating",
        name: "영업외비용",
        color: "#F59E0B",
        category: "Expense" as const,
      },
      {
        id: "net_income",
        name: "당기순이익",
        color: "#8B5CF6",
        category: "Profit" as const,
      },
    ];

    const links = [
      { source: "revenue", target: "hub", value: revenue },
      {
        source: "hub",
        target: "operating_expense",
        value: Math.max(0, operatingExpense),
      },
      {
        source: "hub",
        target: "operating_profit",
        value: Math.max(0, operatingProfit),
      },
      {
        source: "operating_profit",
        target: "non_operating",
        value: Math.max(0, nonOperatingExpense),
      },
      {
        source: "operating_profit",
        target: "net_income",
        value: Math.max(0, netIncome),
      },
    ].filter((link) => link.value > 0);

    return {
      data: { nodes, links },
      totalRevenue: revenue,
    };
  }, [financialsData]);

  const filteredReports = useMemo(() => {
    if (!companyReports || companyReports.length === 0) return [];

    switch (disclosureTab) {
      case "main":
        return companyReports.filter(
          (report: CompanyReportItem) =>
            report.report_type?.includes("주요") ||
            report.report_name?.includes("주요"),
        );
      case "analysis":
        return companyReports;
      case "all":
      default:
        return companyReports;
    }
  }, [companyReports, disclosureTab]);

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
    { id: "outlook", label: "기업전망", ref: outlookRef },
    { id: "news", label: "뉴스", ref: newsRef },
    { id: "disclosure", label: "공시", ref: disclosureRef },
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
          <Tooltip text={FINANCIAL_TOOLTIPS[title] || ""}>
            <HelpCircle
              size={14}
              className="text-gray-400 cursor-help hover:text-blue-500 transition-colors"
            />
          </Tooltip>
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
          <Tooltip text={FINANCIAL_TOOLTIPS["사업분석"]}>
            <HelpCircle
              size={14}
              className="text-gray-400 cursor-help hover:text-blue-500 transition-colors"
            />
          </Tooltip>
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
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs min-w-[60px]">산업</span>
                <span className="font-bold text-slate-800 text-sm">
                  {currentCompany.industry}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs min-w-[60px]">시장</span>
                <span className="font-bold text-slate-800 text-sm">
                  {currentCompany.market}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs min-w-[60px]">
                  대표자
                </span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  <User size={14} /> {currentCompany.ceo}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs min-w-[60px]">
                  시가총액
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {currentCompany.marketCap}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs min-w-[60px]">
                  설립일
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {currentCompany.establishmentDate}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs min-w-[60px]">
                  홈페이지
                </span>
                {currentCompany.homepage ? (
                  <a
                    href={currentCompany.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 text-sm hover:underline truncate"
                  >
                    {currentCompany.homepage.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className="font-bold text-slate-800 text-sm">-</span>
                )}
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <span className="text-gray-500 text-xs min-w-[60px]">주소</span>
                <span className="font-bold text-slate-800 text-sm">
                  {currentCompany.address}
                </span>
              </div>
              <div className="flex items-start gap-3 col-span-2">
                <span className="text-gray-500 text-xs min-w-[60px] pt-0.5">
                  주요사업
                </span>
                <span className="font-bold text-slate-800 text-sm leading-relaxed">
                  {currentCompany.desc || "-"}
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-5">
                          {item.rank}
                        </span>
                        <span className="text-sm font-bold text-slate-700">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {item.marketCap}
                      </span>
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

          {/* 손익 구조 Sankey 차트 */}
          {sankeyChartData && (
            <GlassCard className="p-6 mt-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                손익 구조 분석
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                매출액이 어떻게 비용과 이익으로 분배되는지 시각적으로
                보여줍니다.
              </p>
              <div className="h-[500px]">
                <IncomeSankeyChart
                  data={sankeyChartData.data}
                  totalRevenue={sankeyChartData.totalRevenue}
                />
              </div>
            </GlassCard>
          )}
        </div>

        <div ref={outlookRef} className="scroll-mt-32">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Target size={24} className="text-blue-600" />
              기업 전망 분석
            </h3>
            {isOutlookLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : outlookData ? (
              <div className="space-y-6">
                {/* 전망 요약 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h4 className="text-lg font-bold text-slate-800 mb-3">
                    전망 요약
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    {outlookData.outlook_summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 긍정적 요인 */}
                  <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={20} className="text-green-600" />
                      <h4 className="font-bold text-green-800">긍정적 요인</h4>
                    </div>
                    <ul className="space-y-2">
                      {outlookData.positive_factors?.map((factor, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-green-700"
                        >
                          <span className="text-green-500 mt-1">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 리스크 요인 */}
                  <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingDown size={20} className="text-red-600" />
                      <h4 className="font-bold text-red-800">리스크 요인</h4>
                    </div>
                    <ul className="space-y-2">
                      {outlookData.risk_factors?.map((factor, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-red-700"
                        >
                          <span className="text-red-500 mt-1">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 투자 의견 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-3">투자 의견</h4>
                  <p className="text-slate-700 leading-relaxed">
                    {outlookData.investment_opinion}
                  </p>
                  {outlookData.target_price && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">목표 주가: </span>
                      <span className="text-lg font-bold text-blue-600">
                        {outlookData.target_price.toLocaleString()}원
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Target size={48} className="mb-3 opacity-50" />
                <p className="text-sm">기업 전망 데이터가 없습니다.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyNews.slice(0, 6).map((news, idx) => (
                  <div
                    key={news.id || idx}
                    onClick={() => news.id && handleNewsClick(news.id)}
                    className="p-4 border border-gray-100 rounded-xl hover:bg-white hover:shadow-md hover:border-blue-100 transition-all cursor-pointer"
                  >
                    <h4 className="font-bold text-slate-800 line-clamp-2 mb-2 text-sm">
                      {news.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                      {news.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {news.source && <span>{news.source}</span>}
                      {news.source && news.date && <span>·</span>}
                      {news.date && (
                        <span>
                          {new Date(news.date).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div ref={disclosureRef} className="scroll-mt-32">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {[
                  { key: "main", label: "주요공시" },
                  { key: "analysis", label: "공시분석" },
                  { key: "all", label: "공시전체보기" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() =>
                      setDisclosureTab(tab.key as "main" | "analysis" | "all")
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      disclosureTab === tab.key
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  window.open(
                    "https://dart.fss.or.kr",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                전자공시확인
              </button>
            </div>

            {disclosureTab === "analysis" ? (
              // 공시분석 탭: 분석 카드만 표시
              <div className="space-y-4">
                {isReportsError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-red-500">
                    <svg
                      className="w-12 h-12 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="text-sm font-medium">
                      공시 목록을 불러오는데 실패했습니다.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(reportsError as Error)?.message ||
                        "알 수 없는 오류가 발생했습니다."}
                    </p>
                  </div>
                ) : isReportsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : analysisQueries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg
                      className="w-12 h-12 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm">분석 데이터가 없습니다.</p>
                  </div>
                ) : (
                  analysisQueries.map((query, idx) => {
                    const analysisData = query.data;
                    const report = analysisData?.report as
                      | CompanyReportItem
                      | undefined;

                    return (
                      <div
                        key={report?.rcept_no || idx}
                        className="bg-slate-50 border border-gray-200 rounded-lg p-6"
                      >
                        {query.isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2
                              className="animate-spin text-blue-500"
                              size={32}
                            />
                          </div>
                        ) : query.isError ? (
                          <div className="text-center text-red-400 py-4">
                            <p className="text-sm">
                              분석 데이터 로드 중 오류가 발생했습니다.
                            </p>
                          </div>
                        ) : analysisData?.extracted_info ? (
                          <div className="relative">
                            <button
                              onClick={() => {
                                if (report?.report_url)
                                  window.open(
                                    report.report_url,
                                    "_blank",
                                    "noopener,noreferrer",
                                  );
                              }}
                              className="absolute top-0 right-0 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                              공시 원본 보기
                            </button>
                            <div className="flex gap-8">
                              <div className="flex-shrink-0 w-64">
                                <h3 className="text-2xl font-bold text-red-600 leading-tight mb-3">
                                  {report?.report_name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  기준 일시:{" "}
                                  {report?.submitted_at
                                    ? report.submitted_at.split("T")[0]
                                    : "-"}
                                </p>
                              </div>
                              <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm">
                                  <tbody>
                                    {analysisData.extracted_info?.key_info &&
                                      Object.entries(
                                        analysisData.extracted_info.key_info,
                                      ).map(([key, value], i) => (
                                        <tr
                                          key={key}
                                          className={
                                            i % 2 === 0
                                              ? "bg-gray-50"
                                              : "bg-white"
                                          }
                                        >
                                          <td className="px-4 py-3 font-medium text-gray-600 w-40 border-r border-gray-100">
                                            {key}
                                          </td>
                                          <td className="px-4 py-3 text-gray-800">
                                            {value as string}
                                          </td>
                                        </tr>
                                      ))}
                                    {analysisData.extracted_info?.summary
                                      ?.one_line && (
                                      <tr className="bg-white">
                                        <td className="px-4 py-3 font-medium text-gray-600 w-40 border-r border-gray-100">
                                          요약
                                        </td>
                                        <td className="px-4 py-3 text-gray-800">
                                          {
                                            analysisData.extracted_info.summary
                                              .one_line
                                          }
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 py-4">
                            <p className="text-sm">
                              분석 데이터를 불러올 수 없습니다.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              // 주요공시, 공시전체보기 탭: 테이블 형식
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-100 text-gray-700 font-semibold text-sm">
                  <div className="col-span-2 px-4 py-3">날짜</div>
                  <div className="col-span-3 px-4 py-3">공시구분</div>
                  <div className="col-span-7 px-4 py-3">공시제목</div>
                </div>

                {isReportsError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-red-500">
                    <svg
                      className="w-12 h-12 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="text-sm font-medium">
                      공시 목록을 불러오는데 실패했습니다.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(reportsError as Error)?.message ||
                        "알 수 없는 오류가 발생했습니다."}
                    </p>
                  </div>
                ) : isReportsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg
                      className="w-12 h-12 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm">
                      {disclosureTab === "main"
                        ? "주요 공시 데이터가 없습니다."
                        : "공시 데이터가 없습니다."}
                    </p>
                  </div>
                ) : (
                  filteredReports.map(
                    (item: CompanyReportItem, idx: number) => (
                      <a
                        key={item.rcept_no || idx}
                        href={item.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid grid-cols-12 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="col-span-2 px-4 py-3 text-sm text-gray-700">
                          {item.submitted_at
                            ? item.submitted_at.split("T")[0]
                            : "-"}
                        </div>
                        <div className="col-span-3 px-4 py-3 text-sm text-gray-500">
                          {item.report_type || "-"}
                        </div>
                        <div className="col-span-7 px-4 py-3 text-sm text-gray-700">
                          {item.report_name}
                        </div>
                      </a>
                    ),
                  )
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* 뉴스 상세 모달 */}
      {(selectedNews || isNewsLoading2) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isNewsLoading2 && setSelectedNews(null)}
          ></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl z-10 p-8 shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
            {isNewsLoading2 ? (
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
                    {selectedNews.source && (
                      <span className="font-medium text-slate-700">
                        {selectedNews.source}
                      </span>
                    )}
                    {selectedNews.author && (
                      <span>· {selectedNews.author}</span>
                    )}
                    {selectedNews.date && (
                      <span>
                        ·{" "}
                        {new Date(selectedNews.date).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
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
    </div>
  );
};

export default CompanyDetail;
