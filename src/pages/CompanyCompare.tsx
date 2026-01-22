import React, { useState, useMemo, useEffect } from "react";
import GlassCard from "../components/Layout/GlassCard";
import {
  Plus,
  X,
  Search,
  TrendingUp,
  BarChart3,
  HelpCircle,
  Check,
  Edit2,
  CheckCircle2,
  Radar,
  Crosshair,
  Lock,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { PageView } from "../types";
import type { Comparison, CompareCompany, TimeRange } from "../types";
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
  useComparisons,
  useComparisonDetail,
  useCompanySearch,
  useCompareOhlcv,
  useCreateComparison,
  useAddCompany,
  useRemoveCompany,
  useUpdateComparisonName,
  useDeleteComparison,
} from "../hooks/useCompareQueries";

interface CompareProps {
  setPage: (page: PageView) => void;
  onShowLogin?: () => void;
}

type MetricType = "revenue" | "operating" | "net" | "marketCap";
type DetailMetricKey =
  | "eps"
  | "operatingMargin"
  | "roe"
  | "yoy"
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

/**
 * 숫자를 한국식 단위(억, 조)로 포맷팅
 * @param value - 억원 단위의 숫자 (revenue, operatingProfit, netIncome은 억원, marketCap은 조원)
 * @param isMarketCap - 시가총액인 경우 true (이미 조원 단위)
 */
const formatKoreanNumber = (value: number, isMarketCap = false): string => {
  if (value === 0) return "0";

  // marketCap은 이미 조원 단위로 들어옴
  if (isMarketCap) {
    if (value >= 1) {
      const jo = Math.floor(value);
      const eok = Math.round((value - jo) * 10000);
      if (eok > 0) {
        return `${jo.toLocaleString()}조 ${eok.toLocaleString()}억`;
      }
      return `${jo.toLocaleString()}조`;
    }
    // 1조 미만
    const eok = Math.round(value * 10000);
    return `${eok.toLocaleString()}억`;
  }

  // revenue, operating, net은 억원 단위
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 10000) {
    // 1조 이상
    const jo = Math.floor(absValue / 10000);
    const eok = Math.round(absValue % 10000);
    if (eok > 0) {
      return `${sign}${jo.toLocaleString()}조 ${eok.toLocaleString()}억`;
    }
    return `${sign}${jo.toLocaleString()}조`;
  }
  // 1조 미만
  return `${sign}${Math.round(absValue).toLocaleString()}억`;
};

/**
 * 재무 데이터용 커스텀 툴팁 컴포넌트
 */
interface CustomFinancialTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  isMarketCap?: boolean;
}

