import React, { useState, useMemo, useEffect } from "react";
import GlassCard from "../components/Layout/GlassCard";
import ParallelCoordinatesChart from "../components/Charts/ParallelCoordinatesChart";
import {
  ArrowLeft,
  TrendingUp,
  Info,
  ChevronDown,
  X,
  ChevronRight,
  Trophy,
  RotateCcw,
  Filter,
} from "lucide-react";
import { PageView } from "../types";
import type {
  Stock,
  AxisKey,
  BrushRange,
  IndustryNewsItem,
  IndustryData,
  TimeRange,
  IndustryKey,
} from "../types";
import { SAMPLE_STOCKS, AXES } from "../constants";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  CartesianGrid,
  Cell,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  getIndustryNews,
  getIndustryAnalysis,
  getIndustryCompanies,
  getIndustryChart,
} from "../api/industry";
import { getCompanyFinancials } from "../api/company";

// 산업 코드 매핑 (IndustryKey -> API induty_code)
const INDUTY_CODE_BY_KEY: Record<IndustryKey, string> = {
  agriculture_fishery: "0027", // 농어업
  manufacturing_kosdaq: "1015", //제조업
  food: "0006", //음식료품
  chemical: "0009", // 화학/정유
  pharmaceuticals: "0010", //의약품
  battery: "0014", // 전기전자 (배터리는 전기전자에 포함)
  auto: "0015", // 운수장비 (자동차/조선)
  semiconductor_kosdaq: "1047", //반도체(코스닥)
  it_kosdaq: "1012", //it 산업(코스닥)
  insurance: "0025", //보험
};

interface AnalysisProps {
  setPage: (page: PageView) => void;
  initialIndutyCode?: string;
  starred: Set<string>;
  onToggleStar: (code: string) => void;
  setCompanyCode?: (code: string) => void;
}

// Generate random sparkline data for the mini chart
const generateSparklineData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    i,
    value: 50 + Math.random() * 20 - 10,
  }));
};

// 산업명 매핑 (IndustryKey -> 산업명)
const INDUSTRY_NAMES: Record<IndustryKey, { name: string; indexName: string }> =
  {
    agriculture_fishery: { name: "농어업", indexName: "농어업 지수" },
    manufacturing_kosdaq: { name: "제조업", indexName: "제조업 지수" },
    food: { name: "음식료품", indexName: "음식료품 지수" },
    chemical: { name: "화학/정유", indexName: "화학 지수" },
    pharmaceuticals: { name: "의약품", indexName: "의약품 지수" },
    battery: { name: "전기전자", indexName: "전기전자 지수" },
    auto: { name: "운수장비", indexName: "운수장비 지수" },
    semiconductor_kosdaq: { name: "반도체", indexName: "반도체 지수" },
    it_kosdaq: { name: "IT산업", indexName: "IT 지수" },
    insurance: { name: "보험", indexName: "보험 지수" },
  };

// 시가총액 포맷 함수
function formatMarketCap(value: number): string {
  if (value >= 10000) {
    const jo = Math.floor(value / 10000);
    const uk = value % 10000;
    return uk > 0 ? `${jo}조 ${uk.toLocaleString()}억` : `${jo}조`;
  }
  return `${value.toLocaleString()}억`;
}

//시가총액 파싱(억, 조)
const parseMarketCap = (marketCap: string): number => {
  let value = 0;
  const joMatch = marketCap.match(/(\d+(?:\.\d+)?)\s*조/);
  const ukMatch = marketCap.match(/(\d+(?:,\d+)?)\s*억/);
  if (joMatch) value += parseFloat(joMatch[1]) * 10000;
  if (ukMatch) value += parseFloat(ukMatch[1].replace(/,/g, ""));
  return value || 10;
};

