import { api } from "./apiClient";

/*기업 순위 조회 */

export const getCompanyRankings = () => {
  return api.get("/rankings/companies").then((res) => res.data);
};

/*산업 순위 조회*/

export const getIndustryRankings = () => {
  return api.get("/rankings/industries").then((res) => res.data);
};

/*뉴스 키워드 빈도 순위 조회*/

export const getKeywordRankings = () => {
  return api.get("/rankings/keywords").then((res) => res.data);
};
