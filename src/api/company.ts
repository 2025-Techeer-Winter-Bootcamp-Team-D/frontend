import { api } from "./axios";
import type {
  Company,
  ApiResponse,
  OhlcvData,
  NewsItem,
  CompanySearchResponse,
  CompanyFinancialsData,
  StockPricesResponse,
} from "@/types";

/*
 * 기업 검색
 * GET /companies/search/?q=
 */
export const searchCompanies = (keyword: string) => {
  return api.get<ApiResponse<CompanySearchResponse>>("/companies/search/", {
    params: { q: keyword },
  });
};

/**
 * 기업 기본 정보 조회
 * GET /companies/{stock_code}/
 */
export const getCompanyDetail = (stockCode: string) => {
  return api.get<ApiResponse<CompanyApiData>>(`/companies/${stockCode}/`);
};

/**
 * 주가 데이터 조회 (OHLCV)
 * GET /companies/{stock_code}/prices?interval=
 */
export const getStockOhlcv = (stock_code: string, interval: string) => {
  return api.get<ApiResponse<StockPricesResponse>>(
    `/companies/${stock_code}/prices/`,
    {
      params: { interval },
    },
  );
};

/**
 * 기업 뉴스 조회
 * GET /companies/{companyId}/news
 */
export const getCompanyNews = (companyId: string) => {
  return api.get<ApiResponse<NewsItem[]>>(`/companies/${companyId}/news`);
};
/**
 * 기업 보고서 목록 조회
 * GET /api/companies/{stock_code}/reports/
 */
export const getCompanyReports = (
  stockCode: string,
  page: number = 1,
  size: number = 20,
) => {
  return api.get<ApiResponse<CompanyReportsResponse>>(
    `/companies/${stockCode}/reports/`,
    {
      params: {
        page,
        page_size: size,
      },
    },
  );
};

/**
 * 보고서 분석 결과 조회
 * GET /api/companies/{stock_code}/reports/{rcept_no}/analysis/
 */
export const getReportAnalysis = (stockCode: string, rceptNo: string) => {
  return api.get<ApiResponse<ReportAnalysisData>>(
    `/companies/${stockCode}/reports/${rceptNo}/analysis/`,

/**
 * 기업 재무지표 조회
 * GET /companies/{stock_code}/financials/
 */
export const getCompanyFinancials = (stockCode: string) => {
  return api.get<ApiResponse<CompanyFinancialsData>>(
    `/companies/${stockCode}/financials/`,
  );
};
