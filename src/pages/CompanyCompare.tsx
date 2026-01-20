import React, { useState, useMemo, useEffect } from "react";
import GlassCard from "../components/Layout/GlassCard";
import {
  ArrowLeft,
  Plus,
  X,
  Search,
  TrendingUp,
  BarChart3,
  HelpCircle,
  ChevronDown,
  Check,
  Edit2,
  CheckCircle2,
  Radar,
} from "lucide-react";
import { PageView } from "../types";
import type {
  Comparison,
  CompareCompany,
  ComparisonListItem,
  TimeRange,
  OhlcvData,
} from "../types";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ReferenceArea,
  ReferenceLine,
  RadarChart,
  Radar as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  getComparisons,
  getComparison,
  createComparison,
  addCompany,
  removeCompany,
  updateComparisonName,
  deleteComparison,
} from "../api/comparison";
import {
  searchCompanies,
  getStockOhlcv,
  type CompanySearchItem,
} from "../api/company";
import type { OhlcvItem } from "../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CompareProps {
  setPage: (page: PageView) => void;
}

type MetricType = "revenue" | "operating" | "net" | "marketCap";
type DetailMetricKey =
  | "eps"
  | "operatingMargin"
  | "roe"
  | "yoy"
  | "qoq"
  | "pbr"
  | "per";

interface MetricOption {
  id: MetricType;
  label: string;
  unit: string;
}

const metricOptions: MetricOption[] = [
  { id: "revenue", label: "매출액", unit: "십억원" },
  { id: "operating", label: "영업이익", unit: "십억원" },
  { id: "net", label: "순이익", unit: "십억원" },
  { id: "marketCap", label: "시가총액", unit: "조원" },
];

const CHART_COLORS = [
  "#0046FF",
  "#DDBB66",
  "#94A3B8",
  "#EF4444",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#6366F1",
];

const detailedMetricsInfo: Record<
  DetailMetricKey,
  { title: string; desc: string; formula: string }
> = {
  eps: {
    title: "EPS",
    desc: "주당 순이익(Earning Per Share)으로, 주식 1주가 1년 동안 벌어들인 실제 돈이 얼마인지를 나타내는 지표입니다.",
    formula: "순이익 / 발행주식 수",
  },
  operatingMargin: {
    title: "영업이익률",
    desc: "기업이 본업인 장사를 통해 순수하게 얼마나 효율적으로 이익을 남기고 있는지를 보여주는 지표입니다.",
    formula: "영업이익 / 매출액 × 100 (%)",
  },
  roe: {
    title: "ROE",
    desc: "자기자본이익률로, 기업이 자기자본을 통해 1년간 얼마를 벌었는지를 보여주는 지표입니다. 높을수록 투자 가치가 높습니다.",
    formula: "순이익 / 자기자본 × 100 (%)",
  },
  yoy: {
    title: "YoY",
    desc: "전년 대비 성장률(Year on Year)로, 계절적 요인을 배제하고 작년 같은 기간과 비교했을 때 기업이 얼마나 성장했는지 보여줍니다.",
    formula: "(당분기 매출 / 전년 동기 매출 - 1) × 100 (%)",
  },
  qoq: {
    title: "QoQ",
    desc: "전분기 대비 증감률(Quarter on Quarter)로, 직전 분기와 비교하여 기업의 실적이 최근에 개선되고 있는지 보여줍니다.",
    formula: "(당분기 매출 / 전 분기 매출 - 1) × 100 (%)",
  },
  pbr: {
    title: "PBR",
    desc: "주가 순자산 비율(Price Book-value Ratio)로, 기업이 보유한 전체 재산(청산 가치)에 비해 주가가 어떤 수준인지 보여줍니다.",
    formula: "시가총액 / 순자산",
  },
  per: {
    title: "PER",
    desc: "주가 수익 비율(Price Earning Ratio)로, 기업이 버는 돈에 비해 주가가 얼마나 높게 형성되어 있는지 보여주는 지표입니다.",
    formula: "시가총액 / 순이익",
  },
};

