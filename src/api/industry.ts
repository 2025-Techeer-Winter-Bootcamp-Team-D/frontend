import { api } from "./axios";

/**
 * 산업 뉴스 목록 조회
 * @param indutyCode 산업코드
 */

export const getIndustryNews = (indutyCode: string) => {
  return api.get(`/industries/${indutyCode}/news/`).then((res) => res.data);
};

/**
 * 산업 내 기업 순위 조회
 * @param indutyCode 산업코드
 */

export const getIndustryCompanies = (indutyCode: string) => {
  return api
    .get(`/industries/${indutyCode}/companies/`)
    .then((res) => res.data);
};

/**
 * 산업 전망 분석 조회
 * @param indutyCode 산업아이디
 */

export const getIndustryAnalysis = (indutyCode: number | string) => {
  return api.get(`/industries/${indutyCode}/outlook/`).then((res) => res.data);
};

/**
 * 산업 지수 목록 조회
 */
export const getIndustryIndices = () => {
  return api.get(`/industries/indices/`).then((res) => res.data);
};

/**
 * 산업 지수 차트 조회
 * @param indutyCode 산업코드
 * @param period 조회 기간 (1m, 3m, 6m, 1y)
 */
export const getIndustryChart = (
  indutyCode: number | string,
  period: "1m" | "3m" | "6m" | "1y" = "1m",
) => {
  return api
    .get(`/industries/${indutyCode}/chart/`, { params: { period } })
    .then((res) => res.data);
};
