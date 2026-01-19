import { api } from "./axios";

/*기업 순위 조회 */

export const getCompanyRankings = () => {
  return api.get("/api/rankings/companies").then((res) => res.data);
};

/*산업 순위 조회*/

export const getIndustryRankings = () => {
  return api.get("/api/rankings/industries").then((res) => res.data);
};

/*뉴스 키워드 빈도 순위 조회*/

export const getKeywordRankings = () => {
  return api.get("/api/rankings/keywords").then((res) => res.data);
};
