//data types 정의
//핵심 금융 데이터 정의
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

//분석 및 트랜드 기능
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: "positive" | "negative" | "neutral";
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

export interface Stock {
  id: string;
  name: string;
  sector: string;
  per: number; // Price to Earnings Ratio
  pbr: number; // Price to Book Ratio
  roe: number; // Return on Equity (%)
  debtRatio: number; // Debt Ratio (%)
  divYield: number; // Dividend Yield (%)
}

//차트 및 인터랙션 설정
export type AxisKey = keyof Omit<Stock, "id" | "name" | "sector">;

export interface AxisInfo {
  key: AxisKey;
  label: string;
  description: string;
  domain: [number, number];
  inverted: boolean; // if true, higher is better (e.g., ROE)
}

export interface BrushRange {
  min: number;
  max: number;
}
export interface SankeyNode {
  id: string;
  name: string;
  color: string;
  category: "Revenue" | "Profit" | "Expense" | "Hub";
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}
export interface ExpenseItem {
  name: string;
  amount: number;
  percentage: number;
  category: "COGS" | "OpEx" | "Interest/Tax";
}
export interface ApiResponse<T> {
  status: number;
  data: T;
  message?: string;
}

// OHLCV 주가 데이터
export interface OhlcvData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number;
}

// Auth 관련 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  status: number;
  message: string;
  userId: number;
}

export interface LoginResponse {
  status: number;
  accessToken: string;
}
