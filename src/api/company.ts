import { api } from "./axios";
import type { Company, ApiResponse, OhlcvData, NewsItem } from "@/types";

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

/**
 * 기업 검색
 * GET /companies/search/?q=
 */
export const searchCompanies = (keyword: string) => {
  return api.get<ApiResponse<CompanySearchResponse>>("/companies/search/", {
    params: { q: keyword },
  });
};

/**
 * 기업 상세 조회
 * GET /companies/{code}
 */
export const getCompanyDetail = (code: string) => {
  return api.get<ApiResponse<Company>>(`/companies/${code}/`);
};

/**
 * 주가 데이터 조회 (OHLCV)
 * GET /companies/{companyId}/prices/?interval=
 */
export const getStockOhlcv = (companyId: string, interval: string) => {
  return api.get<ApiResponse<OhlcvData[]>>(`/companies/${companyId}/prices/`, {
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
