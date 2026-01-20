import { api } from "./axios";

/**
 * 산업 뉴스 목록 조회
 * @param indutyCode 산업아이디
 */

export const getIndustryNews = (indutyCode: number | string) => {
  return api.get(`/industries/${indutyCode}/news`).then((res) => res.data);
};

/**
 * 산업 내 기업 순위 조회
 * @param indutyCode 산업아이디
 */

export const getIndustryCompanies = (indutyCode: number | string) => {
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
