import React, { useState, useMemo, useEffect, useCallback } from "react";
import GlassCard from "../components/Layout/GlassCard";
import ParallelCoordinatesChart from "../components/Charts/ParallelCoordinatesChart";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Info,
  ChevronDown,
  X,
  ChevronRight,
  Trophy,
  RotateCcw,
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
import type { IndustryCompany } from "../types";

// 산업 ID 매핑
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

interface AnalysisProps {
  setPage: (page: PageView) => void;
  initialIndustryId?: string;
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

const industryDB: Record<IndustryKey, IndustryData> = {
  finance: {
    id: "finance",
    name: "금융 (Finance)",
    indexName: "KRX Banks",
    indexValue: 765.42,
    changeValue: 12.5,
    changePercent: 1.66,
    outlook:
      "최근 고금리 기조 유지와 정부의 밸류업 프로그램 시행으로 인해 금융 섹터는 구조적인 재평가 국면에 진입했습니다. 은행주를 중심으로 주주환원율이 30%를 상회하며 배당 매력이 부각되고 있으며, 비이자 이익 부문의 성장도 가시화되고 있습니다. 다만, 하반기 부동산 PF 관련 충당금 이슈가 단기적인 변동성을 확대시킬 수 있으나, 기초 체력(Fundamentals)은 여전히 견고하다는 평가가 지배적입니다.",
    insights: {
      positive:
        "정부의 기업 밸류업 프로그램 지속 추진으로 저PBR 금융주의 주주환원 확대 기대감이 지속되고 있습니다.",
      risk: "부동산 PF 부실 우려에 따른 대손충당금 적립 부담이 하반기 실적의 주요 변수로 작용할 전망입니다.",
    },
    companies: [
      {
        name: "신한지주",
        code: "055550",
        price: "78,200",
        change: "+0.51%",
        per: 4.82,
        pbr: 0.45,
        roe: 10.2,
        aiScore: 85,
        marketCap: "40조 1,230억",
      },
      {
        name: "KB금융",
        code: "105560",
        price: "72,100",
        change: "+1.12%",
        per: 5.1,
        pbr: 0.48,
        roe: 9.8,
        aiScore: 82,
        marketCap: "38조 5,400억",
      },
      {
        name: "하나금융",
        code: "086790",
        price: "58,400",
        change: "-0.32%",
        per: 4.2,
        pbr: 0.38,
        roe: 9.5,
        aiScore: 78,
        marketCap: "28조 2,100억",
      },
      {
        name: "우리금융",
        code: "316140",
        price: "14,800",
        change: "+0.15%",
        per: 3.95,
        pbr: 0.35,
        roe: 9.1,
        aiScore: 75,
        marketCap: "12조 4,500억",
      },
      {
        name: "카카오뱅크",
        code: "323410",
        price: "25,300",
        change: "-1.50%",
        per: 35.2,
        pbr: 2.1,
        roe: 5.4,
        aiScore: 68,
        marketCap: "10조 8,000억",
      },
      {
        name: "기업은행",
        code: "024110",
        price: "13,200",
        change: "+0.40%",
        per: 3.5,
        pbr: 0.31,
        roe: 9.2,
        aiScore: 72,
        marketCap: "9조 5,000억",
      },
      {
        name: "BNK금융",
        code: "138930",
        price: "8,400",
        change: "-0.20%",
        per: 3.2,
        pbr: 0.25,
        roe: 8.5,
        aiScore: 65,
        marketCap: "2조 7,000억",
      },
    ],
    news: [],
  },
  semicon: {
    id: "semicon",
    name: "반도체 (Semicon)",
    indexName: "KRX Semicon",
    indexValue: 3420.5,
    changeValue: 45.2,
    changePercent: 1.34,
    outlook:
      "AI 반도체 수요의 폭발적인 증가와 메모리 반도체 가격 반등이 맞물려 본격적인 실적 개선 구간에 진입했습니다. HBM(고대역폭메모리) 시장 선점을 위한 경쟁이 치열해지는 가운데, 레거시 공정의 가동률 회복도 긍정적입니다. 다만, 글로벌 경기 둔화에 따른 스마트폰 및 PC 수요 회복 지연은 리스크 요인입니다.",
    insights: {
      positive: "AI 서버 투자 확대로 HBM 등 고부가가치 제품 수요 급증",
      risk: "중국의 레거시 반도체 추격 및 지정학적 리스크",
    },
    companies: [
      {
        name: "삼성전자",
        code: "005930",
        price: "73,400",
        change: "+0.96%",
        per: 15.2,
        pbr: 1.45,
        roe: 8.5,
        aiScore: 92,
        marketCap: "430조 2,100억",
      },
      {
        name: "SK하이닉스",
        code: "000660",
        price: "164,500",
        change: "+2.10%",
        per: -15.4,
        pbr: 2.1,
        roe: -5.2,
        aiScore: 95,
        marketCap: "119조 8,000억",
      },
      {
        name: "한미반도체",
        code: "042700",
        price: "142,000",
        change: "+5.40%",
        per: 65.2,
        pbr: 12.5,
        roe: 35.4,
        aiScore: 88,
        marketCap: "13조 5,000억",
      },
      {
        name: "DB하이텍",
        code: "000990",
        price: "45,200",
        change: "-0.50%",
        per: 8.5,
        pbr: 1.2,
        roe: 12.5,
        aiScore: 70,
        marketCap: "2조 100억",
      },
    ],
    news: [],
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
  const [selectedNews, setSelectedNews] = useState<IndustryNewsItem | null>(
    null,
  );

  // API 데이터 state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<IndustryCompany[]>([]);
  const [analysis, setAnalysis] = useState<{
    outlook?: string;
    insights?: { positive: string; risk: string };
  } | null>(null);

  // 뉴스 데이터 state
  const [industryNews, setIndustryNews] = useState<IndustryNewsItem[]>([]);

  // Parallel Coordinates Chart State
  const [filters, setFilters] = useState<Partial<Record<AxisKey, BrushRange>>>(
    {},
  );
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const industryId = INDUSTRY_ID_BY_KEY[selectedIndustry];

  // API 호출 함수 (재시도용)
  const fetchIndustryData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [newsRes, analysisRes, companiesRes] = await Promise.all([
        getIndustryNews(industryId),
        getIndustryAnalysis(industryId),
        getIndustryCompanies(industryId),
      ]);

      setIndustryNews(newsRes.data ?? []);
      setAnalysis(analysisRes);
      setCompanies(companiesRes.data ?? []);
      setError(null);
    } catch (e) {
      setError((e as Error)?.message ?? "산업 데이터 로딩 실패");
      setIndustryNews([]);
      setAnalysis(null);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [industryId]);

  // 초기 데이터 로드 및 산업 변경 시 재로드
  useEffect(() => {
    fetchIndustryData();
  }, [fetchIndustryData]);

  // Use the selected industry data directly.
  // Since we populated all keys in industryDB, we don't need a fallback.
  const currentData = industryDB[selectedIndustry];

  // API 데이터를 Stock 형식으로 변환 (ParallelCoordinatesChart용)
  const stocksFromApi: Stock[] = useMemo(() => {
    return companies.map((company) => ({
      id: String(company.companyId),
      name: company.name,
      sector: currentData.name.split(" (")[0],
      per: company.per ?? 0,
      pbr: company.pbr ?? 0,
      roe: company.roe ?? 0,
      debtRatio: 0, // API에서 제공되지 않으면 기본값
      divYield: 0, // API에서 제공되지 않으면 기본값
    }));
  }, [companies, currentData.name]);

  const filteredIds = useMemo(() => {
    const ids = new Set<string>();
    stocksFromApi.forEach((stock) => {
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
  }, [filters, stocksFromApi]);

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

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-6 animate-pulse min-h-[260px]">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                  <div>
                    <div className="w-16 h-3 bg-gray-200 rounded mb-2" />
                    <div className="w-12 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
              <div className="text-center mb-6">
                <div className="w-24 h-6 bg-gray-200 rounded mx-auto mb-2" />
                <div className="w-20 h-5 bg-gray-200 rounded mx-auto" />
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-16 h-4 bg-gray-200 rounded mx-auto" />
                  <div className="w-16 h-4 bg-gray-200 rounded mx-auto" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* 에러 UI with 재시도 */}
      {error && !loading && (
        <div className="mb-8 p-8 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchIndustryData}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={16} />
            다시 시도
          </button>
        </div>
      )}

      {/* 정상 데이터 표시 */}
      {!loading && !error && (
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
                  key={company.companyId}
                  className={containerClasses}
                  onClick={() => handleCompanyClick(String(company.companyId))}
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
                          {company.companyId}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) =>
                        handleToggleStar(e, String(company.companyId))
                      }
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <StarIcon
                        isActive={starred.has(String(company.companyId))}
                      />
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
                          {company.marketAmount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 mb-1">
                          ROE
                        </div>
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
      )}

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
                    key={company.companyId}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() =>
                      handleCompanyClick(String(company.companyId))
                    }
                  >
                    <td className="pl-6 pr-2 py-4">
                      <button
                        onClick={(e) =>
                          handleToggleStar(e, String(company.companyId))
                        }
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <StarIcon
                          isActive={starred.has(String(company.companyId))}
                        />
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
                      {company.marketAmount}
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
        <div className="mb-4 px-2">
          <h3 className="text-lg font-bold text-slate-700">
            나만의 저평가 우량주 발굴 (Parallel Coordinates)
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            각 축을 드래그하여 조건을 설정하고, 조건에 맞는 종목을 찾아보세요
          </p>
        </div>

