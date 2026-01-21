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
 * 기업 상세 조회
 * GET /companies/{code}
 */
export const getCompanyDetail = (code: string) => {
  return api.get<ApiResponse<Company>>(`/companies/${code}`);
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
  return api.get<ApiResponse<NewsItem[]>>(`/companies/${companyId}/news/`);
};

/**
 * 기업 뉴스 상세 조회
 * GET /companies/{stock_code}/news/{news_id}/
 */
export const getCompanyNewsDetail = (stockCode: string, newsId: number) => {
  return api.get(`/companies/${stockCode}/news/${newsId}/`);
};

/**
 * 기업 재무지표 조회
 * GET /companies/{stock_code}/financials/
 */
export const getCompanyFinancials = (stockCode: string) => {
  return api.get<ApiResponse<CompanyFinancialsData>>(
    `/companies/${stockCode}/financials/`,
  );
};
