import { api } from "./client";

/**
 * 산업 뉴스 목록 조회
 * @param industryId 산업아이디
 */

export const getIndustryNews = (industryId: number | string) => {
  return api.get(`/industries/${industryId}/news`).then((res) => res.data);
};

/**
 * 산업 내 기업 순위 조회
 * @param industryId 산업아이디
 */

export const getIndustryCompanies = (industryId: number) => {
  return api.get(`/industries/${industryId}/companies`).then((res) => res.data);
};

/**
 * 산업 전망 분석 조회
 * @param industryId 산업아이디
 */

export const getIndustryAnalysis = (industryId: number) => {
  return api.get(`/industries/${industryId}/analysis`).then((res) => res.data);
};
