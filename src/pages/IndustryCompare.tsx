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
} from "lucide-react";
import { PageView } from "../types";
import type {
  Stock,
  AxisKey,
  BrushRange,
  IndustryNewsItem,
  IndustryCompany,
  IndustryAnalysisResponse,
} from "../types";
import { SAMPLE_STOCKS } from "../constants";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import {
  getIndustryNews,
  getIndustryAnalysis,
  getIndustryCompanies,
} from "../api/industry";

interface AnalysisProps {
  setPage: (page: PageView) => void;
  initialIndustryId?: string;
  starred: Set<string>;
  onToggleStar: (code: string) => void;
  setCompanyCode?: (code: string) => void;
}

type IndustryKey =
  | "finance"
  | "semicon"
  | "auto"
  | "bio"
  | "battery"
  | "internet"
  | "ent"
  | "steel"
  | "ship"
  | "const"
  | "retail"
  | "telecom";

type TimeRange = "1M" | "3M" | "6M" | "1Y";

const INDUSTRY_ID_BY_KEY: Record<IndustryKey, number> = {
  finance: 1,
  semicon: 2,
  auto: 3,
  bio: 4,
  battery: 5,
  internet: 6,
  ent: 7,
  steel: 8,
  ship: 9,
  const: 10,
  retail: 11,
  telecom: 12,
};

interface IndustryData {
  id: IndustryKey;
  name: string;
  indexName: string;
  indexValue: number;
  changeValue: number;
  changePercent: number;
}

// Generate random sparkline data for the mini chart
const generateSparklineData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    i,
    value: 50 + Math.random() * 20 - 10,
  }));
};

