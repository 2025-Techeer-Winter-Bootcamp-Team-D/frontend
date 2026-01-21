/**
 * useIndustryQueries - 산업 페이지 전용 TanStack Query 훅
 *
 * 특징:
 * - staleTime으로 캐시 재사용 (불필요한 재요청 방지)
 * - keepPreviousData로 기간 변경 시 깜빡임 방지
 * - gcTime으로 페이지 이동 후에도 데이터 유지
 */

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getIndustryNews,
  getIndustryAnalysis,
  getIndustryCompanies,
  getIndustryChart,
} from "../api/industry";
import type { TimeRange, IndustryKey } from "../types";

// 산업 코드 매핑
export const INDUTY_CODE_BY_KEY: Record<IndustryKey, string> = {
  electronics_kosdaq: "1028", // 전기·전자(코스닥)
  pharmaceuticals: "0009", // 제약
  machinery_kosdaq: "1027", // 기계·장비(코스닥)
  finance: "0021", // 금융
  food_tobacco: "1019", // 음식료·담배(코스닥)
  chemical: "0008", // 화학
  transportation: "0015", // 운송장비·부품
  machinery: "0012", // 기계·장비
  electronics: "0013", // 전기·전자(코스피)
  it_service: "0029", // IT 서비스
  distribution: "0016", // 유통
  insurance: "0025", // 보험
  entertainment: "1015", // 오락·문화
  utilities: "0017", // 전기·가스
  metal: "0011", // 금속
  logistics: "0019", // 운송·창고
  pharmaceuticals_kosdaq: "1024", // 제약(코스닥)
  food_tobacco_kospi: "0005", // 음식료·담배(코스피)
};

// 캐시 설정 상수
const CACHE_TIME = {
  ANALYSIS: 1000 * 60 * 10, // 10분 - 산업 분석은 자주 바뀌지 않음
  COMPANIES: 1000 * 60 * 5, // 5분 - 기업 목록
  NEWS: 1000 * 60 * 3, // 3분 - 뉴스는 상대적으로 자주 갱신
  CHART: 1000 * 60 * 5, // 5분 - 차트 데이터
};

const GC_TIME = 1000 * 60 * 30; // 30분 - 가비지 컬렉션 시간

// 기간 매핑
const chartPeriodMap: Record<TimeRange, "1m" | "3m" | "6m" | "1y"> = {
  "1M": "1m",
  "3M": "3m",
  "6M": "6m",
  "1Y": "1y",
};

/**
 * 산업 분석 데이터 조회 훅
 */
export function useIndustryAnalysis(industryKey: IndustryKey) {
  const indutyCode = INDUTY_CODE_BY_KEY[industryKey];

  return useQuery({
    queryKey: ["industryAnalysis", indutyCode],
    queryFn: () => getIndustryAnalysis(indutyCode),
    enabled: !!indutyCode,
    staleTime: CACHE_TIME.ANALYSIS,
    gcTime: GC_TIME,
  });
}

/**
 * 산업 내 기업 목록 조회 훅
 */
export function useIndustryCompanies(industryKey: IndustryKey) {
  const indutyCode = INDUTY_CODE_BY_KEY[industryKey];

  return useQuery({
    queryKey: ["industryCompanies", indutyCode],
    queryFn: () => getIndustryCompanies(indutyCode),
    enabled: !!indutyCode,
    staleTime: CACHE_TIME.COMPANIES,
    gcTime: GC_TIME,
  });
}

/**
 * 산업 뉴스 조회 훅
 */
export function useIndustryNews(industryKey: IndustryKey) {
  const indutyCode = INDUTY_CODE_BY_KEY[industryKey];

  return useQuery({
    queryKey: ["industryNews", indutyCode],
    queryFn: () => getIndustryNews(indutyCode),
    enabled: !!indutyCode,
    staleTime: CACHE_TIME.NEWS,
    gcTime: GC_TIME,
  });
}

/**
 * 산업 지수 차트 조회 훅
 * - keepPreviousData로 기간 변경 시 깜빡임 방지
 */
export function useIndustryChart(
  industryKey: IndustryKey,
  timeRange: TimeRange,
) {
  const indutyCode = INDUTY_CODE_BY_KEY[industryKey];
  const period = chartPeriodMap[timeRange];

  return useQuery({
    queryKey: ["industryChart", indutyCode, timeRange],
    queryFn: () => getIndustryChart(indutyCode, period),
    enabled: !!indutyCode,
    staleTime: CACHE_TIME.CHART,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData, // 기간 변경 시 이전 데이터 유지
  });
}

/**
 * 산업 페이지 전체 데이터를 한번에 조회하는 통합 훅
 */
export function useIndustryData(
  industryKey: IndustryKey,
  timeRange: TimeRange,
) {
  const analysisQuery = useIndustryAnalysis(industryKey);
  const companiesQuery = useIndustryCompanies(industryKey);
  const newsQuery = useIndustryNews(industryKey);
  const chartQuery = useIndustryChart(industryKey, timeRange);

  const isLoading =
    analysisQuery.isLoading ||
    companiesQuery.isLoading ||
    newsQuery.isLoading ||
    chartQuery.isLoading;

  const isFetching =
    analysisQuery.isFetching ||
    companiesQuery.isFetching ||
    newsQuery.isFetching ||
    chartQuery.isFetching;

  const error =
    analysisQuery.error?.message ||
    companiesQuery.error?.message ||
    newsQuery.error?.message ||
    chartQuery.error?.message ||
    null;

  return {
    analysisQuery,
    companiesQuery,
    newsQuery,
    chartQuery,
    isLoading,
    isFetching,
    error,
  };
}