        <ParallelCoordinatesChart
          data={stocksFromApi}
          onFilterChange={setFilters}
          filters={filters}
          filteredIds={filteredIds}
          onStockSelect={setSelectedStock}
          selectedStockId={selectedStock?.id ?? null}
        />

        {/* Filter Summary */}
        <div className="mt-4 px-2 flex items-center justify-between text-sm text-slate-500">
          <span>
            필터링 결과:{" "}
            <strong className="text-shinhan-blue">{filteredIds.size}</strong>개
            종목
          </span>
          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => {
                setFilters({});
                setSelectedStock(null);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <RotateCcw size={16} />
              필터 초기화
            </button>
          )}
        </div>

        {/* Selected Stock Info */}
        {selectedStock && (
          <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {selectedStock.name}
                </h3>
                <span className="text-sm text-slate-500">
                  {selectedStock.sector}
                </span>
              </div>
              <button
                onClick={() => {
                  if (setCompanyCode) {
                    setCompanyCode(selectedStock.id);
                    setPage(PageView.COMPANY_DETAIL);
                  }
                }}
                className="px-6 py-3 bg-shinhan-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                상세 분석 <ArrowRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-4 mt-6">
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-xs text-slate-500 mb-1">PER</div>
                <div className="text-xl font-bold text-slate-900">
                  {selectedStock.per.toFixed(1)}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-xs text-slate-500 mb-1">PBR</div>
                <div className="text-xl font-bold text-slate-900">
                  {selectedStock.pbr.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-xs text-slate-500 mb-1">ROE</div>
                <div className="text-xl font-bold text-slate-900">
                  {selectedStock.roe.toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-xs text-slate-500 mb-1">부채비율</div>
                <div className="text-xl font-bold text-slate-900">
                  {selectedStock.debtRatio}%
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-xs text-slate-500 mb-1">배당수익률</div>
                <div className="text-xl font-bold text-slate-900">
                  {selectedStock.divYield.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtered Stocks List & Filter Panel - 2 Column Layout */}
        {Object.keys(filters).length > 0 &&
          filteredIds.size > 0 &&
          !selectedStock && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Stocks List */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-[#0046FF] text-white border-b border-[#0036CC]">
                  <h4 className="font-semibold">
                    필터링된 기업 목록 ({filteredIds.size}개)
                  </h4>
                </div>
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {stocksFromApi
                    .filter((stock) => filteredIds.has(stock.id))
                    .map((stock) => (
                      <div
                        key={stock.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-blue-50/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedStock(stock)}
                      >
                        <div className="flex items-center gap-4">
                          <span className="inline-flex w-10 h-10 rounded-lg bg-slate-100 items-center justify-center font-bold text-slate-600 text-sm">
                            {stock.name.charAt(0)}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800">
                              {stock.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {stock.sector}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-400" />
                      </div>
                    ))}
                </div>
              </div>

              {/* Right: Filter Panel */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-fit">
                <div className="px-6 py-4 bg-[#0046FF] border-b border-[#0036CC]">
                  <h4 className="font-semibold text-white">적용된 필터</h4>
                </div>
                <div className="p-4 space-y-3">
                  {(Object.keys(filters) as AxisKey[]).map((key) => {
                    const range = filters[key];
                    if (!range) return null;
                    const labels: Record<AxisKey, string> = {
                      per: "PER",
                      pbr: "PBR",
                      roe: "ROE",
                      debtRatio: "부채비율",
                      divYield: "배당수익률",
                    };
                    return (
                      <div
                        key={key}
                        className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">
                            {labels[key]}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {range.min.toFixed(1)} ~ {range.max.toFixed(1)}
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={`${labels[key]} 필터제거`}
                          onClick={() => {
                            const newFilters = { ...filters };
                            delete newFilters[key];
                            setFilters(newFilters);
                          }}
                          className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition
                                  hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200
                                  opacity-70 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
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
                key={news.newId}
                className="p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group flex items-start gap-4"
                onClick={() => setSelectedNews(news)}
              >
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-shinhan-blue transition-colors">
                    {news.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{news.source}</span>
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
                  {selectedNews.source}
                </span>
                <span>{selectedNews.publishedAt}</span>
              </div>

              <div className="flex flex-col sm:flex-row-reverse gap-6 mb-6">
                {/* Rounded-md */}
                <div className="w-full sm:w-1/3 h-40 bg-gray-200 rounded-md flex-shrink-0"></div>
                <p className="text-slate-700 leading-loose text-lg flex-1">
                  {selectedNews.summary}
                </p>
                <a
                  href={selectedNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0046FF] hover:underline text-sm"
                >
                  원문보기 →
                </a>
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
