export interface StockIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  isUp: boolean;
  data: { time: string; value: number }[];
}

export interface Company {
  id: string;
  name: string;
  code: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  per: number;
  pbr: number;
  revenue: number; // in billions
  profit: number; // in billions
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  content?: string;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface DetailedNewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  author: string;
  avatar: string;
  content: string;
  keywords: string[];
}

export enum PageView {
  DASHBOARD = "DASHBOARD",
  COMPANY_DETAIL = "COMPANY_DETAIL",
  INDUSTRY_ANALYSIS = "INDUSTRY_ANALYSIS",
  COMPANY_COMPARE = "COMPANY_COMPARE",
  COMPANY_SEARCH = "COMPANY_SEARCH",
  SIGN_UP = "SIGN_UP",
  LOGIN = "LOGIN",
}

export interface AITrend {
  keyword: string;
  score: number;
  category: string;
  x: number;
  y: number;
  size: number;
}
