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
  id: number; //
  title: string;
  summary?: string;
  source?: string; //
  date?: string;
  time?: string;
  author?: string;
  content?: string; //
  keywords?: string[];
  url?: string;
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
//평행좌표계계
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

// ============================================
// Industry API Types
// ============================================

// GET /industries/{industry_id}/news
export interface IndustryNewsItem extends NewsItem {}

export interface IndustryNewsResponse {
  industryId: string;
  items: IndustryNewsItem[];
}

// GET /industries/{industry_id}/companies
// 산업 내 기업 정보 타입
export type IndustryCompany = {
  companyId: number | string;
  stockCode: string;
  name: string;
  rank: number;
  marketCap: number | string;
  logoUrl: string;
  logo?: string;
  price?: string;
  change?: string;
  roe?: number;
  per?: number;
  pbr?: number;
  aiScore?: number;
};

export interface IndustryCompaniesResponse {
  industryId: string;
  companies: IndustryCompany[];
}

// GET /industries/{industry_id}/analysis
export interface IndustryAnalysisResponse {
  industryId: string;
  summary: string;
  outlook?: string;
  keywords: string[];
  sentiment: "positive" | "negative" | "neutral";
}

// ============================================
// Comparison API Types
// ============================================

export interface CompareCompany {
  stockCode: string;
  name: string;
  revenue: number;
  operatingProfit: number;
  roe: number;
  per: number;
}

export interface Comparison {
  id: number;
  title: string;
  companies: CompareCompany[];
  createdAt: string;
}

// POST /comparisons - Request
export interface CreateComparisonRequest {
  name: string;
  companies: number[];
}

// POST /comparisons - Response
export type CreateComparisonResponse = Comparison;

// GET /comparisons - Response
export interface ComparisonListItem {
  id: number;
  title: string;
  companyCount: number;
  createdAt: string;
}

export interface ComparisonListResponse {
  items: ComparisonListItem[];
}

// GET /comparisons/{comparison_id} - Response
export type ComparisonDetailResponse = Comparison;

// POST /comparisons/{comparison_id} - Request
export interface AddCompanyToComparisonRequest {
  company: string;
}

// DELETE /comparisons/{comparison_id} - Response
export interface DeleteComparisonResponse {
  ok: boolean;
}

// ============================================
// User API Types
// ============================================

export type User = {
  id: number;
  email: string;
  password: string;
  createdAt: string;
};

// POST /users/signup, /users/login - Request
export interface LoginRequest {
  email: string;
  password: string;
}

// POST /users/signup - Response
export interface SignupResponse {
  id: number;
  email: string;
  createdAt: string;
}

// POST /users/login - Response
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
  };
}

// POST /users/logout - Response
export interface LogoutResponse {
  ok: boolean;
}

// ============================================
// Company API Types
// ============================================

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
// GET /companies/{companyId}/ohlcv - OHLCV Data
export interface OhlcvData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
// 주가 데이터
export interface OhlcvItem {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
// 동종업계 순위 아이템
export interface PeerCompanyItem {
  rank: number;
  name: string;
  code: string;
  price: string;
  change: string;
}
export interface RankingItem {
  rank: number;
  name: string;
  code: string;
  sector: string;
  price: string;
  change: string;
  changeVal: number;
  marketCap: string;
}
export interface CompanyApiData {
  stock_code: string;
  corp_code: string;
  company_name: string;
  industry: { industry_id: number; name: string };
  description: string;
  logo_url: string;
  market_amount: number;
  ceo_name: string;
  establishment_date: string;
  homepage_url: string;
}
// 재무 데이터 타입
export interface FinancialMetric {
  current: string;
  yoy: string;
  industryAvg: string;
  history: { year: string; value: number; label: string }[];
}

export interface FinancialData {
  business: { name: string; value: number; color: string }[];
  revenue: FinancialMetric;
  operating: FinancialMetric;
  netIncome: FinancialMetric;
}
//산업
export type IndustryKey =
  | "finance"
  | "semicon"
  | "auto"
  | "bio"
  | "battery"
  | "internet"
  | "ent"
  | "steel"
  | "ship"
  | "const"
  | "retail"
  | "telecom";

export type TimeRange = "1M" | "3M" | "6M" | "1Y";

export interface IndustryData {
  id: IndustryKey;
  name: string;
  indexName: string;
  indexValue: number;
  changeValue: number;
  changePercent: number;
  outlook: string; // New field for Industry Outlook
  insights: {
    positive: string;
    risk: string;
  };
  companies: {
    name: string;
    code: string;
    price: string;
    change: string; // includes sign
    per: number;
    pbr: number;
    roe: number;
    aiScore: number;
    marketCap: string; // Added Market Cap
    logo?: string; // Optional: Company logo URL (for backend integration)
  }[];
  news: IndustryNewsItem[]; // New field for News
}
// 기업 순위 타입
export type CompanyRank = {
  rank: number;
  name: string;
  code: string;
  sector: string;
  price: string;
  change: string;
  changeVal: number;
  marketCap: string;
};

// 산업 순위 타입
export type IndustryRank = {
  rank: number;
  name: string;
  change: string;
  marketCap: string;
};

// 키워드 순위 타입
export type KeywordRank = {
  rank: number;
  keyword: string;
  count: number;
};
