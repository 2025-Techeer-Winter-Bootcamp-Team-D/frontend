import { api } from "./client";

/*기업 비교 생성*/

export const createComparison = (payload: {
  name: string;
  companies: number[];
}) => {
  return api.post("/api/comparisons", payload).then((res) => res.data);
};

/*기업 비교 삭제 */

export const deleteComparison = (comparison_id: number) => {
  return api
    .delete(`/api/comparisons/${comparison_id}`)
    .then((res) => res.data);
};

/*기업 비교 목록 조회*/

export const getComparisons = () => {
  return api.get("/api/comparisons").then((res) => res.data);
};

/**
 * 기업 비교 조회
 * @param comparison_id 비교 아이디
 * */

export const getComparison = (comparison_id: number) => {
  return api.get(`/api/comparisons/${comparison_id}`).then((res) => res.data);
};

/**
 * 비교할 기업 추가
 *
 */

export const addCompany = (
  comparison_id: number,
  payload: { company: string },
) => {
  return api
    .post(`/api/comparisons/${comparison_id}`, payload)
    .then((res) => res.data);
};

/**
 * 비교할 기업 삭제
 */

export const removeCompany = (comparison_id: number, stock_code: string) => {
  return api
    .delete(`/api/comparisons/${comparison_id}/${stock_code}/`)
    .then((res) => res.data);
};

/**
 * 기업 비교 매치업 이름 수정
 * @param comparison_id 비교 아이디
 * @param name 새로운 매치업 이름
 */

export const updateComparisonName = (comparison_id: number, name: string) => {
  return api
    .patch(`/api/comparisons/${comparison_id}`, { name })
    .then((res) => res.data);
};
