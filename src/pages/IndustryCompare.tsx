import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/Layout/GlassCard";
import ParallelCoordinatesChart from "../components/Charts/ParallelCoordinatesChart";
import AIBubbleChart from "../components/Charts/AIBubbleChart";
import {
  ArrowLeft,
  TrendingUp,
  Info,
  ChevronDown,
  X,
  ChevronRight,
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
import { format } from "date-fns";
import {
  useIndustryData,
  INDUTY_CODE_BY_KEY,
} from "../hooks/useIndustryQueries";
import { getStockOhlcv, getCompanyFinancials } from "../api/company";
import { getNewsKeywords } from "../api/news";

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
    electronics: { name: "전기·전자", indexName: "전기·전자 지수" },
    transportation: { name: "운송장비·부품", indexName: "운송장비·부품 지수" },
    machinery: { name: "기계·장비", indexName: "기계·장비 지수" },
    distribution: { name: "유통", indexName: "유통 지수" },
    pharmaceuticals: { name: "제약", indexName: "제약 지수" },
    it_service: { name: "IT 서비스", indexName: "IT 서비스 지수" },
    finance: { name: "금융", indexName: "금융 지수" },
    utilities: { name: "전기·가스", indexName: "전기·가스 지수" },
    insurance: { name: "보험", indexName: "보험 지수" },
    metal: { name: "금속", indexName: "금속 지수" },
    chemical: { name: "화학", indexName: "화학 지수" },
    logistics: { name: "운송·창고", indexName: "운송·창고 지수" },
    food_tobacco: { name: "음식료·담배", indexName: "음식료·담배 지수" },
    telecom: { name: "통신", indexName: "통신 지수" },
    construction: { name: "건설", indexName: "건설 지수" },
    securities: { name: "증권", indexName: "증권 지수" },
    general_service: { name: "일반서비스", indexName: "일반서비스 지수" },
    entertainment: { name: "오락·문화", indexName: "오락·문화 지수" },
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
const MiniChart = ({
  color,
  data,
}: {
  color: string;
  data?: Array<{ value: number }>;
}) => {
  const chartData = data && data.length > 0 ? data : generateSparklineData();
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
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

// 주 단위 데이터 샘플링 (매주 월요일 또는 가장 가까운 날짜)
function sampleWeekly(data: Array<{ time: string; value: number }>) {
  if (data.length === 0) return data;
  const result: Array<{ time: string; value: number }> = [];
  let lastWeek = -1;
  for (const item of data) {
    const date = new Date(item.time);
    const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
    if (week !== lastWeek) {
      result.push(item);
      lastWeek = week;
    }
  }
  return result;
}

// 월 단위 데이터 샘플링 (매월 첫 번째 데이터)
function sampleMonthly(data: Array<{ time: string; value: number }>) {
  if (data.length === 0) return data;
  const result: Array<{ time: string; value: number }> = [];
  let lastMonth = "";
  for (const item of data) {
    const date = new Date(item.time);
    const month = `${date.getFullYear()}-${date.getMonth()}`;
    if (month !== lastMonth) {
      result.push(item);
      lastMonth = month;
    }
  }
  return result;
}

function getAxisPropsByRange(range: TimeRange) {
  switch (range) {
    case "1M":
      // 일단위 데이터, X축은 주 단위로 레이블 표시 (12.12 형식)
      return {
        interval: "preserveStartEnd" as const,
        minTickGap: 50,
        formatter: (t: string) => format(new Date(t), "M.d"),
        sampler: sampleWeekly,
      };
    case "3M":
    case "6M":
      // 주단위: 12.12 형식
      return {
        interval: "preserveStartEnd" as const,
        minTickGap: 40,
        formatter: (t: string) => format(new Date(t), "M.d"),
        sampler: sampleWeekly,
      };
    case "1Y":
      // 월단위: 25.12 형식 (yy.MM)
      return {
        interval: "preserveStartEnd" as const,
        minTickGap: 40,
        formatter: (t: string) => format(new Date(t), "yy.M"),
        sampler: sampleMonthly,
      };
    default:
      return {
        sampler: (data: Array<{ time: string; value: number }>) => data,
      };
  }
}

const IndustryAnalysis: React.FC<AnalysisProps> = ({
  setPage,
  initialIndutyCode,
  starred,
  onToggleStar,
  setCompanyCode,
}) => {
  const navigate = useNavigate();
  // 초기 산업 설정: initialIndutyCode가 유효하면 사용, 아니면 electronics
  const getInitialIndustry = (): IndustryKey => {
    if (!initialIndutyCode) return "electronics";

    // 1. initialIndutyCode가 이미 유효한 IndustryKey인지 확인
    if (INDUTY_CODE_BY_KEY[initialIndutyCode as IndustryKey]) {
      return initialIndutyCode as IndustryKey;
    }

    // 2. initialIndutyCode가 코드 값(예: "0013")인 경우 역방향 조회
    const foundEntry = Object.entries(INDUTY_CODE_BY_KEY).find(
      ([, code]) => code === initialIndutyCode,
    );
    if (foundEntry) {
      return foundEntry[0] as IndustryKey;
    }

    return "electronics";
  };

  const [selectedIndustry, setSelectedIndustry] =
    useState<IndustryKey>(getInitialIndustry);
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  const xAxisProps = getAxisPropsByRange(timeRange);
  const [selectedNews, setSelectedNews] = useState<IndustryNewsItem | null>(
    null,
  );
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  // -----------------------------
  // TanStack Query - 커스텀 훅 사용
  // (accessToken 없으면 요청 안함, 캐시 재사용, 기간 변경 시 깜빡임 방지)
  // -----------------------------
  const {
    analysisQuery,
    companiesQuery,
    newsQuery,
    chartQuery,
    isLoading: loading,
    error,
  } = useIndustryData(selectedIndustry, timeRange);

  // 뉴스 키워드 데이터 (AI 이슈포착 버블 차트용)
  const { data: keywordsData } = useQuery({
    queryKey: ["newsKeywords"],
    queryFn: async () => {
      const response = await getNewsKeywords({ size: 15 });
      return response.data?.data?.keywords ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

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
  const [chartTab, setChartTab] = useState<"parallel" | "valuation" | "roe">(
    "parallel",
  );

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

  // 각 기업의 재무 데이터 및 주가 데이터 상태 관리
  const [financialsMap, setFinancialsMap] = useState<
    Record<
      string,
      {
        roe: number;
        pbr: number;
        per: number;
        debtRatio: number;
        divYield: number;
        price: string;
        change: string;
        chartData: Array<{ value: number }>;
      }
    >
  >({});

  // 기업 목록이 변경되면 각 기업의 재무 데이터와 주가 데이터를 가져옴
  useEffect(() => {
    const rawData = companiesResponse?.data ?? [];
    if (rawData.length === 0) return;

    const abortController = new AbortController();
    const requestId = Date.now();
    let currentRequestId = requestId;

    const fetchFinancialsAndPrices = async () => {
      const newFinancialsMap: Record<
        string,
        {
          roe: number;
          pbr: number;
          per: number;
          debtRatio: number;
          divYield: number;
          price: string;
          change: string;
          chartData: Array<{ value: number }>;
        }
      > = {};

      // 병렬로 모든 기업의 재무 데이터와 주가 데이터 가져오기
      await Promise.all(
        rawData.map(async (company) => {
          // 요청이 취소되었으면 중단
          if (abortController.signal.aborted) return;

          let roe = 0,
            pbr = 0,
            per = 0,
            debtRatio = 0,
            divYield = 0;
          let price = "-";
          let change = "+0.00%";
          let chartData: Array<{ value: number }> = [];

          // 재무 데이터 가져오기
          try {
            const response = await getCompanyFinancials(
              company.stock_code,
              abortController.signal,
            );
            if (abortController.signal.aborted) return;

            const financialStatements =
              response?.data?.data?.financial_statements;
            if (financialStatements && financialStatements.length > 0) {
              const latest = financialStatements[0];
              roe = latest.roe ?? 0;
              pbr = latest.pbr ?? 0;
              per = latest.per ?? 0;
              debtRatio = latest.debt_ratio ?? 0;
              divYield = latest.dividend_yield ?? 0;
            }
          } catch (error) {
            if ((error as Error).name === "CanceledError") return;
            console.error(
              `Failed to fetch financials for ${company.stock_code}:`,
              error,
            );
          }

          // 주가 데이터 가져오기 (interval 없이 호출하면 모든 interval 반환)
          try {
            if (abortController.signal.aborted) return;
            const priceResponse = await getStockOhlcv(company.stock_code, "");
            if (abortController.signal.aborted) return;

            const responseData = priceResponse?.data?.data as unknown as Record<
              string,
              { data?: Array<{ close: number }> }
            > | null;

            // 1m, 15m, 1h, 1d 순서로 데이터가 있는 interval 찾기
            let priceData: Array<{ close: number }> = [];
            if (responseData) {
              for (const interval of ["1m", "15m", "1h", "1d"]) {
                const intervalData = responseData[interval]?.data;
                if (intervalData && intervalData.length > 0) {
                  priceData = intervalData;
                  break;
                }
              }
            }

            if (priceData.length > 0) {
              const latest = priceData[0];
              const latestClose = latest.close ?? 0;

              if (latestClose > 0) {
                price = latestClose.toLocaleString();

                // 전일 대비 등락률 계산
                if (priceData.length > 1) {
                  const previous = priceData[1];
                  const prevClose = previous.close ?? 0;
                  if (prevClose > 0) {
                    const changePercent =
                      ((latestClose - prevClose) / prevClose) * 100;
                    change =
                      changePercent >= 0
                        ? `+${changePercent.toFixed(2)}%`
                        : `${changePercent.toFixed(2)}%`;
                  }
                }
              }

              // 미니차트용 데이터 (최근 20개)
              chartData = priceData
                .slice(0, 20)
                .reverse()
                .map((d) => ({ value: d.close }));
            }
          } catch (error) {
            if ((error as Error).name === "CanceledError") return;
            console.error(
              `Failed to fetch price for ${company.stock_code}:`,
              error,
            );
          }

          // 취소되지 않은 경우에만 결과 저장
          if (!abortController.signal.aborted) {
            newFinancialsMap[company.stock_code] = {
              roe,
              pbr,
              per,
              debtRatio,
              divYield,
              price,
              change,
              chartData,
            };
          }
        }),
      );

      // 요청이 취소되지 않았고, 현재 요청 ID가 일치하는 경우에만 상태 업데이트
      if (!abortController.signal.aborted && currentRequestId === requestId) {
        setFinancialsMap(newFinancialsMap);
      }
    };

    fetchFinancialsAndPrices();

    return () => {
      currentRequestId = 0;
      abortController.abort();
    };
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
        price: financials?.price ?? "-",
        change: financials?.change ?? "+0.00%",
        per: financials?.per ?? 0,
        pbr: financials?.pbr ?? 0,
        roe: financials?.roe ?? 0,
        debtRatio: financials?.debtRatio ?? 0,
        divYield: financials?.divYield ?? 0,
        chartData: financials?.chartData ?? [],
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
        divYield: c.divYield,
        logo: c.logo ?? undefined,
      }));
    }
    return SAMPLE_STOCKS;
  }, [companiesData, currentIndustryInfo]);

  // ROE 평균값 계산 (밸류에이션 차트 기준선용)
  const avgRoe = useMemo(() => {
    if (companiesData.length === 0) return 0;
    const sum = companiesData.reduce((acc, c) => acc + c.roe, 0);
    return Math.round((sum / companiesData.length) * 10) / 10; // 소수점 1자리
  }, [companiesData]);

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
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/company/${code}`);
  };

  // ParallelCoordinatesChart에서 기업 클릭 시 상세 페이지로 이동
  const handleChartStockSelect = (stock: Stock | null) => {
    setSelectedStock(stock);
    if (stock) {
      handleCompanyClick(stock.id);
    }
  };

  const trendData = useMemo(() => {
    // API 차트 데이터가 있으면 사용
    if (chartData && chartData.length > 0) {
      const rawData = chartData.map((item) => ({
        time: item.date,
        value: item.close,
      }));

      // 날짜 기준 오름차순 정렬 (과거 → 최신)
      const rawDataSorted = rawData.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );

      // timeRange에 따라 샘플링 적용
      const sampler = xAxisProps.sampler;
      return sampler ? sampler(rawDataSorted) : rawDataSorted;
    }

    // API 데이터가 없으면 빈 배열 반환
    return [];
  }, [chartData, xAxisProps.sampler]);

  return (
    <div className="animate-fade-in pb-12 relative">
      {/* Header with Dropdown Selector */}
      <div className="flex items-start justify-between mb-7">
        <h1 className="text-2xl font-bold text-slate-800">산업 분석</h1>
        {/* Industry Dropdown Selector */}
        <div className="relative inline-flex items-center h-9">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value as IndustryKey)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-slate-700 cursor-pointer hover:border-[#0046ff] focus:outline-none focus:ring-2 focus:ring-[#0046ff]/20 focus:border-[#0046ff] transition-all shadow-sm h-full"
          >
            {Object.entries(INDUSTRY_NAMES).map(([key, info]) => (
              <option key={key} value={key}>
                {info.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Sector Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-[#0046ff]" />
              {currentIndustryInfo.indexName} 추이
            </h3>
            <div className="flex justify-between items-end">
              <div className="flex items-baseline gap-2">
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
              <div className="flex gap-2">
                {["1M", "3M", "6M", "1Y"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setTimeRange(p as TimeRange)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      timeRange === p
                        ? "bg-[#0046ff] text-white shadow-md shadow-blue-500/30"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div
            className="flex-1 w-full min-h-[200px] outline-none **:outline-none"
            tabIndex={-1}
          >
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
                  interval={xAxisProps.interval}
                  minTickGap={xAxisProps.minTickGap}
                  tickFormatter={xAxisProps.formatter}
                />
                <YAxis hide domain={["auto", "auto"]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Liquid Glass Card - 산업분야 전망 */}
        <div
          className="
            relative overflow-hidden rounded-3xl h-full
            bg-[#0046FF]
            backdrop-blur-3xl backdrop-saturate-200
            border border-white/30
            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),inset_1px_0_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(255,255,255,0.1)]
          "
        >
          {/* Internal Light Layers */}
          <div className="pointer-events-none absolute -top-[60px] -left-[60px] h-[250px] w-[250px] rounded-full" />
          <div className="pointer-events-none absolute -bottom-[80px] -right-[80px] h-[300px] w-[300px] rounded-full bg-blue-400/30 blur-[70px]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl" />

          {/* Content */}
          <div className="relative z-10 p-6 flex flex-col h-full">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              산업분야 전망
            </h3>
            {loading ? (
              <p className="text-white/60 text-sm">
                로딩 중입니다. 잠시만 기다려 주십시오.
              </p>
            ) : error ? (
              <p className="text-red-300 text-sm">{error}</p>
            ) : (
              <div className="space-y-3 flex-1">
                {/* 분석 내용 - Liquid Glass */}
                <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_1px_0_0_0_rgba(255,255,255,0.2)] p-4">
                  <div className="pointer-events-none absolute -top-4 -left-4 h-16 w-16 rounded-full bg-white/20 blur-xl" />
                  <p className="relative z-10 text-white font-medium text-[15px] leading-relaxed">
                    {analysisData?.scenarios?.neutral?.analysis ??
                      "전망 정보가 없습니다."}
                  </p>
                </div>
                {analysisData?.scenarios && (
                  <div className="space-y-2">
                    {/* 유망 - Liquid Glass */}
                    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_1px_0_0_0_rgba(255,255,255,0.2)] p-3">
                      <div className="pointer-events-none absolute -top-4 -left-4 h-12 w-12 rounded-full bg-white/15 blur-lg" />
                      <div className="relative z-10 flex gap-3">
                        <span className="inline-flex items-center justify-center h-[18px] px-2 bg-green-500/80 text-white text-[10px] font-bold rounded-full shrink-0">
                          유망
                        </span>
                        <p className="text-xs text-white leading-relaxed flex-1">
                          {analysisData?.scenarios?.optimistic?.analysis ??
                            "정보 없음"}
                        </p>
                      </div>
                    </div>
                    {/* 우려 - Liquid Glass */}
                    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_1px_0_0_0_rgba(255,255,255,0.2)] p-3">
                      <div className="pointer-events-none absolute -top-4 -left-4 h-12 w-12 rounded-full bg-white/15 blur-lg" />
                      <div className="relative z-10 flex gap-3">
                        <span className="inline-flex items-center justify-center h-[18px] px-2 bg-red-500/80 text-white text-[10px] font-bold rounded-full shrink-0">
                          우려
                        </span>
                        <p className="text-xs text-white leading-relaxed flex-1">
                          {analysisData?.scenarios?.pessimistic?.analysis ??
                            "정보 없음"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="border-t border-gray-200 my-8" />

      {/* --- All Companies Ranking Table --- */}
      <div className="mb-8">
        <div className="bg-white rounded-xl overflow-hidden">
          {/* 클릭 가능한 아코디언 헤더 */}
          <button
            onClick={() => setShowAllCompanies(!showAllCompanies)}
            className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-800">
                {currentIndustryInfo.name} 산업 순위
              </h2>
              <span className="text-sm text-gray-500">
                ({companiesData.length}개 기업)
              </span>
            </div>
            <div className="flex items-center gap-2 text-shinhan-blue">
              <span className="text-sm font-medium">
                {showAllCompanies ? "접기" : "전체보기"}
              </span>
              <ChevronDown
                size={20}
                className={`transition-transform duration-200 ${showAllCompanies ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left table-fixed">
              <colgroup>
                <col className="w-10" />
                <col className="w-16" />
                <col className="w-12" />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col className="w-32" />
              </colgroup>
              <thead className="text-xs text-gray-400 border-b border-gray-100 sticky top-0 bg-white z-10">
                <tr>
                  <th className="pl-3 pr-1 py-3 font-normal"></th>
                  <th className="px-1 py-3 font-normal text-center">순위</th>
                  <th className="px-2 py-3 font-normal"></th>
                  <th className="px-3 py-3 font-normal text-center">기업명</th>
                  <th className="px-3 py-3 font-normal text-center">주가</th>
                  <th className="px-3 py-3 font-normal text-center">변동</th>
                  <th className="px-3 py-3 font-normal text-center">
                    미니차트
                  </th>
                  <th className="px-3 py-3 font-normal text-center">ROE</th>
                  <th className="px-3 py-3 font-normal text-center">
                    시가총액
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(showAllCompanies
                  ? companiesData
                  : companiesData.slice(0, 5)
                ).map((company, index) => (
                  <tr
                    key={company.code}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => handleCompanyClick(company.code)}
                  >
                    <td className="pl-3 pr-1 py-4">
                      <button
                        onClick={(e) => handleToggleStar(e, company.code)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <StarIcon
                          isActive={starred?.has(company.code) ?? false}
                        />
                      </button>
                    </td>
                    <td className="px-1 py-4 text-center">
                      <span className="font-bold text-slate-600 text-lg">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <div className="inline-flex w-8 h-8 rounded-md bg-white border border-gray-200 items-center justify-center overflow-hidden shadow-sm">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (
                                e.target as HTMLImageElement
                              ).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <span
                          className={`font-bold text-slate-600 text-xs ${company.logo ? "hidden" : ""}`}
                        >
                          {company.name.charAt(0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center font-bold text-slate-800 text-base">
                      {company.name}
                    </td>
                    <td className="px-3 py-4 text-center font-medium text-slate-700 text-base">
                      {company.price}
                    </td>
                    <td
                      className={`px-3 py-4 text-center font-medium ${company.change.startsWith("+") ? "text-red-500" : "text-blue-500"}`}
                    >
                      {company.change}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="inline-block">
                        <MiniChart
                          color={
                            company.change.startsWith("+")
                              ? "#EF4444"
                              : "#3B82F6"
                          }
                          data={company.chartData}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center font-medium text-slate-800">
                      {company.roe >= 0 ? "+" : ""}
                      {company.roe}%
                    </td>
                    <td className="px-3 py-4 text-center text-slate-600 font-medium whitespace-nowrap">
                      {company.marketCap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="border-t border-gray-200 my-8" />

      {/* --- Chart Tabs Section --- */}
      <div className="mb-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setChartTab("parallel")}
            className={`px-4 py-3 text-sm font-bold transition-colors relative outline-none focus:outline-none ${
              chartTab === "parallel"
                ? "text-[#0046FF]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            다차원 가치 지표 분석
            {chartTab === "parallel" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0046FF]" />
            )}
          </button>
          <button
            onClick={() => setChartTab("valuation")}
            className={`px-4 py-3 text-sm font-bold transition-colors relative outline-none focus:outline-none ${
              chartTab === "valuation"
                ? "text-[#0046FF]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            산업 내 밸류에이션 포지셔닝
            {chartTab === "valuation" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0046FF]" />
            )}
          </button>
          <button
            onClick={() => setChartTab("roe")}
            className={`px-4 py-3 text-sm font-bold transition-colors relative outline-none focus:outline-none ${
              chartTab === "roe"
                ? "text-[#0046FF]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            기업 성격 분류
            {chartTab === "roe" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0046FF]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {chartTab === "parallel" && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              다차원 필터를 통해 원하는 조건의 기업을 실시간으로 필터링하세요.
            </p>
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
                            onClick={() => handleCompanyClick(stock.id)}
                            className="p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-blue-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Company Logo */}
                                <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                  {stock.logo ? (
                                    <img
                                      src={stock.logo}
                                      alt={stock.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (
                                          e.target as HTMLImageElement
                                        ).style.display = "none";
                                        (
                                          e.target as HTMLImageElement
                                        ).nextElementSibling?.classList.remove(
                                          "hidden",
                                        );
                                      }}
                                    />
                                  ) : null}
                                  <span
                                    className={`text-sm font-bold text-slate-600 ${stock.logo ? "hidden" : ""}`}
                                  >
                                    {stock.name.charAt(0)}
                                  </span>
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
                                  <span className="text-slate-400">
                                    부채비율
                                  </span>
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
        )}

        {chartTab === "valuation" && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              X축은 ROE(수익성), Y축은 PBR(저평가 여부)을 나타내며, 각
              원(버블)의 크기는 시가총액의 규모를 의미합니다.
            </p>
            <div className="w-full bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden relative p-4 z-0 outline-none [&_*]:outline-none [&_*]:focus:outline-none">
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
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
                      domain={[
                        (dataMin: number) => Math.min(dataMin, -5),
                        (dataMax: number) => Math.max(dataMax, avgRoe + 5),
                      ]}
                      tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
                      stroke="#94a3b8"
                      axisLine={{ strokeDasharray: "3 3", strokeOpacity: 0.1 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="PBR"
                      unit="배"
                      domain={[
                        (dataMin: number) => Math.min(dataMin, 0),
                        (dataMax: number) => Math.max(dataMax, 1.5),
                      ]}
                      tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
                      stroke="#94a3b8"
                      axisLine={{ strokeDasharray: "3 3", strokeOpacity: 0.1 }}
                    />
                    <ZAxis
                      type="number"
                      dataKey="z"
                      domain={["dataMin", "dataMax"]}
                      range={[50, 400]}
                      name="시가총액"
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={(props) => {
                        const { active, payload, coordinate } = props;
                        const viewBox = (
                          props as { viewBox?: { width?: number } }
                        ).viewBox;
                        if (active && payload && payload.length && coordinate) {
                          const data = payload[0].payload;
                          const tooltipWidth = 140;
                          const chartWidth = viewBox?.width || 500;

                          // 오른쪽 공간 부족시 왼쪽에 표시
                          const left =
                            coordinate.x + tooltipWidth + 30 > chartWidth
                              ? coordinate.x - tooltipWidth - 15
                              : coordinate.x + 15;

                          return (
                            <AnimatePresence>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 20,
                                }}
                                className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-200 text-xs whitespace-nowrap"
                                style={{
                                  position: "absolute",
                                  left,
                                  top: coordinate.y - 50,
                                  pointerEvents: "none",
                                  minWidth: "140px",
                                }}
                              >
                                <div className="font-bold mb-2 text-slate-800 text-sm flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-[#0046FF]" />
                                  {data.name}
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">ROE</span>
                                    <span className="text-[#0046FF] font-bold">
                                      {data.x}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">PBR</span>
                                    <span className="text-[#0046FF] font-bold">
                                      {data.y}배
                                    </span>
                                  </div>
                                  <div className="pt-1.5 mt-1.5 border-t border-slate-100 text-slate-400 text-[10px]">
                                    버블 크기 = 시가총액
                                  </div>
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          );
                        }
                        return null;
                      }}
                    />

                    {/* Highlight the 'Target' Quadrant (High ROE, Low PBR) */}
                    <ReferenceArea
                      x1={avgRoe}
                      x2={100}
                      y1={0}
                      y2={1}
                      fill="#0046FF"
                      fillOpacity={0.08}
                    />

                    <Scatter
                      name="Companies"
                      data={companiesData.map((company) => ({
                        name: company.name,
                        code: company.code,
                        x: company.roe,
                        y: company.pbr,
                        z: parseMarketCap(company.marketCap),
                      }))}
                      onClick={(data) => {
                        if (data && data.payload && data.payload.code) {
                          handleCompanyClick(data.payload.code);
                        }
                      }}
                      cursor="pointer"
                    >
                      {companiesData.map((company, index) => {
                        const isTarget =
                          company.roe >= avgRoe && company.pbr <= 1;
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

                    {/* 기준선: ROE 평균, PBR 1배 */}
                    <ReferenceLine
                      x={avgRoe}
                      stroke="#334155"
                      strokeWidth={1}
                      label={{
                        value: `ROE ${avgRoe}% (평균)`,
                        position: "insideTopLeft",
                        fill: "#334155",
                        fontSize: 11,
                        fontWeight: "bold",
                        offset: 10,
                      }}
                    />
                    <ReferenceLine
                      y={1}
                      stroke="#334155"
                      strokeWidth={1}
                      label={{
                        value: "PBR 1배 (주가순자산비율)",
                        position: "insideBottomLeft",
                        fill: "#334155",
                        fontSize: 11,
                        fontWeight: "bold",
                        offset: 10,
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {chartTab === "roe" && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              X축은 부채비율(재무 건전성)을, Y축은 ROE(자본 수익성)를 나타내며,
              이를 통해 기업의 안전성과 수익성을 동시에 분석합니다.
            </p>
            <div className="w-full bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden relative p-4 z-0 outline-none [&_*]:outline-none [&_*]:focus:outline-none">
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
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
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      domain={[0, "auto"]}
                      axisLine={{ strokeDasharray: "3 3", strokeOpacity: 0.1 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="roe"
                      name="ROE"
                      unit="%"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ strokeDasharray: "3 3", strokeOpacity: 0.1 }}
                    />
                    <ZAxis
                      type="number"
                      dataKey="z"
                      domain={["dataMin", "dataMax"]}
                      range={[50, 400]}
                      name="시가총액"
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={(props) => {
                        const { active, payload, coordinate } = props;
                        const viewBox = (
                          props as { viewBox?: { width?: number } }
                        ).viewBox;
                        if (active && payload && payload.length && coordinate) {
                          const data = payload[0].payload;
                          const tooltipWidth = 140;
                          const chartWidth = viewBox?.width || 500;

                          // 오른쪽 공간 부족시 왼쪽에 표시
                          const left =
                            coordinate.x + tooltipWidth + 30 > chartWidth
                              ? coordinate.x - tooltipWidth - 15
                              : coordinate.x + 15;

                          return (
                            <AnimatePresence>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 20,
                                }}
                                className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-200 text-xs whitespace-nowrap"
                                style={{
                                  position: "absolute",
                                  left,
                                  top: coordinate.y - 50,
                                  pointerEvents: "none",
                                  minWidth: "140px",
                                }}
                              >
                                <div className="font-bold mb-2 text-slate-800 text-sm flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                  {data.name}
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">ROE</span>
                                    <span className="text-[#0046FF] font-bold">
                                      {data.roe}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">
                                      부채비율
                                    </span>
                                    <span className="text-slate-700 font-bold">
                                      {data.debt}%
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          );
                        }
                        return null;
                      }}
                    />

                    {/* Highlight High Efficiency (High ROE, Low Debt) */}
                    <ReferenceArea
                      x1={0}
                      x2={100}
                      y1={avgRoe}
                      y2={100}
                      fill="#10B981"
                      fillOpacity={0.08}
                    />

                    <Scatter
                      name="Companies"
                      data={companiesData.map((company) => ({
                        name: company.name,
                        code: company.code,
                        roe: company.roe,
                        debt: company.debtRatio,
                        z: parseMarketCap(company.marketCap),
                      }))}
                      onClick={(data) => {
                        if (data && data.payload && data.payload.code) {
                          handleCompanyClick(data.payload.code);
                        }
                      }}
                      cursor="pointer"
                    >
                      {companiesData.map((company, index) => {
                        const isQuality =
                          company.roe >= avgRoe && company.debtRatio <= 100;
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
                      x={100}
                      stroke="#334155"
                      strokeWidth={1}
                      label={{
                        value: "부채비율 150%",
                        position: "insideTopRight",
                        fontSize: 11,
                        fill: "#334155",
                        fontWeight: "bold",
                      }}
                    />
                    <ReferenceLine
                      y={avgRoe}
                      stroke="#334155"
                      strokeWidth={1}
                      label={{
                        value: `ROE ${avgRoe}% (평균)`,
                        position: "insideBottomLeft",
                        fontSize: 11,
                        fill: "#334155",
                        fontWeight: "bold",
                      }}
                    />

                    {/* Quadrant Label */}
                    <ReferenceLine
                      x={75}
                      y={20}
                      stroke="none"
                      label={{
                        value: "고효율 우량형 (Target)",
                        position: "center",
                        fill: "#10B981",
                        fontSize: 13,
                        fontWeight: "bold",
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Divider */}
      <div className="border-t border-gray-200 my-8" />

      {/* --- News Section (Side by Side) --- */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 산업 이슈 키워드 버블 차트 */}
          <div>
            <h3 className="text-xl font-bold text-[#0046FF] flex items-center gap-2 mb-4">
              산업 이슈 키워드
            </h3>
            <div
              className="
                relative overflow-hidden rounded-3xl
                bg-[#0f172b]
                backdrop-blur-3xl backdrop-saturate-200
                border border-white/30
                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),inset_1px_0_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(255,255,255,0.1)]
                outline-none [&_*]:outline-none [&_*]:focus:outline-none
              "
            >
              <div className="pointer-events-none absolute -top-[60px] -left-[60px] h-[250px] w-[250px] rounded-full" />
              <div className="pointer-events-none absolute -bottom-[80px] -right-[80px] h-[300px] w-[300px] rounded-full bg-blue-400/30 blur-[70px]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl" />
              <div className="relative p-4">
                <AIBubbleChart keywords={keywordsData} />
              </div>
            </div>
          </div>

          {/* 오른쪽: 뉴스 */}
          <div>
            <h3 className="text-xl font-bold text-[#0046FF] flex items-center gap-2 mb-4">
              뉴스
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industryNews.length > 0 ? (
                industryNews.slice(0, 4).map((news) => (
                  <GlassCard
                    key={news.id}
                    className="p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col"
                    onClick={() => {
                      if (news.url) {
                        const newWindow = window.open(
                          news.url,
                          "_blank",
                          "noopener,noreferrer",
                        );
                        if (newWindow) newWindow.opener = null;
                      } else {
                        setSelectedNews(news);
                      }
                    }}
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
                <div className="col-span-2 text-center py-10 text-gray-400 bg-white/50 rounded-md border border-gray-100">
                  해당 산업의 최신 뉴스가 없습니다.
                </div>
              )}
            </div>
          </div>
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
