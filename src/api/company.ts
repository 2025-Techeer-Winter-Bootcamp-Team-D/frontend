import { api } from "./axios";
import type {
  CompanyApiData,
  ApiResponse,
  OhlcvData,
  NewsItem,
  CompanyReportsResponse,
  ReportAnalysisData,
} from "@/types";

// 기업 검색 결과 타입
export interface CompanySearchItem {
  stock_code: string;
  corp_code: string;
  company_name: string;
  market: string;
  induty_code: string;
  industry: {
    industry_id: number;
    name: string;
    induty_code: string;
  };
  description: string;
  logo_url: string | null;
  market_amount: number;
  ceo_name: string;
  establishment_date: string;
  homepage_url: string;
  address: string;
}

export interface CompanySearchResponse {
  query: string;
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  results: CompanySearchItem[];
}

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
 * GET /companies/{companyId}/ohlcv?interval=
 */
export const getStockOhlcv = (companyId: string, interval: string) => {
  return api.get<ApiResponse<OhlcvData[]>>(`/companies/${companyId}/ohlcv`, {
    params: { interval },
  });
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
  );
};
