/**
 * useCompareQueries - 기업 비교 페이지 전용 TanStack Query 훅
 *
 * 특징:
 * - 기업 코드 배열이 바뀌면 queryKey가 바뀜
 * - 동일한 비교 조합이면 캐시 재사용
 * - keepPreviousData로 기간 변경 시 깜빡임 방지
 * - invalidateQueries로 필요한 범위만 갱신
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getComparisons,
  getComparison,
  createComparison,
  addCompany,
  removeCompany,
  updateComparisonName,
  deleteComparison,
} from "../api/comparison";
import { searchCompanies, getStockOhlcv } from "../api/company";
import type {
  ComparisonListItem,
  Comparison,
  CompanySearchItem,
  TimeRange,
  OhlcvData,
  OhlcvItem,
} from "../types";

// 캐시 설정 상수
const CACHE_TIME = {
  COMPARISONS: 1000 * 60 * 5, // 5분 - 비교 세트 목록
  COMPARISON_DETAIL: 1000 * 60 * 3, // 3분 - 비교 세트 상세
  OHLCV: 1000 * 60 * 5, // 5분 - OHLCV 데이터
  SEARCH: 1000 * 60 * 2, // 2분 - 검색 결과
};

const GC_TIME = 1000 * 60 * 30; // 30분

// Query Keys 상수화 (일관성 유지)
export const compareQueryKeys = {
  all: ["compare"] as const,
  comparisons: () => [...compareQueryKeys.all, "comparisons"] as const,
  comparison: (id: number | null) =>
    [...compareQueryKeys.all, "comparison", id] as const,
  ohlcv: (setId: number | null, timeRange: TimeRange, companyCodes: string) =>
    [...compareQueryKeys.all, "ohlcv", setId, timeRange, companyCodes] as const,
  search: (query: string) =>
    [...compareQueryKeys.all, "search", query] as const,
};

/**
 * 비교 세트 목록 조회 훅
 */
export function useComparisons() {
  return useQuery({
    queryKey: compareQueryKeys.comparisons(),
    queryFn: async () => {
      const res = await getComparisons();
      return (res.data?.comparisons ?? []) as ComparisonListItem[];
    },
    staleTime: CACHE_TIME.COMPARISONS,
    gcTime: GC_TIME,
  });
}

/**
 * 비교 세트 상세 조회 훅
 */
export function useComparisonDetail(activeSetId: number | null) {
  return useQuery({
    queryKey: compareQueryKeys.comparison(activeSetId),
    queryFn: async () => {
      const res = await getComparison(activeSetId as number);
      return (res.data ?? res) as Comparison;
    },
    enabled: !!activeSetId,
    staleTime: CACHE_TIME.COMPARISON_DETAIL,
    gcTime: GC_TIME,
  });
}

/**
 * 기업 검색 훅 (디바운스된 검색어 사용)
 */
export function useCompanySearch(debouncedSearch: string) {
  return useQuery({
    queryKey: compareQueryKeys.search(debouncedSearch),
    queryFn: async () => {
      const res = await searchCompanies(debouncedSearch);
      const data = res.data;
      // API 응답 구조에 따라 results 추출 (SearchModal과 동일한 방식)
      const results = data?.data?.results ?? data?.results ?? [];
      return results as CompanySearchItem[];
    },
    enabled: !!debouncedSearch.trim(),
    staleTime: CACHE_TIME.SEARCH,
    gcTime: GC_TIME,
  });
}

/**
 * OHLCV (주가 추이) 조회 훅
 * - 기업 코드 배열을 정렬하여 queryKey 생성 (동일 조합 캐시 재사용)
 * - keepPreviousData로 기간 변경 시 깜빡임 방지
 */