// -- Main Page Component --

const CompanyCompare: React.FC<CompareProps> = ({ setPage }) => {
  // -----------------------------
  // Server state (TanStack Query)
  // -----------------------------
  const queryClient = useQueryClient();

  const [activeSetId, setActiveSetId] = useState<number | null>(null);

  // 비교 세트 목록 조회
  const comparisonsQuery = useQuery({
    queryKey: ["comparisons"],
    queryFn: async () => {
      const res = await getComparisons();
      return (res.data?.comparisons ?? []) as ComparisonListItem[];
    },
  });

  const comparisonList = comparisonsQuery.data ?? [];

  // 비교 세트 목록이 로드되면 첫 번째 세트를 기본 선택
  useEffect(() => {
    if (!activeSetId && comparisonList.length > 0) {
      setActiveSetId(comparisonList[0].id);
    }
  }, [activeSetId, comparisonList]);

  // 비교 세트 상세 조회
  const comparisonDetailQuery = useQuery({
    queryKey: ["comparison", activeSetId],
    enabled: !!activeSetId,
    queryFn: async () => {
      const res = await getComparison(activeSetId as number);
      console.log("Comparison detail response:", res);
      // 백엔드 응답이 { data: {...} } 형식일 수 있음
      return res.data ?? res;
    },
  });

  const activeComparison = (comparisonDetailQuery.data ??
    null) as Comparison | null;

  // 이름 편집용 임시 값 동기화
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempSetName, setTempSetName] = useState("");
  useEffect(() => {
    if (activeComparison?.name) setTempSetName(activeComparison.name);
    setIsEditingName(false);
  }, [activeComparison?.name]);

  // -----------------------------
  // UI state (local)
  // -----------------------------
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // State for Metrics (Top Charts)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("revenue");
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");

  // State for Detailed Metrics (Bottom Section)
  const [activeMetrics, setActiveMetrics] = useState<DetailMetricKey[]>([
    "roe",
  ]);

  // State for Radar Chart
  const [selectedRadarCompany, setSelectedRadarCompany] = useState<string>("");

  // -----------------------------
  // Search (debounce + query)
  // -----------------------------
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const searchQueryResult = useQuery({
    queryKey: ["companySearch", debouncedSearch],
    enabled: !!debouncedSearch.trim(),
    queryFn: async () => {
      const res = await searchCompanies(debouncedSearch);
      // 백엔드 응답: { data: { results: [...] } }
      return (res.data?.data?.results ?? []) as CompanySearchItem[];
    },
  });

  const searchResults = searchQueryResult.data ?? [];
  const isSearching = searchQueryResult.isFetching;

  // -----------------------------
  // OHLCV (주가 추이) query
  // -----------------------------
  const ohlcvQuery = useQuery({
    queryKey: [
      "ohlcv",
      activeSetId,
      timeRange,
      activeComparison?.companies?.map((c) => c.stock_code).join(",") ?? "",
    ],
    enabled: !!activeComparison?.companies?.length,
    queryFn: async () => {
      const companies = activeComparison?.companies ?? [];

      const intervalMap: Record<TimeRange, string> = {
        "1M": "1d",
        "3M": "1d",
        "6M": "1d",
        "1Y": "1d",
      };

      const results: Record<string, OhlcvItem[]> = {};

      await Promise.all(
        companies.map(async (company) => {
          try {
            const response = await getStockOhlcv(
              company.stock_code,
              intervalMap[timeRange],
            );

            const rawData = response.data?.data ?? [];

            results[company.companyName] = (rawData as OhlcvData[])
              .map((item) => {
                const dateObj = new Date(item.date);
                const timeStamp = isNaN(dateObj.getTime())
                  ? 0
                  : Math.floor(dateObj.getTime() / 1000);

                return {
                  time: timeStamp,
                  open: Number(item.open),
                  high: Number(item.high),
                  low: Number(item.low),
                  close: Number(item.close),
                  volume: Number(item.volume),
                  amount: 0,
                };
              })
              .filter((item) => item.time !== 0);
          } catch (innerError) {
            console.warn(`${company.companyName} OHLCV 변환 실패`, innerError);
            results[company.companyName] = [];
          }
        }),
      );

      return results;
    },
  });

  const ohlcvData = ohlcvQuery.data ?? {};

  const currentMetricOption =
    metricOptions.find((o) => o.id === selectedMetric) || metricOptions[0];

  // -----------------------------
  // Mutations
  // -----------------------------
  const createSetMutation = useMutation({
    mutationFn: async (name: string) => {
      return await createComparison({ name, companies: [] });
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["comparisons"] });
      // API 응답: { comparisonId: 1, ... }
      const newId = res.comparisonId ?? res.id;
      if (newId != null) {
        setActiveSetId(newId);
      }
    },
  });

  const addCompanyMutation = useMutation({
    mutationFn: async (stockCode: string) => {
      if (!activeSetId) throw new Error("activeSetId가 없습니다.");
      console.log("Adding company:", {
        comparison_id: activeSetId,
        company: stockCode,
      });
      await addCompany(activeSetId, { company: stockCode });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comparison", activeSetId],
      });
      setIsSearchOpen(false);
      setSearchQuery("");
    },
    onError: (error: unknown) => {
      // 에러 응답 상세 로깅
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: unknown } };
        console.error(
          "API Error Response:",
          JSON.stringify(axiosError.response?.data, null, 2),
        );
      }
    },
  });

  const removeCompanyMutation = useMutation({
    mutationFn: async (stockCode: string) => {
      if (!activeSetId) throw new Error("activeSetId가 없습니다.");
      await removeCompany(activeSetId, stockCode);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comparison", activeSetId],
      });
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!activeSetId) throw new Error("activeSetId가 없습니다.");
      await updateComparisonName(activeSetId, name);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["comparisons"] });
      await queryClient.invalidateQueries({
        queryKey: ["comparison", activeSetId],
      });
      setIsEditingName(false);
    },
  });

  const deleteSetMutation = useMutation({
    mutationFn: async (comparisonId: number) => {
      await deleteComparison(comparisonId);
    },
    onSuccess: async (_res, deletedId) => {
      await queryClient.invalidateQueries({ queryKey: ["comparisons"] });
      // 삭제된 세트가 현재 선택된 세트면 다른 세트 선택
      if (activeSetId === deletedId) {
        const remaining = comparisonList.filter((c) => c.id !== deletedId);
        setActiveSetId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
  });

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleAddSet = async () => {
    const newSetName = `비교 세트 ${comparisonList.length + 1}`;
    try {
      await createSetMutation.mutateAsync(newSetName);
    } catch (e) {
      console.error("비교 세트 생성 실패:", e);
    }
  };

  const handleRemoveCompany = async (stock_code: string) => {
    try {
      await removeCompanyMutation.mutateAsync(stock_code);
    } catch (e) {
      console.error("기업 제거 실패:", e);
    }
  };

  const handleAddCompany = async (stockCode: string) => {
    try {
      await addCompanyMutation.mutateAsync(stockCode);
    } catch (e) {
      console.error("기업 추가 실패:", e);
    }
  };

  const handleSaveName = async () => {
    if (!activeSetId || !tempSetName.trim()) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateNameMutation.mutateAsync(tempSetName.trim());
    } catch (e) {
      console.error("이름 변경 실패:", e);
      setTempSetName(activeComparison?.name ?? "");
      setIsEditingName(false);
    }
  };

  const handleDeleteSet = async (e: React.MouseEvent, comparisonId: number) => {
    e.stopPropagation(); // 버튼 클릭 시 세트 선택 방지
    try {
      await deleteSetMutation.mutateAsync(comparisonId);
    } catch (err) {
      console.error("비교 세트 삭제 실패:", err);
    }
  };

  const toggleMetric = (key: DetailMetricKey) => {
    if (activeMetrics.includes(key)) {
      setActiveMetrics(activeMetrics.filter((k) => k !== key));
    } else {
      setActiveMetrics([...activeMetrics, key]);
    }
  };

  // -----------------------------
  // Chart Data (Memoized)
  // -----------------------------

  // 차트 데이터 생성 (API 데이터 기반)
  const financialChartData = useMemo(() => {
    if (!activeComparison?.companies?.length) return [];

    const metricMap: Record<MetricType, keyof CompareCompany> = {
      revenue: "revenue",
      operating: "operatingProfit",
      net: "netIncome",
      marketCap: "marketCap",
    };

    return [{ year: "현재" }].map((item) => {
      const dataPoint: Record<string, string | number> = { ...item };
      activeComparison.companies.forEach((company) => {
        dataPoint[company.companyName] =
          company[metricMap[selectedMetric]] ?? 0;
      });
      return dataPoint;
    });
  }, [activeComparison?.companies, selectedMetric]);

  // 투자지표 차트 데이터
  const dynamicDetails = useMemo(() => {
    if (!activeComparison?.companies?.length) return {};

    const result: Record<
      string,
      {
        title: string;
        desc: string;
        formula: string;
        data: { name: string; value: number }[];
      }
    > = {};
    activeMetrics.forEach((key) => {
      const info = detailedMetricsInfo[key];
      const metricKeyMap: Partial<
        Record<DetailMetricKey, keyof CompareCompany>
      > = {
        roe: "roe",
        per: "per",
        pbr: "pbr",
        eps: "eps",
        yoy: "yoy",
        qoq: "qoq",
        operatingMargin: "operatingMargin",
      };
      const apiKey = metricKeyMap[key];

      const chartData = activeComparison.companies.map((company) => ({
        name: company.companyName,
        value: apiKey ? ((company[apiKey] as number) ?? 0) : 0,
      }));
      result[key] = { ...info, data: chartData };
    });
    return result;
  }, [activeComparison?.companies, activeMetrics]);

  // PER-YoY Matrix 차트 데이터
  const perYoyChartData = useMemo(() => {
    if (!activeComparison?.companies?.length) return [];
    return activeComparison.companies.map((company, index) => ({
      name: company.companyName,
      per: company.per ?? 0,
      yoy: company.yoy ?? 0,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [activeComparison?.companies]);

  const avgPer = useMemo(() => {
    if (!perYoyChartData.length) return 15;
    const sum = perYoyChartData.reduce((acc, d) => acc + d.per, 0);
    return sum / perYoyChartData.length;
  }, [perYoyChartData]);

  //ReferenceArea 경계값 동적 범위 계산
  const { minYoy, maxYoy, maxPer } = useMemo(() => {
    if (!perYoyChartData.length)
      return { minYoy: -100, maxYoy: 100, maxPer: 100 };
    const yoys = perYoyChartData.map((d) => d.yoy);
    const pers = perYoyChartData.map((d) => d.per);
    return {
      minYoy: Math.min(-10, ...yoys) - 10,
      maxYoy: Math.max(10, ...yoys) + 10,
      maxPer: Math.max(avgPer + 10, ...pers) + 10,
    };
  }, [perYoyChartData, avgPer]);

  // Radar Chart: 선택된 기업 초기화
  useEffect(() => {
    if (activeComparison?.companies?.length && !selectedRadarCompany) {
      setSelectedRadarCompany(activeComparison.companies[0].companyName);
    }
  }, [activeComparison?.companies, selectedRadarCompany]);

  // Radar Chart 데이터 (산업 평균 대비)
  const radarData = useMemo(() => {
    if (!activeComparison?.companies?.length) return [];

    const selectedCompany = activeComparison.companies.find(
      (c) => c.companyName === selectedRadarCompany,
    );
    if (!selectedCompany) return [];

    // 산업 평균 계산
    const avgRoe =
      activeComparison.companies.reduce((sum, c) => sum + (c.roe ?? 0), 0) /
      activeComparison.companies.length;
    const avgPer =
      activeComparison.companies.reduce((sum, c) => sum + (c.per ?? 0), 0) /
      activeComparison.companies.length;
    const avgPbr =
      activeComparison.companies.reduce((sum, c) => sum + (c.pbr ?? 0), 0) /
      activeComparison.companies.length;
    const avgYoy =
      activeComparison.companies.reduce((sum, c) => sum + (c.yoy ?? 0), 0) /
      activeComparison.companies.length;
    const avgOperatingMargin =
      activeComparison.companies.reduce(
        (sum, c) => sum + (c.operatingMargin ?? 0),
        0,
      ) / activeComparison.companies.length;

    return [
      { subject: "ROE", A: selectedCompany.roe ?? 0, B: avgRoe, fullMark: 25 },
      { subject: "PER", A: selectedCompany.per ?? 0, B: avgPer, fullMark: 50 },
      { subject: "PBR", A: selectedCompany.pbr ?? 0, B: avgPbr, fullMark: 5 },
      { subject: "YoY", A: selectedCompany.yoy ?? 0, B: avgYoy, fullMark: 30 },
      {
        subject: "영업이익률",
        A: selectedCompany.operatingMargin ?? 0,
        B: avgOperatingMargin,
        fullMark: 25,
      },
    ];
  }, [activeComparison?.companies, selectedRadarCompany]);
  //radarDada 선언
  const radarMax = useMemo(() => {
    const maxFull = radarData.length
      ? Math.max(...radarData.map((d) => d.fullMark ?? 0))
      : 0;
    return Math.max(25, maxFull);
  }, [radarData]);

  // 주가 추이 차트 데이터 (OHLCV API 기반)
  const trendChartData = useMemo(() => {
    if (!activeComparison?.companies?.length) return [];

    // 데이터 포인트 수 결정
    const dataPointsMap: Record<TimeRange, number> = {
      "1M": 22, // 약 1개월 영업일
      "3M": 65, // 약 3개월 영업일
      "6M": 130, // 약 6개월 영업일
      "1Y": 250, // 약 1년 영업일
    };
    const maxPoints = dataPointsMap[timeRange];

    // OHLCV 데이터가 있으면 실제 데이터 사용
    const hasOhlcvData = Object.keys(ohlcvData).length > 0;

    if (hasOhlcvData) {
      // 모든 기업의 데이터 길이 중 최소값 찾기
      const minLength = Math.min(
        ...activeComparison.companies.map(
          (c) => ohlcvData[c.companyName]?.length ?? 0,
        ),
      );
      const actualPoints = Math.min(minLength, maxPoints);

      if (actualPoints === 0) return [];

      const data: Record<string, string | number>[] = [];
      for (let i = 0; i < actualPoints; i++) {
        const point: Record<string, string | number> = {};
        activeComparison.companies.forEach((company) => {
          const companyOhlcv = ohlcvData[company.companyName];
          if (companyOhlcv && companyOhlcv[i]) {
            // 첫 번째 항목에서만 날짜 설정
            if (!point.date) {
              const timestamp = companyOhlcv[i].time;
              const dateObj = new Date(timestamp * 1000);
              point.date = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            }
            point[company.companyName] = companyOhlcv[i].close;
          }
        });
        if (point.date) data.push(point);
      }
      return data;
    }

    // OHLCV 데이터가 없으면 빈 배열 반환 (로딩 중이거나 에러)
    return [];
  }, [activeComparison?.companies, timeRange, ohlcvData]);

  return (
    <div className="animate-fade-in pb-12 relative">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setPage(PageView.DASHBOARD)}
          className="flex items-center text-slate-500 hover:text-shinhan-blue transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          대시보드
        </button>
        <h1 className="text-xl font-bold text-slate-800 hidden md:block">
          기업 비교 분석
        </h1>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* -- Left Sidebar for Sets -- */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            <GlassCard className="p-4 bg-white/60">
              <h2 className="text-sm font-bold text-slate-500 mb-4 px-2 uppercase tracking-wider">
                나의 비교 세트
              </h2>
              <div className="space-y-2">
                {comparisonList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveSetId(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                      activeSetId === item.id
                        ? "bg-shinhan-blue text-white shadow-lg shadow-blue-500/30"
                        : "hover:bg-gray-100 text-slate-600 hover:text-slate-800 hover:shadow-sm"
                    }`}
                  >
                    <span className="font-medium text-sm truncate max-w-[150px]">
                      {item.name}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSet(e, item.id)}
                      disabled={deleteSetMutation.isPending}
                      className={`p-1 rounded-full transition-colors flex-shrink-0 ${
                        activeSetId === item.id
                          ? "hover:bg-white/20 text-white"
                          : "hover:bg-gray-200 text-gray-400 hover:text-red-500"
                      } disabled:opacity-50`}
                      title="세트 삭제"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddSet}
                disabled={createSetMutation.isPending}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-shinhan-blue hover:text-shinhan-blue hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                <Plus size={16} />
                세트 추가하기
              </button>
            </GlassCard>
          </div>
        </div>

        {/* -- Main Content Area -- */}
        <div className="flex-1 space-y-8">
          {/* 1. Header & Company Chips */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <input
                    type="text"
                    value={tempSetName}
                    onChange={(e) => setTempSetName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    autoFocus
                    className="text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-[#0046FF] focus:outline-none w-full px-1"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 text-[#0046FF] hover:bg-blue-50 rounded-full"
                  >
                    <CheckCircle2 size={24} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {activeComparison?.name ?? "비교 세트 선택"}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 text-gray-400 hover:text-[#0046FF] hover:bg-blue-50 rounded-lg transition-colors"
                    title="이름 변경"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeComparison?.companies?.map((company) => (
                <div
                  key={company.stock_code}
                  className="flex items-center gap-2 pl-4 pr-2 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-slate-700"
                >
                  <span className="font-bold text-sm">
                    {company.companyName}
                  </span>
                  <button
                    onClick={() => handleRemoveCompany(company.stock_code)}
                    disabled={removeCompanyMutation.isPending}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {(activeComparison?.companies?.length ?? 0) < 5 ? (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-shinhan-light/50 text-shinhan-blue rounded-full border border-blue-100 hover:bg-shinhan-light hover:border-blue-200 transition-all group"
                >
                  <Plus
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-bold">기업 추가</span>
                </button>
              ) : (
                <span className="text-xs text-gray-400 px-2">최대 5개</span>
              )}
            </div>
          </div>

          {/* 2. Charts Section - Separated Rows */}
          <div className="space-y-6">
            {/* Row 1: Financial Metrics Comparison (Bar Chart) */}
            <GlassCard className="p-6 hover:shadow-none">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={20} className="text-shinhan-blue" />
                  {currentMetricOption.label} 비교 (단위:{" "}
                  {currentMetricOption.unit})
                </h3>

                <div className="relative">
                  <button
                    onClick={() =>
                      setIsMetricDropdownOpen(!isMetricDropdownOpen)
                    }
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 transition-colors shadow-sm"
                  >
                    {currentMetricOption.label}{" "}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isMetricDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isMetricDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsMetricDropdownOpen(false)}
                      ></div>
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-xl z-20 py-1 animate-fade-in-up">
                        {metricOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedMetric(option.id);
                              setIsMetricDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              selectedMetric === option.id
                                ? "bg-blue-50 text-shinhan-blue font-bold"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={financialChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    {/* Dynamically render bars for each company in the set */}
                    {activeComparison?.companies?.map((company, index) => (
                      <Bar
                        key={company.stock_code}
                        dataKey={company.companyName}
                        name={company.companyName}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Row 2: Stock Price Trend (Line Chart) */}
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-shinhan-blue" />
                  주가 추이 (최근 {timeRange})
                </h3>
                <div className="flex gap-2">
                  {(["1M", "3M", "6M", "1Y"] as TimeRange[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setTimeRange(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        timeRange === p
                          ? "bg-shinhan-blue text-white shadow-md shadow-blue-300"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    {/* Dynamically render lines for each company */}
                    {activeComparison?.companies?.map((company, index) => (
                      <Line
                        key={company.stock_code}
                        type="monotone"
                        dataKey={company.companyName}
                        name={company.companyName}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Row 3: PER-YoY Matrix (Quadrant Style) */}
            <GlassCard className="p-6">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <BarChart3 size={18} className="text-shinhan-blue" />
                이익 성장성 대비 저평가 분석
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                PER(주가수익비율)과 YoY(전년 대비 성장률)를 기준으로 기업의
                가치와 성장성을 비교합니다.
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      dataKey="yoy"
                      name="YoY"
                      unit="%"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      label={{
                        value: "YoY 성장률 (%)",
                        position: "bottom",
                        offset: 0,
                        style: { fontSize: 12, fill: "#64748b" },
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="per"
                      name="PER"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      label={{
                        value: "PER (배)",
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: 12, fill: "#64748b" },
                      }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value, name) => {
                        const numValue = typeof value === "number" ? value : 0;
                        return [
                          name === "PER"
                            ? `${numValue.toFixed(1)}배`
                            : `${numValue.toFixed(1)}%`,
                          name,
                        ];
                      }}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.name ?? ""
                      }
                    />
                    {/* 사분면 구분 */}
                    <ReferenceArea
                      x1={0}
                      x2={maxYoy}
                      y1={0}
                      y2={avgPer}
                      fill="#dcfce7"
                      fillOpacity={0.4}
                    />
                    <ReferenceArea
                      x1={minYoy}
                      x2={0}
                      y1={avgPer}
                      y2={maxPer}
                      fill="#fef2f2"
                      fillOpacity={0.4}
                    />
                    <ReferenceLine
                      x={0}
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                    />
                    <ReferenceLine
                      y={avgPer}
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      label={{
                        value: `평균 PER: ${avgPer.toFixed(1)}`,
                        position: "right",
                        style: { fontSize: 10, fill: "#64748b" },
                      }}
                    />
                    <Scatter
                      name="기업"
                      data={perYoyChartData}
                      shape={(props: unknown) => {
                        const { cx, cy, payload } = props as {
                          cx: number;
                          cy: number;
                          payload: { fill: string; name: string };
                        };
                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={8}
                              fill={payload.fill}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                            <text
                              x={cx}
                              y={cy - 14}
                              textAnchor="middle"
                              fontSize={11}
                              fontWeight="bold"
                              fill="#334155"
                            >
                              {payload.name}
                            </text>
                          </g>
                        );
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
                  <span>저평가 + 고성장 (매력적)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-50 border border-red-200"></div>
                  <span>고평가 + 저성장 (주의)</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* 2.5 Industry Deviation Radar */}
          <GlassCard className="p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Radar size={18} className="text-shinhan-blue" />
                산업 평균 이탈 탐지
              </h3>
              <select
                className="text-xs font-bold border border-gray-300 rounded-md p-1.5 text-slate-700 bg-white"
                value={selectedRadarCompany}
                onChange={(e) => setSelectedRadarCompany(e.target.value)}
              >
                {activeComparison?.companies?.map((c) => (
                  <option key={c.stock_code} value={c.companyName}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-80 w-full bg-white/50 rounded-xl border border-slate-100 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={radarData}
                >
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, radarMax]}
                    tick={false}
                    axisLine={false}
                  />
                  <RechartsRadar
                    name={selectedRadarCompany}
                    dataKey="A"
                    stroke="#0046FF"
                    strokeWidth={2}
                    fill="#0046FF"
                    fillOpacity={0.2}
                  />
                  <RechartsRadar
                    name="비교 평균"
                    dataKey="B"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    fill="#94A3B8"
                    fillOpacity={0.1}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* 3. Detailed Financial Ratios (Redesigned Grid + Toggle Layout) */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-slate-700">
                투자 지표 비교
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left: Dynamic Grid Area */}
              <div
                className={`flex-1 w-full grid gap-6 auto-rows-min ${activeMetrics.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
              >
                {activeMetrics.map((key) => {
                  const info = dynamicDetails[key];
                  if (!info) return null;
                  return (
                    <GlassCard
                      key={key}
                      className="p-6 relative flex flex-col animate-fade-in-up"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800">
                          {info.title}
                        </h3>
                        <div className="relative group">
                          <div className="text-gray-400 hover:text-shinhan-blue transition-colors cursor-help">
                            <HelpCircle size={20} />
                          </div>

                          {/* Info Tooltip (Hover style) */}
                          <div className="absolute top-8 right-0 z-20 w-72 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <h4 className="font-bold text-slate-800 text-lg mb-2">
                              {info.title}란?
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                              {info.desc}
                            </p>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-xs text-slate-500 font-bold mb-1">
                                계산식
                              </p>
                              <p className="text-sm font-mono text-shinhan-blue">
                                {info.formula}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-h-[250px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={info.data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f0f0f0"
                            />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 12, fill: "#64748b" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 12, fill: "#64748b" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              cursor={{ fill: "transparent" }}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Bar
                              dataKey="value"
                              name={info.title}
                              radius={[6, 6, 0, 0]}
                              barSize={40}
                            >
                              {info.data.map((_entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              {/* Right: Menu Selection (Tab Style preserved as requested) */}
              <div className="w-full lg:w-64 flex-shrink-0 sticky top-24">
                <GlassCard className="p-2 space-y-1">
                  {(Object.keys(detailedMetricsInfo) as DetailMetricKey[]).map(
                    (key) => {
                      const info = detailedMetricsInfo[key];
                      const isActive = activeMetrics.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleMetric(key)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                            isActive
                              ? "bg-gradient-to-r from-blue-50 to-white border border-blue-100 shadow-sm"
                              : "hover:bg-gray-50 border border-transparent text-gray-500"
                          }`}
                        >
                          <span
                            className={`font-bold text-sm ${isActive ? "text-shinhan-blue" : "group-hover:text-slate-700"}`}
                          >
                            {info.title}
                          </span>
                          {isActive && (
                            <div className="bg-shinhan-blue text-white rounded-full p-0.5">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    },
                  )}
                </GlassCard>
                <p className="text-xs text-gray-400 text-center mt-3 px-2">
                  지표를 클릭하여 차트를 추가 또는 제거할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -- Search Modal Overlay -- */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          ></div>
          <GlassCard className="w-full max-w-lg relative z-10 p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">기업 추가</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="기업명 또는 종목코드를 입력하세요"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100/50 outline-none transition-all"
                autoFocus
              />
              <Search
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {searchQuery === "" ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  검색어를 입력하여 기업을 찾아보세요
                </div>
              ) : isSearching ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  검색 중...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults
                  .filter(
                    (company) =>
                      !activeComparison?.companies?.some(
                        (c) => c.stock_code === company.stock_code,
                      ),
                  )
                  .map((company) => (
                    <button
                      key={company.stock_code}
                      onClick={() => handleAddCompany(company.stock_code)}
                      disabled={addCompanyMutation.isPending}
                      className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-xl transition-colors group text-left disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        {company.logo_url && (
                          <img
                            src={company.logo_url}
                            alt={company.company_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 group-hover:text-shinhan-blue">
                            {company.company_name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {company.stock_code} · {company.industry?.name}
                          </span>
                        </div>
                      </div>
                      <Plus
                        size={18}
                        className="text-gray-400 group-hover:text-shinhan-blue"
                      />
                    </button>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default CompanyCompare;
