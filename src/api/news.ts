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

// 뉴스 아이템 타입
export interface NewsListItem {
  news_id: number;
  title: string;
  url: string;
  summary: string;
  author: string | null;
  press: string;
  keywords: string[];
  sentiment: string;
  published_at: string;
  created_at: string;
}

export interface NewsListResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  results: NewsListItem[];
}

/**
 * 뉴스 목록 조회
 * GET /news/
 */
export const getNewsList = (params?: { page?: number; page_size?: number }) => {
  return api.get<NewsListResponse>("/news/", { params });
};

// 뉴스 상세 타입 (본문 포함)
export interface NewsDetailItem {
  news_id: number;
  title: string;
  url: string;
  summary: string;
  content: string;
  author: string | null;
  press: string;
  keywords: string[];
  sentiment: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * 뉴스 상세 조회
 * GET /news/{news_id}/
 */
export const getNewsDetail = (newsId: number) => {
  return api.get<NewsDetailItem>(`/news/${newsId}/`);
};