export function useCompareOhlcv(
  activeSetId: number | null,
  timeRange: TimeRange,
  companies: Array<{ stock_code: string; companyName: string }> | undefined,
) {
  // 기업 코드를 정렬하여 동일 조합이면 같은 queryKey가 되도록 함
  const sortedCodes = [...(companies ?? [])]
    .map((c) => c.stock_code)
    .sort()
    .join(",");

  return useQuery({
    queryKey: compareQueryKeys.ohlcv(activeSetId, timeRange, sortedCodes),
    queryFn: async () => {
      const companyList = companies ?? [];

      const intervalMap: Record<TimeRange, string> = {
        "1M": "1d",
        "3M": "1d",
        "6M": "1d",
        "1Y": "1d",
      };

      // stock_code를 키로 사용하여 동명 기업 충돌 방지
      const results: Record<string, OhlcvItem[]> = {};

      await Promise.all(
        companyList.map(async (company) => {
          try {
            const response = await getStockOhlcv(
              company.stock_code,
              intervalMap[timeRange],
            );

            const rawData = response.data?.data ?? [];

            results[company.stock_code] = (rawData as unknown as OhlcvData[])
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
            console.warn(`${company.stock_code} OHLCV 변환 실패`, innerError);
            results[company.stock_code] = [];
          }
        }),
      );

      return results;
    },
    enabled: !!companies?.length,
    staleTime: CACHE_TIME.OHLCV,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData, // 기간 변경 시 이전 데이터 유지
  });
}

// =====================
// Mutations
// =====================

/**
 * 비교 세트 생성 mutation
 */
export function useCreateComparison() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      return await createComparison({ name, companies: [] });
    },
    onSuccess: () => {
      // 비교 세트 목록만 갱신
      queryClient.invalidateQueries({
        queryKey: compareQueryKeys.comparisons(),
      });
    },
  });
}

/**
 * 기업 추가 mutation
 */
export function useAddCompany(activeSetId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stockCode: string) => {
      if (!activeSetId) throw new Error("activeSetId가 없습니다.");
      await addCompany(activeSetId, { company: stockCode });
    },
    onSuccess: () => {
      // 해당 비교 세트 상세만 갱신
      queryClient.invalidateQueries({
        queryKey: compareQueryKeys.comparison(activeSetId),
      });
      // OHLCV 데이터도 갱신 (새 기업 추가됨)
      queryClient.invalidateQueries({
        queryKey: [...compareQueryKeys.all, "ohlcv", activeSetId],
        exact: false,
      });
    },
  });
}

/**
 * 기업 제거 mutation
 */
export function useRemoveCompany(activeSetId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stockCode: string) => {
      if (!activeSetId) throw new Error("activeSetId가 없습니다.");
      await removeCompany(activeSetId, stockCode);
    },
    onSuccess: () => {
      // 해당 비교 세트 상세만 갱신
      queryClient.invalidateQueries({
        queryKey: compareQueryKeys.comparison(activeSetId),
      });
      // OHLCV 데이터도 갱신
      queryClient.invalidateQueries({
        queryKey: [...compareQueryKeys.all, "ohlcv", activeSetId],
        exact: false,
      });
    },
  });
}

/**
 * 비교 세트 이름 변경 mutation
 */
export function useUpdateComparisonName(activeSetId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!activeSetId) throw new Error("activeSetId가 없습니다.");
      await updateComparisonName(activeSetId, name);
    },
    onSuccess: () => {
      // 목록과 상세 모두 갱신
      queryClient.invalidateQueries({
        queryKey: compareQueryKeys.comparisons(),
      });
      queryClient.invalidateQueries({
        queryKey: compareQueryKeys.comparison(activeSetId),
      });
    },
  });
}

/**
 * 비교 세트 삭제 mutation
 */
export function useDeleteComparison() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comparisonId: number) => {
      await deleteComparison(comparisonId);
      return comparisonId;
    },
    onSuccess: (deletedId) => {
      // 목록 갱신
      queryClient.invalidateQueries({
        queryKey: compareQueryKeys.comparisons(),
      });
      // 삭제된 세트의 캐시 제거
      queryClient.removeQueries({
        queryKey: compareQueryKeys.comparison(deletedId),
      });
    },
  });
}
