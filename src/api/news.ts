import { api } from "./axios";

export interface KeywordItem {
  keyword: string;
  count: number;
  doc_count: number;
}

export interface KeywordsResponse {
  status: number;
  message: string;
  data: {
    period_days: number;
    total_keywords: number;
    keywords: KeywordItem[];
  };
}

/**
 * 뉴스 키워드 빈도수 조회
 * GET /news/keywords/
 */
export const getNewsKeywords = (params?: {
  days?: number;
  size?: number;
  min_doc_count?: number;
  exclude?: string;
}) => {
  return api.get<KeywordsResponse>("/news/keywords/", { params });
};