const industryDB: Record<IndustryKey, IndustryData> = {
  finance: {
    id: "finance",
    name: "금융 (Finance)",
    indexName: "KRX Banks",
    indexValue: 765.42,
    changeValue: 12.5,
    changePercent: 1.66,
  },
  semicon: {
    id: "semicon",
    name: "반도체 (Semicon)",
    indexName: "KRX Semicon",
    indexValue: 3420.5,
    changeValue: 45.2,
    changePercent: 1.34,
  },
  auto: {
    id: "auto",
    name: "자동차 (Auto)",
    indexName: "KRX Auto",
    indexValue: 1850.3,
    changeValue: -12.5,
    changePercent: -0.67,
  },
  bio: {
    id: "bio",
    name: "바이오 (Bio)",
    indexName: "KRX Health",
    indexValue: 2150.1,
    changeValue: 35.4,
    changePercent: 1.67,
  },
  battery: {
    id: "battery",
    name: "2차전지 (Battery)",
    indexName: "KRX Battery",
    indexValue: 4500.2,
    changeValue: -85.0,
    changePercent: -1.85,
  },
  internet: {
    id: "internet",
    name: "인터넷 (Internet)",
    indexName: "KRX Internet",
    indexValue: 1205,
    changeValue: 15,
    changePercent: 1.2,
  },
  ent: {
    id: "ent",
    name: "엔터 (Ent)",
    indexName: "KRX Ent",
    indexValue: 850,
    changeValue: -5,
    changePercent: -0.6,
  },
  steel: {
    id: "steel",
    name: "철강 (Steel)",
    indexName: "KRX Steel",
    indexValue: 1450,
    changeValue: 8,
    changePercent: 0.5,
  },
  ship: {
    id: "ship",
    name: "조선 (Ship)",
    indexName: "KRX Heavy",
    indexValue: 980,
    changeValue: 18,
    changePercent: 1.8,
  },
  const: {
    id: "const",
    name: "건설 (Const)",
    indexName: "KRX Const",
    indexValue: 520,
    changeValue: -5,
    changePercent: -1.0,
  },
  retail: {
    id: "retail",
    name: "유통 (Retail)",
    indexName: "KRX Consumer",
    indexValue: 890,
    changeValue: 4,
    changePercent: 0.5,
  },
  telecom: {
    id: "telecom",
    name: "통신 (Telecom)",
    indexName: "KRX Telecom",
    indexValue: 350,
    changeValue: 1,
    changePercent: 0.3,
  },
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
  initialIndustryId,
  starred,
  onToggleStar,
  setCompanyCode,
}) => {
  // 초기값으로 initialIndustryId 사용
  const getInitialIndustry = (): IndustryKey => {
    if (initialIndustryId && industryDB[initialIndustryId as IndustryKey]) {
      return initialIndustryId as IndustryKey;
    }
    return "finance";
  };

  const [selectedIndustry, setSelectedIndustry] =
    useState<IndustryKey>(getInitialIndustry);
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");

  // API state
  const [newsItems, setNewsItems] = useState<IndustryNewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<IndustryNewsItem | null>(
    null,
  );
  const [analysis, setAnalysis] = useState<IndustryAnalysisResponse | null>(
    null,
  );
  const [companies, setCompanies] = useState<IndustryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parallel Coordinates Chart State
  const [filters, setFilters] = useState<Partial<Record<AxisKey, BrushRange>>>(
    {},
  );
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const industryId = INDUSTRY_ID_BY_KEY[selectedIndustry];

  // API 호출
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getIndustryNews(industryId),
      getIndustryAnalysis(industryId),
      getIndustryCompanies(industryId),
    ])
      .then(([newsRes, analysisRes, companiesRes]) => {
        if (!cancelled) {
          setNewsItems(newsRes.data ?? []);
          setAnalysis(analysisRes);
          setCompanies(companiesRes.companies ?? []);
          setError(null);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError((e as Error)?.message ?? "산업 데이터 로딩 실패");
          setNewsItems([]);
          setAnalysis(null);
          setCompanies([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [industryId]);

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

  // Use the selected industry data directly.
  // Since we populated all keys in industryDB, we don't need a fallback.
  const currentData = industryDB[selectedIndustry];

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
    let labels: string[] = [];
    switch (timeRange) {
      case "1M":
        labels = ["1주", "2주", "3주", "4주"];
        break;
      case "3M":
        labels = ["D-90", "D-60", "D-30", "Current"];
        break;
      case "6M":
        labels = ["1월", "2월", "3월", "4월", "5월", "6월"];
        break;
      case "1Y":
        labels = ["23.Q3", "23.Q4", "24.Q1", "24.Q2"];
        break;
    }

    // 결정적 값 생성 (industryId와 timeRange 기반)
    const seed = industryId * 100 + labels.length;
    const variations = [0.02, -0.015, 0.025, -0.01, 0.018, -0.022];

    const result = [];
    let current = currentData.indexValue;

    for (let i = labels.length - 1; i >= 0; i--) {
      if (i === labels.length - 1) {
        result.unshift({ time: labels[i], value: current });
      } else {
        const variationIndex = (seed + i) % variations.length;
        const change = currentData.indexValue * variations[variationIndex];
        current -= change;
        result.unshift({ time: labels[i], value: Math.round(current) });
      }
    }
    return result;
  }, [timeRange, currentData.indexValue, industryId]);

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
              {currentData.name.split(" (")[0]}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {currentData.indexName} 지수 및 주요 구성 종목 심층 분석
          </p>
        </div>
        <div className="relative">
          {/* Rounded-md */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value as IndustryKey)}
            className="appearance-none bg-white border border-gray-200 text-slate-700 text-sm rounded-md focus:ring-shinhan-blue focus:border-shinhan-blue block pl-4 pr-10 py-2.5 outline-none shadow-sm cursor-pointer min-w-[200px]"
          >
            {Object.values(industryDB).map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
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
        <GlassCard className="p-6 col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-shinhan-blue" />
                {currentData.indexName} 지수 추이
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-slate-900">
                  {currentData.indexValue.toLocaleString()}
                </span>
                <span
                  className={`font-medium px-2 py-0.5 rounded text-sm ${currentData.changeValue > 0 ? "text-red-500 bg-red-50" : "text-blue-500 bg-blue-50"}`}
                >
                  {currentData.changeValue > 0 ? "+" : ""}
                  {currentData.changeValue} (
                  {currentData.changeValue > 0 ? "+" : ""}
                  {currentData.changePercent}%)
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
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={
                        currentData.changeValue > 0 ? "#EF4444" : "#0046FF"
                      }
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        currentData.changeValue > 0 ? "#EF4444" : "#0046FF"
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
                  stroke={currentData.changeValue > 0 ? "#EF4444" : "#0046FF"}
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
            <p className="text-white/90 text-sm leading-relaxed">
              {analysis?.outlook ?? "전망 정보가 없습니다."}
            </p>
          )}
        </GlassCard>
      </div>

      {/* --- Top 3 Companies (Rankings) --- */}
      <h3 className="text-lg font-bold text-slate-700 mb-4 px-2">
        {currentData.name.split(" (")[0]} 산업 기업 순위
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
        {companies
          .slice(0, 3)
          .map((company: IndustryCompany, index: number) => {
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
                key={company.stockCode}
                className={containerClasses}
                onClick={() => handleCompanyClick(company.stockCode)}
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
                        {company.stockCode}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleToggleStar(e, company.stockCode)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <StarIcon isActive={starred.has(company.stockCode)} />
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
                      className={`text-sm font-bold px-2 py-0.5 rounded ${company.change?.startsWith("+") ? "text-red-500 bg-red-50" : "text-blue-500 bg-blue-50"}`}
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
                        {company.roe != null ? `${company.roe}%` : "-"}
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
                {companies.map((company: IndustryCompany, index: number) => (
                  <tr
                    key={company.stockCode}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => handleCompanyClick(company.stockCode)}
                  >
                    <td className="pl-6 pr-2 py-4">
                      <button
                        onClick={(e) => handleToggleStar(e, company.stockCode)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <StarIcon isActive={starred.has(company.stockCode)} />
                      </button>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <span className="font-bold text-slate-600 text-lg">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={`${company.name} logo`}
                          className="inline-block w-8 h-8 rounded-md object-cover"
                        />
                      ) : (
                        <span className="inline-flex w-8 h-8 rounded-md bg-white border border-gray-200 items-center justify-center font-bold text-slate-600 text-xs shadow-sm">
                          {company.name.charAt(0)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800 text-base">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700 text-base">
                      {company.price}
                    </td>
                    <td
                      className={`px-6 py-4 text-center font-medium ${company.change?.startsWith("+") ? "text-red-500" : "text-blue-500"}`}
                    >
                      {company.change}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-block">
                        <MiniChart
                          color={
                            company.change?.startsWith("+")
                              ? "#EF4444"
                              : "#3B82F6"
                          }
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-800">
                      {company.roe != null
                        ? `${company.roe >= 0 ? "+" : ""}${company.roe}%`
                        : "-"}
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
        <h3 className="text-lg font-bold text-slate-700 mb-4 px-2">
          나만의 저평가 우량주 발굴 (Parallel Coordinates)
        </h3>
        <p className="text-slate-500 mb-4 px-2">
          각 축을 드래그하여 조건을 설정하고, 조건에 맞는 종목을 찾아보세요
        </p>
        <ParallelCoordinatesChart
          data={SAMPLE_STOCKS}
          onFilterChange={setFilters}
          filters={filters}
          filteredIds={filteredIds}
          onStockSelect={setSelectedStock}
          selectedStockId={selectedStock?.id ?? null}
        />
      </div>

      {/* --- News Section --- */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-700 mb-4 px-2 flex items-center gap-2">
          뉴스 <ChevronRight size={18} />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newsItems.length > 0 ? (
            newsItems.slice(0, 6).map((news: IndustryNewsItem) => (
              <GlassCard
                key={news.newId}
                className="p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group flex items-start gap-4"
                onClick={() => setSelectedNews(news)}
              >
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-shinhan-blue transition-colors">
                    {news.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{news.summary}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{news.publishedAt}</span>
                  </div>
                </div>
                {/* Rounded-md */}
                <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                  {/* Placeholder for news image */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
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
                  {selectedNews.summary}
                </span>
                <span>{selectedNews.publishedAt}</span>
              </div>

              <div className="flex flex-col sm:flex-row-reverse gap-6 mb-6">
                {/* Rounded-md */}
                <div className="w-full sm:w-1/3 h-40 bg-gray-200 rounded-md flex-shrink-0"></div>
                <p className="text-slate-700 leading-loose text-lg flex-1">
                  {selectedNews.summary}
                </p>
                <p className="text-slate-700 leading-loose text-lg flex-1">
                  {selectedNews.url}
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
