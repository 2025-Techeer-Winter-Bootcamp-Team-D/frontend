/**
 * Custom Hooks - 산업 페이지 및 기업 비교 페이지 전용
 */

// 인증 상태 관리
export { useAuth, notifyAuthChange } from "./useAuth";

// 산업 페이지 쿼리
export {
  useIndustryAnalysis,
  useIndustryCompanies,
  useIndustryNews,
  useIndustryChart,
  useIndustryData,
  INDUTY_CODE_BY_KEY,
} from "./useIndustryQueries";

// 기업 비교 페이지 쿼리
export {
  useComparisons,
  useComparisonDetail,
  useCompanySearch,
  useCompareOhlcv,
  useCreateComparison,
  useAddCompany,
  useRemoveCompany,
  useUpdateComparisonName,
  useDeleteComparison,
  compareQueryKeys,
} from "./useCompareQueries";

// 실시간 주가 WebSocket
export { useStockWebSocket } from "./useStockWebSocket";
export type { StockPrice } from "./useStockWebSocket";
