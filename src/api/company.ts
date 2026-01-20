import { api } from "./axios";
import type {
  Company,
  ApiResponse,
  OhlcvData,
  NewsItem,
  CompanySearchResult,
} from "@/types";

/**
 * 기업 검색
 * GET /companies?keyword=
 */
export const searchCompanies = (keyword: string) => {
  return api.get<ApiResponse<Company[]>>("/companies", {
    params: { keyword },
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