const CustomFinancialTooltip: React.FC<CustomFinancialTooltipProps> = ({
  active,
  payload,
  isMarketCap = false,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 min-w-[180px]"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
    >
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.name}</span>
            </div>
            <span className="text-sm font-bold text-slate-800 text-right">
              {formatKoreanNumber(entry.value, isMarketCap)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 주가 추이용 커스텀 툴팁 컴포넌트
 */
interface CustomStockTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomStockTooltip: React.FC<CustomStockTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 min-w-[180px]"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
    >
      {label && (
        <div className="text-xs text-gray-500 mb-2 pb-2 border-b border-gray-100">
          {label}
        </div>
      )}
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.name}</span>
            </div>
            <span className="text-sm font-bold text-slate-800 text-right">
              {entry.value.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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

const CompanyCompare: React.FC<CompareProps> = ({ setPage, onShowLogin }) => {
  const { isAuthenticated } = useAuth();

  // -----------------------------
  // Local UI State
  // -----------------------------
  const [activeSetId, setActiveSetId] = useState<number | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempSetName, setTempSetName] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("revenue");
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  const [activeMetrics, setActiveMetrics] = useState<DetailMetricKey[]>([
    "roe",
  ]);
  const [selectedRadarCompany, setSelectedRadarCompany] = useState<string>("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // -----------------------------
  // Server state (커스텀 훅 사용)
  // - accessToken 없으면 요청 안함 (401 방지)
  // - 캐시 재사용으로 불필요한 재요청 방지
  // - 기간 변경 시 깜빡임 방지 (keepPreviousData)
  // -----------------------------

  // 비교 세트 목록 조회
  const comparisonsQuery = useComparisons();
  const comparisonList = useMemo(
    () => comparisonsQuery.data ?? [],
    [comparisonsQuery.data],
  );

  // 비교 세트 목록이 로드되면 첫 번째 세트를 기본 선택
  const effectiveSetId =
    activeSetId ?? (comparisonList.length > 0 ? comparisonList[0].id : null);

  // 비교 세트 상세 조회
  const comparisonDetailQuery = useComparisonDetail(effectiveSetId);
  const comparisonDetail = comparisonDetailQuery.data as Comparison | null;

  // 목록에서 이름을 가져와서 상세 데이터와 합침
  const activeComparison = useMemo(() => {
    if (!comparisonDetail || !effectiveSetId) return null;
    const listItem = comparisonList.find((c) => c.id === effectiveSetId);
    return {
      ...comparisonDetail,
      name: listItem?.name ?? comparisonDetail.name ?? "",
    };
  }, [comparisonDetail, effectiveSetId, comparisonList]);

  // 이름 편집 시작 핸들러
  const handleStartEditName = () => {
    setTempSetName(activeComparison?.name ?? "");
    setIsEditingName(true);
  };

  // 검색 디바운스
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // 기업 검색 (디바운스된 검색어 사용)
  const searchQueryResult = useCompanySearch(debouncedSearch);
  const searchResults = searchQueryResult.data ?? [];
  const isSearching = searchQueryResult.isFetching;

  // OHLCV (주가 추이) - 기업 코드 배열이 바뀌면 queryKey가 바뀜
  const ohlcvQuery = useCompareOhlcv(
    effectiveSetId,
    timeRange,
    activeComparison?.companies,
  );
  const ohlcvData = useMemo(() => ohlcvQuery.data ?? {}, [ohlcvQuery.data]);

  const currentMetricOption =
    metricOptions.find((o) => o.id === selectedMetric) || metricOptions[0];

  // -----------------------------
  // Mutations (커스텀 훅 사용)
  // - invalidateQueries로 필요한 범위만 갱신
  // -----------------------------
  const createSetMutation = useCreateComparison();
  const addCompanyMutation = useAddCompany();
  const removeCompanyMutation = useRemoveCompany();
  const updateNameMutation = useUpdateComparisonName();
  const deleteSetMutation = useDeleteComparison();

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleAddSet = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const newSetName = `비교 세트 ${comparisonList.length + 1}`;
    try {
      const res = await createSetMutation.mutateAsync(newSetName);
      // API 응답에서 새로 생성된 세트 ID를 가져와 선택
      const newId =
        (res as { comparisonId?: number; id?: number }).comparisonId ??
        (res as { id?: number }).id;
      if (newId != null) {
        setActiveSetId(newId);
      }
    } catch (e) {
      console.error("비교 세트 생성 실패:", e);
    }
  };

  const handleRemoveCompany = async (stock_code: string) => {
    if (!effectiveSetId) {
      console.error("effectiveSetId가 없습니다.");
      return;
    }
    try {
      await removeCompanyMutation.mutateAsync({
        setId: effectiveSetId,
        stockCode: stock_code,
      });
    } catch (e) {
      console.error("기업 제거 실패:", e);
    }
  };

  const handleAddCompany = async (stockCode: string) => {
    if (!effectiveSetId) {
      console.error("effectiveSetId가 없습니다.");
      return;
    }
    try {
      await addCompanyMutation.mutateAsync({
        setId: effectiveSetId,
        stockCode,
      });
      // 성공 시 모달 닫기
      setIsSearchOpen(false);
      setSearchQuery("");
    } catch (e) {
      console.error("기업 추가 실패:", e);
    }
  };

  const handleSaveName = async () => {
    if (!effectiveSetId || !tempSetName.trim()) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateNameMutation.mutateAsync({
        setId: effectiveSetId,
        name: tempSetName.trim(),
      });
      setIsEditingName(false);
    } catch (e) {
      console.error("이름 변경 실패:", e);
      setTempSetName(activeComparison?.name ?? "");
      setIsEditingName(false);
    }
  };

  const handleDeleteSet = async (e: React.MouseEvent, comparisonId: number) => {
    e.stopPropagation();
    try {
      await deleteSetMutation.mutateAsync(comparisonId);
      // 삭제된 세트가 현재 활성 세트면 다른 세트 선택
      if (activeSetId === comparisonId) {
        const remaining = comparisonList.filter((c) => c.id !== comparisonId);
        setActiveSetId(remaining.length > 0 ? remaining[0].id : null);
      }
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
  }, [activeComparison, selectedMetric]);

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
  }, [activeComparison, activeMetrics]);

  // PER-YoY Matrix 차트 데이터
  const perYoyChartData = useMemo(() => {
    if (!activeComparison?.companies?.length) return [];
    return activeComparison.companies.map((company, index) => ({
      name: company.companyName,
      per: company.per ?? 0,
      yoy: company.yoy ?? 0,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [activeComparison]);

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

  // Radar Chart: 선택된 기업 - 기본값 계산
  const effectiveRadarCompany =
    selectedRadarCompany ||
    (activeComparison?.companies?.[0]?.companyName ?? "");

  // Radar Chart 데이터 (산업 평균 대비)
  const radarData = useMemo(() => {
    if (!activeComparison?.companies?.length) return [];

    const selectedCompany = activeComparison.companies.find(
      (c) => c.companyName === effectiveRadarCompany,
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
  }, [activeComparison, effectiveRadarCompany]);
  //radarData 도메인 계산 (음수 값 포함)
  const { radarMin, radarMax } = useMemo(() => {
    if (!radarData.length) return { radarMin: 0, radarMax: 25 };

    const allValues = radarData.flatMap((d) => [d.A, d.B]);
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const maxFull = Math.max(...radarData.map((d) => d.fullMark ?? 0));

    // 음수 값이 있으면 최소값을 약간 여유있게 설정, 없으면 0
    const min = dataMin < 0 ? Math.floor(dataMin * 1.1) : 0;
    // 최대값은 데이터 최대값과 fullMark 중 큰 값에 여유 추가
    const max = Math.max(25, maxFull, Math.ceil(dataMax * 1.1));

    return { radarMin: min, radarMax: max };
  }, [radarData]);

  // 주가 추이 차트 데이터 (OHLCV API 기반)
  const trendChartData = useMemo(() => {
    if (!activeComparison?.companies?.length) return [];

    // 차트에 표시할 최대 포인트 수 (부드러운 곡선을 위해 제한)
    const displayPointsMap: Record<TimeRange, number> = {
      "1M": 22, // 약 1개월 - 매일 표시
      "3M": 30, // 약 3개월 - 샘플링
      "6M": 30, // 약 6개월 - 샘플링
      "1Y": 50, // 약 1년 - 샘플링
    };
    const displayPoints = displayPointsMap[timeRange];

    // OHLCV 데이터가 있으면 실제 데이터 사용
    const hasOhlcvData = Object.keys(ohlcvData).length > 0;

    if (hasOhlcvData) {
      // 모든 기업의 데이터 길이 중 최소값 찾기 (stock_code로 조회)
      const minLength = Math.min(
        ...activeComparison.companies.map(
          (c) => ohlcvData[c.stock_code]?.length ?? 0,
        ),
      );

      if (minLength === 0) return [];

      // 샘플링 간격 계산
      const step = Math.max(1, Math.floor(minLength / displayPoints));

      const data: Record<string, string | number>[] = [];
      for (let i = 0; i < minLength; i += step) {
        const point: Record<string, string | number> = {};
        activeComparison.companies.forEach((company) => {
          // stock_code로 OHLCV 데이터 조회, 차트에는 companyName으로 표시
          const companyOhlcv = ohlcvData[company.stock_code];
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
  }, [activeComparison, timeRange, ohlcvData]);

  return (
    <div className="animate-fade-in pb-12 relative">
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
                      effectiveSetId === item.id
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
                        effectiveSetId === item.id
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
                    onClick={handleStartEditName}
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
                  onClick={async () => {
                    // 로그인 체크
                    if (!isAuthenticated) {
                      setShowLoginModal(true);
                      return;
                    }
                    // 비교 세트가 없으면 자동으로 생성
                    if (!effectiveSetId && comparisonList.length === 0) {
                      try {
                        const res =
                          await createSetMutation.mutateAsync("비교 세트 1");
                        const newId =
                          (res as { comparisonId?: number; id?: number })
                            .comparisonId ?? (res as { id?: number }).id;
                        if (newId != null) {
                          setActiveSetId(newId);
                        }
                      } catch (e) {
                        console.error("비교 세트 생성 실패:", e);
                        return;
                      }
                    }
                    setIsSearchOpen(true);
                  }}
                  disabled={createSetMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-shinhan-light/50 text-shinhan-blue rounded-full border border-blue-100 hover:bg-shinhan-light hover:border-blue-200 transition-all group disabled:opacity-50"
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

                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  {metricOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMetric(option.id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        selectedMetric === option.id
                          ? "bg-white text-shinhan-blue shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={financialChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barGap={20}
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
                      tickFormatter={(value) =>
                        formatKoreanNumber(
                          value,
                          selectedMetric === "marketCap",
                        )
                      }
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      content={
                        <CustomFinancialTooltip
                          isMarketCap={selectedMetric === "marketCap"}
                        />
                      }
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

            {/* 구분선 */}
            <div className="border-t border-gray-200 my-2" />

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
                {ohlcvQuery.isLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shinhan-blue mx-auto mb-2"></div>
                      <p className="text-sm">주가 데이터를 불러오는 중...</p>
                    </div>
                  </div>
                ) : trendChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <TrendingUp
                        size={32}
                        className="mx-auto mb-2 opacity-50"
                      />
                      <p className="text-sm">주가 데이터가 없습니다.</p>
                      <p className="text-xs mt-1">
                        기업을 추가하거나 데이터가 동기화되면 표시됩니다.
                      </p>
                    </div>
                  </div>
                ) : (
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
                      <Tooltip content={<CustomStockTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      {/* Dynamically render lines for each company */}
                      {activeComparison?.companies?.map((company, index) => (
                        <Line
                          key={company.stock_code}
                          type="monotone"
                          dataKey={company.companyName}
                          name={company.companyName}
                          stroke={CHART_COLORS[index % CHART_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </GlassCard>

            {/* 구분선 */}
            <div className="border-t border-gray-200 my-2" />

            {/* Row 3: PER-YoY Matrix (Quadrant Style) */}
            <GlassCard className="p-6">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Crosshair size={18} className="text-shinhan-blue" />
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
                      domain={[minYoy, maxYoy]}
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
                      domain={[0, maxPer]}
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

          {/* 구분선 */}
          <div className="border-t border-gray-200 my-6" />

          {/* 2.5 Industry Deviation Radar */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Radar size={18} className="text-shinhan-blue" />
                산업 평균 이탈 탐지
              </h3>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {activeComparison?.companies?.map((c) => (
                  <button
                    key={c.stock_code}
                    onClick={() => setSelectedRadarCompany(c.companyName)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      effectiveRadarCompany === c.companyName
                        ? "bg-white text-shinhan-blue shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {c.companyName}
                  </button>
                ))}
              </div>
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
                    domain={[radarMin, radarMax]}
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

          {/* 구분선 */}
          <div className="border-t border-gray-200 my-6" />

          {/* 3. Detailed Financial Ratios (Redesigned Grid + Toggle Layout) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <BarChart3 size={18} className="text-shinhan-blue" />
                투자 지표 비교
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-2 items-start">
              {/* Left: Dynamic Grid Area */}
              <div
                className={`flex-1 w-full grid gap-2 auto-rows-min ${activeMetrics.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
              >
                {activeMetrics.map((key) => {
                  const info = dynamicDetails[key];
                  if (!info) return null;
                  return (
                    <GlassCard
                      key={key}
                      className="p-4 relative flex flex-col animate-fade-in-up"
                    >
                      <div className="flex items-center justify-between mb-4">
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
                  지표를 클릭하여 차트를 편집할 수 있습니다.
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
                        <span className="font-bold text-slate-700 group-hover:text-shinhan-blue">
                          {company.company_name}
                        </span>
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

      {/* 로그인 필요 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          ></div>
          <GlassCard className="relative z-10 p-8 text-center max-w-sm animate-fade-in">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Lock size={32} className="text-shinhan-blue" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              로그인이 필요한 서비스입니다
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              기업 비교 기능을 이용하시려면 로그인해주세요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-slate-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  if (onShowLogin) {
                    onShowLogin();
                  } else {
                    setPage(PageView.LOGIN);
                  }
                }}
                className="flex-1 py-2.5 bg-shinhan-blue text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                로그인
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default CompanyCompare;