// -- Mini Sparkline Component --
const MiniChart = ({ color }: { color: string }) => {
  const data = generateSparklineData();
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const IndustryAnalysis: React.FC<AnalysisProps> = ({
  setPage,
  initialIndutyCode,
  starred,
  onToggleStar,
  setCompanyCode,
}) => {
  // 초기 산업 설정: initialIndutyCode가 유효하면 사용, 아니면 agriculture_fishery
  const getInitialIndustry = (): IndustryKey => {
    if (
      initialIndutyCode &&
      INDUTY_CODE_BY_KEY[initialIndutyCode as IndustryKey]
    ) {
      return initialIndutyCode as IndustryKey;
    }
    return "agriculture_fishery";
  };

  const [selectedIndustry, setSelectedIndustry] =
    useState<IndustryKey>(getInitialIndustry);
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  const [selectedNews, setSelectedNews] = useState<IndustryNewsItem | null>(
    null,
  );

  // 산업 코드
  const indutyCode = INDUTY_CODE_BY_KEY[selectedIndustry];

  // -----------------------------
  // TanStack Query - API 데이터 조회
  // -----------------------------
  const analysisQuery = useQuery({
    queryKey: ["industryAnalysis", indutyCode],
    queryFn: () => getIndustryAnalysis(indutyCode),
    enabled: !!indutyCode,
  });

  const companiesQuery = useQuery({
    queryKey: ["industryCompanies", indutyCode],
    queryFn: () => getIndustryCompanies(indutyCode),
    enabled: !!indutyCode,
  });

  const newsQuery = useQuery({
    queryKey: ["industryNews", indutyCode],
    queryFn: () => getIndustryNews(indutyCode),
    enabled: !!indutyCode,
  });

  // 산업 지수 차트 조회 (기간별)
  const chartPeriodMap: Record<TimeRange, "1m" | "3m" | "6m" | "1y"> = {
    "1M": "1m",
    "3M": "3m",
    "6M": "6m",
    "1Y": "1y",
  };

  const chartQuery = useQuery({
    queryKey: ["industryChart", indutyCode, timeRange],
    queryFn: () => getIndustryChart(indutyCode, chartPeriodMap[timeRange]),
    enabled: !!indutyCode,
  });

  // 쿼리 상태 추출
  const loading =
    analysisQuery.isLoading ||
    companiesQuery.isLoading ||
    newsQuery.isLoading ||
    chartQuery.isLoading;
  const error =
    analysisQuery.error?.message ||
    companiesQuery.error?.message ||
    newsQuery.error?.message ||
    chartQuery.error?.message ||
    null;
  // API 응답 구조에 맞게 타입 정의
  const analysisResponse = analysisQuery.data as {
    data?: {
      induty_code: string;
      industry_name: string;
      ksic_code: string;
      analyzed_at: string;
      scenarios: {
        optimistic: { analysis: string; key_factors: string[] };
        neutral: { analysis: string; key_factors: string[] };
        pessimistic: { analysis: string; key_factors: string[] };
      };
      industry_statistics: {
        company_count: number;
        total_market_cap: number;
        avg_market_cap: number;
        top_companies: Array<{
          stock_code: string;
          company_name: string;
          market_amount: number;
        }>;
      };
      data_sources: {
        news_count: number;
        report_count: number;
        company_count: number;
      };
    };
  } | null;

  const analysisData = analysisResponse?.data;
  // API 응답: { data: { industry_name, news: [...] } }
  const newsResponse = newsQuery.data as {
    data?: {
      industry_name?: string;
      news?: Array<{
        news_id: number;
        title: string;
        summary: string;
        url: string;
        author: string | null;
        press: string;
        keywords: string[];
        sentiment: string;
        published_at: string;
      }>;
    };
  } | null;

  const industryNews: IndustryNewsItem[] = useMemo(() => {
    const newsData = newsResponse?.data?.news ?? [];
    return newsData.map((item) => ({
      id: item.news_id,
      title: item.title,
      content: item.summary,
      source: item.press,
      time: new Date(item.published_at).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      }),
      url: item.url,
    }));
  }, [newsResponse]);

  // 차트 데이터
  const chartData = useMemo(() => {
    const chartResponse = chartQuery.data as
      | {
          data?: Array<{
            date: string;
            open: number;
            high: number;
            low: number;
            close: number;
            change_value: number;
            change_rate: number;
          }>;
        }
      | Array<{
          date: string;
          open: number;
          high: number;
          low: number;
          close: number;
          change_value: number;
          change_rate: number;
        }>
      | null;

    return Array.isArray(chartResponse)
      ? chartResponse
      : (chartResponse?.data ?? []);
  }, [chartQuery.data]);

  // 차트 데이터에서 가장 최신 지수 정보 추출
  const latestIndexData = useMemo(() => {
    if (chartData.length === 0) return null;
    const latest = chartData[chartData.length - 1];
    return {
      current_value: latest.close,
      change_value: latest.change_value,
      change_percent: latest.change_rate,
    };
  }, [chartData]);

  // Parallel Coordinates Chart State
  const [filters, setFilters] = useState<Partial<Record<AxisKey, BrushRange>>>(
    {},
  );
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // 현재 선택된 산업의 이름 정보 가져오기
  const currentIndustryInfo = INDUSTRY_NAMES[selectedIndustry];

  // API에서 가져온 기업 목록 (companies API)
  const companiesResponse = companiesQuery.data as {
    data?: Array<{
      rank: number;
      name: string;
      stock_code: string;
      amount: number;
      logo: string | null;
    }>;
  } | null;

  // 각 기업의 재무 데이터 상태 관리
  const [financialsMap, setFinancialsMap] = useState<
    Record<string, { roe: number; pbr: number; per: number; debtRatio: number }>
  >({});

  // 기업 목록이 변경되면 각 기업의 재무 데이터를 가져옴
  useEffect(() => {
    const fetchFinancials = async () => {
      const rawData = companiesResponse?.data ?? [];
      if (rawData.length === 0) return;

      const newFinancialsMap: Record<
        string,
        { roe: number; pbr: number; per: number; debtRatio: number }
      > = {};

      // 병렬로 모든 기업의 재무 데이터 가져오기
      await Promise.all(
        rawData.map(async (company) => {
          try {
            const response = await getCompanyFinancials(company.stock_code);
            const financialStatements =
              response?.data?.data?.financial_statements;
            if (financialStatements && financialStatements.length > 0) {
              const latest = financialStatements[0];
              newFinancialsMap[company.stock_code] = {
                roe: parseFloat(latest.roe) || 0,
                pbr: parseFloat(latest.pbr) || 0,
                per: parseFloat(latest.per) || 0,
                debtRatio: parseFloat(latest.debt_ratio) || 0,
              };
            }
          } catch (error) {
            console.error(
              `Failed to fetch financials for ${company.stock_code}:`,
              error,
            );
          }
        }),
      );

      setFinancialsMap(newFinancialsMap);
    };

    fetchFinancials();
  }, [companiesResponse]);

  const companiesData = useMemo(() => {
    const rawData = companiesResponse?.data ?? [];

    // 시가총액(amount)을 억 단위로 변환하는 함수
    const formatAmount = (amount: number): string => {
      const uk = Math.floor(amount / 100000000); // 억 단위
      return formatMarketCap(uk);
    };

    return rawData.map((company) => {
      const financials = financialsMap[company.stock_code];
      return {
        rank: company.rank,
        name: company.name,
        code: company.stock_code,
        logo: company.logo,
        marketCap: formatAmount(company.amount),
        price: "0",
        change: "+0.00%",
        per: financials?.per ?? 0,
        pbr: financials?.pbr ?? 0,
        roe: financials?.roe ?? 0,
        debtRatio: financials?.debtRatio ?? 0,
      };
    });
  }, [companiesResponse, financialsMap]);

  // Parallel Coordinates 차트에 사용할 데이터 (companiesData가 있으면 사용, 없으면 SAMPLE_STOCKS)
  const chartStocksData = useMemo(() => {
    if (companiesData.length > 0) {
      return companiesData.map((c) => ({
        id: c.code,
        name: c.name,
        sector: currentIndustryInfo?.name ?? "",
        per: c.per,
        pbr: c.pbr,
        roe: c.roe,
        debtRatio: c.debtRatio,
        divYield: 0,
        logo: c.logo ?? undefined,
      }));
    }
    return SAMPLE_STOCKS;
  }, [companiesData, currentIndustryInfo]);

  const filteredIds = useMemo(() => {
    const ids = new Set<string>();
    chartStocksData.forEach((stock) => {
      let pass = true;
      for (const key of Object.keys(filters) as AxisKey[]) {
        const range = filters[key];
        if (range) {
          const val = Number(stock[key as keyof typeof stock]);
          const min = range.min;
          const max = range.max;

          if (val < min || val > max) {
            pass = false;
            break;
          }
        }
      }
      if (pass) ids.add(stock.id);
    });
    return ids;
  }, [filters, chartStocksData]);

  const handleToggleStar = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    onToggleStar(code);
  };

  const handleCompanyClick = (code: string) => {
    if (setCompanyCode) {
      setCompanyCode(code);
      setPage(PageView.COMPANY_DETAIL);
    }
  };

  const trendData = useMemo(() => {
    // API 차트 데이터가 있으면 사용
    if (chartData && chartData.length > 0) {
      return chartData.map((item) => ({
        time: item.date,
        value: item.close,
      }));
    }

    // API 데이터가 없으면 빈 배열 반환
    return [];
  }, [chartData]);

  return (
    <div className="animate-fade-in pb-12 relative">
      <button
        onClick={() => setPage(PageView.DASHBOARD)}
        className="flex items-center text-slate-500 hover:text-shinhan-blue mb-4 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        대시보드로 돌아가기
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            산업 분석
            <span className="text-gray-300">|</span>
            <span className="text-shinhan-blue">
              {currentIndustryInfo.name}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {currentIndustryInfo.indexName} 및 주요 구성 종목 심층 분석
          </p>
        </div>
        <div className="relative">
          {/* Rounded-md */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value as IndustryKey)}
            className="appearance-none bg-white border border-gray-200 text-slate-700 text-sm rounded-md focus:ring-shinhan-blue focus:border-shinhan-blue block pl-4 pr-10 py-2.5 outline-none shadow-sm cursor-pointer min-w-[200px]"
          >
            {Object.entries(INDUSTRY_NAMES).map(([key, info]) => (
              <option key={key} value={key}>
                {info.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Sector Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <GlassCard className="p-6 col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-shinhan-blue" />
                {currentIndustryInfo.indexName} 추이
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-slate-900">
                  {(latestIndexData?.current_value ?? 0).toLocaleString()}
                </span>
                <span
                  className={`font-medium px-2 py-0.5 rounded text-sm ${(latestIndexData?.change_value ?? 0) > 0 ? "text-red-500 bg-red-50" : "text-blue-500 bg-blue-50"}`}
                >
                  {(latestIndexData?.change_value ?? 0) > 0 ? "+" : ""}
                  {latestIndexData?.change_value ?? 0} (
                  {(latestIndexData?.change_value ?? 0) > 0 ? "+" : ""}
                  {latestIndexData?.change_percent ?? 0}%)
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {["1M", "3M", "6M", "1Y"].map((p) => (
                <button
                  key={p}
                  onClick={() => setTimeRange(p as TimeRange)}
                  // Rounded-md
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    timeRange === p
                      ? "bg-shinhan-blue text-white shadow-md shadow-blue-500/30"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={
                        (latestIndexData?.change_value ?? 0) > 0
                          ? "#EF4444"
                          : "#0046FF"
                      }
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        (latestIndexData?.change_value ?? 0) > 0
                          ? "#EF4444"
                          : "#0046FF"
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number | undefined) => [
                    value ? value.toLocaleString() : "0",
                    "지수",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={
                    (latestIndexData?.change_value ?? 0) > 0
                      ? "#EF4444"
                      : "#0046FF"
                  }
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                />
                <YAxis hide domain={["auto", "auto"]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6" variant="dark">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Info size={18} className="text-shinhan-gold" />
            산업분야 전망
          </h3>
          {loading ? (
            <p className="text-white/60 text-sm">로딩 중...</p>
          ) : error ? (
            <p className="text-red-300 text-sm">{error}</p>
          ) : (
            <div className="space-y-3">
              {/* 분석 내용 글라스 카드 */}
              <div className="bg-white/25 backdrop-blur-sm rounded-lg border border-white/30 p-4">
                <p className="text-white text-sm leading-relaxed">
                  {analysisData?.scenarios?.neutral?.analysis ??
                    "전망 정보가 없습니다."}
                </p>
              </div>
              {analysisData?.scenarios && (
                <div className="space-y-2">
                  <div className="bg-white/25 backdrop-blur-sm rounded-lg border border-white/30 p-3 flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-green-500/80 text-white text-[10px] font-bold rounded-full shrink-0">
                      긍정
                    </span>
                    <p className="text-xs text-white leading-relaxed">
                      {analysisData?.scenarios?.optimistic?.analysis ??
                        "정보 없음"}
                    </p>
                  </div>
                  <div className="bg-white/25 backdrop-blur-sm rounded-lg border border-white/30 p-3 flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-red-500/80 text-white text-[10px] font-bold rounded-full shrink-0">
                      리스크
                    </span>
                    <p className="text-xs text-white leading-relaxed">
                      {analysisData?.scenarios?.pessimistic?.analysis ??
                        "정보 없음"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {/* --- Top 3 Companies (Rankings) --- */}
      <h3 className="text-lg font-bold text-slate-700 mb-4 px-2">
        {currentIndustryInfo.name} 산업 기업 순위
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
        {companiesData.slice(0, 3).map((company, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;

          let containerClasses =
            "p-6 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col";
          let badgeClasses = "";
          let label = "";

          if (isFirst) {
            containerClasses +=
              " border-yellow-200 bg-white shadow-sm min-h-[260px] mt-2";
            badgeClasses = "bg-yellow-100 text-yellow-600";
            label = "1st Place";
          } else if (isSecond) {
            containerClasses +=
              " border-slate-200 bg-white shadow-sm min-h-[260px] mt-2";
            badgeClasses = "bg-slate-100 text-slate-500";
            label = "2nd Place";
          } else {
            containerClasses +=
              " border-orange-200 bg-white shadow-sm min-h-[260px] mt-2";
            badgeClasses = "bg-orange-100 text-orange-600";
            label = "3rd Place";
          }

          return (
            <GlassCard
              key={company.code}
              className={containerClasses}
              onClick={() => handleCompanyClick(company.code)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${badgeClasses}`}
                  >
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isFirst ? "text-yellow-600" : isSecond ? "text-slate-500" : "text-orange-500"}`}
                    >
                      {label}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {company.code}
                    </div>
                    <button
                      onClick={(e) => handleToggleStar(e, company.code)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <StarIcon
                        isActive={starred?.has(company.code) ?? false}
                      />
                    </button>
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleStar(e, company.code)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <StarIcon isActive={starred?.has(company.code) ?? false} />
                </button>
              </div>

              {/* Center Content */}
              <div className="text-center mb-6">
                <h3
                  className={`font-bold text-slate-800 mb-2 ${isFirst ? "text-2xl" : "text-xl"}`}
                >
                  {company.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-lg font-bold ${isFirst ? "text-slate-900" : "text-slate-700"}`}
                  >
                    {company.price}
                  </span>
                  <span
                    className={`text-sm font-bold px-2 py-0.5 rounded ${company.change.startsWith("+") ? "text-red-500 bg-red-50" : "text-blue-500 bg-blue-50"}`}
                  >
                    {company.change}
                  </span>
                </div>
              </div>

              {/* Footer Metrics */}
              <div
                className={`mt-auto pt-4 border-t ${isFirst ? "border-yellow-100" : "border-gray-50"}`}
              >
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1">
                      시가총액
                    </div>
                    <div className="text-sm font-bold text-slate-600">
                      {company.marketCap}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1">ROE</div>
                    <div className="text-sm font-bold text-shinhan-blue">
                      {company.roe}%
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* --- All Companies Ranking Table --- */}
      <div className="mb-10">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pl-6 pr-2 py-3 font-normal w-12"></th>
                  <th className="px-2 py-3 font-normal text-center w-10">
                    순위
                  </th>
                  <th className="px-6 py-3 font-normal w-16"></th>
                  <th className="px-6 py-3 font-normal text-center">기업명</th>
                  <th className="px-6 py-3 font-normal text-center">주가</th>
                  <th className="px-6 py-3 font-normal text-center">변동</th>
                  <th className="px-6 py-3 font-normal text-center">
                    미니차트
                  </th>
                  <th className="px-6 py-3 font-normal text-center">ROE</th>
                  <th className="px-6 py-3 font-normal text-center">
                    시가총액
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companiesData.map((company, index) => (
                  <tr
                    key={company.code}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => handleCompanyClick(company.code)}
                  >
                    <td className="pl-6 pr-2 py-4">
                      <button
                        onClick={(e) => handleToggleStar(e, company.code)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <StarIcon
                          isActive={starred?.has(company.code) ?? false}
                        />
                      </button>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <span className="font-bold text-slate-600 text-lg">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex w-8 h-8 rounded-md bg-white border border-gray-200 items-center justify-center font-bold text-slate-600 text-xs shadow-sm">
                        {company.name.charAt(0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800 text-base">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700 text-base">
                      {company.price}
                    </td>
                    <td
                      className={`px-6 py-4 text-center font-medium ${company.change.startsWith("+") ? "text-red-500" : "text-blue-500"}`}
                    >
                      {company.change}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-block">
                        <MiniChart
                          color={
                            company.change.startsWith("+")
                              ? "#EF4444"
                              : "#3B82F6"
                          }
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-800">
                      {company.roe >= 0 ? "+" : ""}
                      {company.roe}%
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      {company.marketCap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Parallel Coordinates Chart --- */}
      <div className="mb-10">
        <ParallelCoordinatesChart
          data={chartStocksData}
          onFilterChange={setFilters}
          filters={filters}
          filteredIds={filteredIds}
          onStockSelect={setSelectedStock}
          selectedStockId={selectedStock?.id ?? null}
        />

        {/* Filter Info & Filtered Stocks List - Side by Side */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Filtered Stocks List (세로 스크롤) */}
            {filteredIds.size > 0 && (
              <div className="lg:col-span-2 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-700 text-sm mb-3">
                  조건 충족 종목 리스트
                </h3>
                <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-2">
                  {chartStocksData
                    .filter((stock) => filteredIds.has(stock.id))
                    .map((stock) => (
                      <div
                        key={stock.id}
                        onClick={() => setSelectedStock(stock)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedStock?.id === stock.id
                            ? "border-shinhan-blue bg-blue-50"
                            : "border-slate-100 bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Company Logo */}
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {stock.logo ? (
                                <img
                                  src={stock.logo}
                                  alt={stock.name}
                                  className="w-8 h-8 object-contain"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-bold text-slate-400">
                                  {stock.name.slice(0, 2)}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">
                                {stock.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {stock.sector}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-xs">
                            <div className="text-center min-w-[40px]">
                              <span className="text-slate-400">PER</span>
                              <div className="font-bold text-slate-700">
                                {stock.per.toFixed(1)}
                              </div>
                            </div>
                            <div className="text-center min-w-[40px]">
                              <span className="text-slate-400">PBR</span>
                              <div className="font-bold text-slate-700">
                                {stock.pbr.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-center min-w-[40px]">
                              <span className="text-slate-400">ROE</span>
                              <div className="font-bold text-shinhan-blue">
                                {stock.roe.toFixed(1)}%
                              </div>
                            </div>
                            <div className="text-center min-w-[50px]">
                              <span className="text-slate-400">부채비율</span>
                              <div className="font-bold text-slate-700">
                                {stock.debtRatio}%
                              </div>
                            </div>
                            <div className="text-center min-w-[40px]">
                              <span className="text-slate-400">배당률</span>
                              <div className="font-bold text-emerald-600">
                                {stock.divYield.toFixed(1)}%
                              </div>
                            </div>
                            {selectedStock?.id === stock.id && (
                              <span className="px-2 py-0.5 bg-shinhan-blue text-white text-[10px] rounded-full font-bold">
                                선택됨
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Right: Filter Info & Reset Button */}
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-shinhan-blue" />
                  <span className="font-bold text-slate-700 text-sm">
                    적용된 필터 ({Object.keys(filters).length}개)
                  </span>
                </div>
                <button
                  onClick={() => setFilters({})}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw size={14} />
                  초기화
                </button>
              </div>
              {/* 필터 세로 배치 */}
              <div className="flex flex-col gap-2 mb-4">
                {Object.entries(filters).map(([key, range]) => {
                  const axisInfo = AXES.find((a) => a.key === key);
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-shinhan-blue">
                          {axisInfo?.label || key}
                        </span>
                        <span className="text-slate-600">
                          {range.min.toFixed(1)} ~ {range.max.toFixed(1)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const newFilters = { ...filters };
                          delete newFilters[key as AxisKey];
                          setFilters(newFilters);
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  조건 충족 종목:{" "}
                  <span className="font-bold text-shinhan-blue text-lg">
                    {filteredIds.size}개
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Valuation Position Map --- */}
      <div className="mb-10">
        <div className="w-full bg-white rounded-xl p-4 shadow-xl border border-slate-100 overflow-hidden relative">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#0046FF]">
              산업 내 밸류에이션 포지셔닝
            </h2>
            <p className="text-sm text-slate-500">
              X축: 수익성(ROE) / Y축: 저평가(PBR) / 크기: 시가총액
            </p>
          </div>
          <div className="h-[500px] w-full bg-white/50 rounded-xl border border-slate-100 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.1}
                  stroke="#334155"
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="ROE"
                  unit="%"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
                  stroke="#94a3b8"
                  axisLine={{ strokeDasharray: "3 3", strokeOpacity: 0.1 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="PBR"
                  unit="배"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
                  stroke="#94a3b8"
                  axisLine={{ strokeDasharray: "3 3", strokeOpacity: 0.1 }}
                />
                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[100, 1000]}
                  name="시가총액"
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur p-3 rounded-lg shadow-xl border border-gray-200 text-xs">
                          <div className="font-bold mb-1 text-slate-800 text-sm">
                            {data.name}
                          </div>
                          <div className="space-y-0.5">
                            <div>
                              ROE:{" "}
                              <span className="text-shinhan-blue font-bold">
                                {data.x}%
                              </span>
                            </div>
                            <div>
                              PBR:{" "}
                              <span className="text-shinhan-blue font-bold">
                                {data.y}배
                              </span>
                            </div>
                            <div className="text-gray-500 mt-1">
                              시가총액 비례 크기
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Highlight the 'Target' Quadrant (High ROE, Low PBR) */}
                <ReferenceArea
                  x1={10}
                  y2={1}
                  fill="#0046FF"
                  fillOpacity={0.08}
                />

                <Scatter
                  name="Companies"
                  data={companiesData.map((company) => ({
                    name: company.name,
                    x: company.roe,
                    y: company.pbr,
                    z: parseMarketCap(company.marketCap),
                  }))}
                >
                  {companiesData.map((company, index) => {
                    const isTarget = company.roe >= 10 && company.pbr <= 1;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isTarget ? "#0046FF" : "#CBD5E1"}
                        fillOpacity={isTarget ? 0.9 : 0.5}
                        stroke={isTarget ? "#0033CC" : "#94A3B8"}
                        strokeWidth={1}
                      />
                    );
                  })}
                </Scatter>

                {/* Quadrant Lines */}
                <ReferenceLine
                  x={10}
                  stroke="#334155"
                  strokeWidth={1}
                  label={{
                    value: "ROE 10%",
                    position: "insideTopRight",
                    fill: "#334155",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                />
                <ReferenceLine
                  y={1}
                  stroke="#334155"
                  strokeWidth={1}
                  label={{
                    value: "PBR 1배",
                    position: "insideTopRight",
                    fill: "#334155",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                />

                {/* Quadrant Labels */}
                <ReferenceLine
                  x={12}
                  y={0.5}
                  stroke="none"
                  label={{
                    value: "저평가·고수익 (Target)",
                    position: "center",
                    fill: "#0046FF",
                    fontSize: 13,
                    fontWeight: "bold",
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- Efficiency vs Leverage (ROE vs Debt) --- */}
      <div className="mb-10">
        <div className="w-full bg-white rounded-xl p-4 shadow-xl border border-slate-100 overflow-hidden relative">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#0046FF] flex items-center gap-2">
              <div className="text-shinhan-blue" />
              기업 성격 분류 (ROE vs 부채비율)
            </h2>
            <p className="text-sm text-slate-500">
              X축: 부채비율 (안전성) / Y축: ROE (수익성)
            </p>
          </div>
          <div className="h-[500px] w-full bg-white/50 rounded-xl border border-slate-100 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.1}
                  stroke="#334155"
                />
                <XAxis
                  type="number"
                  dataKey="debt"
                  name="부채비율"
                  unit="%"
                  label={{
                    value: "부채비율 (%)",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 11,
                    fill: "#475569",
                    fontWeight: 600,
                  }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  domain={[0, "auto"]}
                  axisLine={{ strokeDasharray: "3 3", strokeOpacity: 0.1 }}
                />
                <YAxis
                  type="number"
                  dataKey="roe"
                  name="ROE"
                  unit="%"
                  label={{
                    value: "ROE (%)",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                    fill: "#475569",
                    fontWeight: 600,
                  }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ strokeDasharray: "3 3", strokeOpacity: 0.1 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur p-3 rounded-lg shadow-xl border border-gray-200 text-xs">
                          <div className="font-bold mb-1 text-slate-800 text-sm">
                            {data.name}
                          </div>
                          <div className="space-y-0.5">
                            <div>
                              ROE:{" "}
                              <span className="text-shinhan-blue font-bold">
                                {data.roe}%
                              </span>
                            </div>
                            <div>
                              부채비율:{" "}
                              <span className="font-bold text-slate-600">
                                {data.debt}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Highlight High Efficiency (High ROE, Low Debt) */}
                <ReferenceArea
                  x1={0}
                  x2={150}
                  y1={10}
                  fill="#10B981"
                  fillOpacity={0.08}
                />

                <Scatter
                  name="Companies"
                  data={companiesData.map((company) => ({
                    name: company.name,
                    roe: company.roe,
                    debt: company.debtRatio,
                  }))}
                  shape="circle"
                >
                  {companiesData.map((company, index) => {
                    const isQuality =
                      company.roe >= 10 && company.debtRatio <= 150;
                    return (
                      <Cell
                        key={`cell-leverage-${index}`}
                        fill={isQuality ? "#10B981" : "#CBD5E1"}
                        fillOpacity={isQuality ? 0.9 : 0.5}
                        stroke={isQuality ? "#059669" : "#94A3B8"}
                        strokeWidth={1}
                      />
                    );
                  })}
                </Scatter>

                <ReferenceLine
                  x={150}
                  stroke="#334155"
                  strokeWidth={1}
                  label={{
                    value: "부채비율 150%",
                    position: "insideTop",
                    fontSize: 10,
                    fill: "#334155",
                    fontWeight: "bold",
                  }}
                />
                <ReferenceLine
                  y={10}
                  stroke="#334155"
                  strokeWidth={1}
                  label={{
                    value: "ROE 10%",
                    position: "insideRight",
                    fontSize: 10,
                    fill: "#334155",
                    fontWeight: "bold",
                  }}
                />

                {/* Label */}
                <ReferenceLine
                  x={50}
                  y={15}
                  stroke="none"
                  label={{
                    value: "고효율 우량형",
                    position: "top",
                    fill: "#10B981",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- News Section --- */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-700 mb-4 px-2 flex items-center gap-2">
          뉴스 <ChevronRight size={18} />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {industryNews.length > 0 ? (
            industryNews.slice(0, 6).map((news) => (
              <GlassCard
                key={news.id}
                className="p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col"
                onClick={() =>
                  news.url
                    ? window.open(news.url, "_blank")
                    : setSelectedNews(news)
                }
              >
                <h4 className="font-bold text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-shinhan-blue transition-colors text-sm">
                  {news.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {news.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                  <span>{news.source}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{news.time}</span>
                </div>
              </GlassCard>
            ))
          ) : (
            // Rounded-md
            <div className="col-span-3 text-center py-10 text-gray-400 bg-white/50 rounded-md border border-gray-100">
              해당 산업의 최신 뉴스가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* --- News Modal (Bottom Sheet Style) --- */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedNews(null)}
          ></div>
          {/* Rounded-lg */}
          <div className="bg-white w-full max-w-2xl sm:rounded-lg rounded-t-lg shadow-2xl z-10 animate-fade-in-up max-h-[85vh] overflow-y-auto flex flex-col relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 relative z-10 rounded-t-lg">
              <h3 className="font-bold text-sm text-slate-500 text-center">
                토픽 인사이트
              </h3>
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 leading-snug mb-4">
                {selectedNews.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-4">
                <span className="font-medium text-slate-700">
                  {selectedNews.source}
                </span>
                <span>{selectedNews.time}</span>
              </div>

              <div className="flex flex-col sm:flex-row-reverse gap-6 mb-6">
                {/* Rounded-md */}
                <div className="w-full sm:w-1/3 h-40 bg-gray-200 rounded-md flex-shrink-0"></div>
                <p className="text-slate-700 leading-loose text-lg flex-1">
                  {selectedNews.content}
                </p>
              </div>

              {/* Rounded-md */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Icon for Star
const StarIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={isActive ? "#FFD700" : "none"}
    stroke={isActive ? "#FFD700" : "#CBD5E1"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-colors duration-200"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default IndustryAnalysis;
