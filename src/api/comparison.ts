import { api } from "./apiClient";

/*기업 비교 생성*/

export const createComparison = (payload: {
  name: string;
  companies: number[];
}) => {
  return api.post("/comparisons", payload).then((res) => res.data);
};

/*기업 비교 삭제 */

/*기업 비교 목록 조회*/

export const getComparisons = () => {
  return api.get("/comparisons").then((res) => res.data);
};

/**
 * 기업 비교 조회
 * @param CompanyId 산업아이디
 * */

export const getComparison = (CompanyId: number) => {
  return api.get(`/comparisons/${comparison_id}`).then((res) => res.data);
};

/**
 * 비교할 기업 추가
 *
 */

/**
 * 비교할 기업 삭제
 */
