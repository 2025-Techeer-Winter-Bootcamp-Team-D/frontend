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
// 기업 검색 결과 타입
export interface CompanySearchItem {
  stock_code: string;
  corp_code: string;
  company_name: string;
  market: string;
  industry: {
    name: string;
    induty_code: string;
  };
  description: string;
  logo_url: string | null;
  market_amount: number;
  ceo_name: string;
  establishment_date: string;
  homepage_url: string;
  address: string;
}

export interface CompanySearchResponse {
  query: string;
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  results: CompanySearchItem[];
}

// 기업 검색 결과 타입
export interface CompanySearchResult {
  companyId: number;
  name: string;
  logo: string;
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
  logo?: string; // Company logo URL
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

// GET /industries/{induty_code}/news
export interface IndustryNewsItem {
  id: number;
  title: string;
  summary?: string;
  source: string;
  time: string;
  author?: string;
  content?: string;
  keywords?: string[];
  url?: string;
}

export interface IndustryNewsResponse {
  indutyCode: string;
  items: IndustryNewsItem[];
}

// GET /industries/{induty_code}/companies
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
  indutyCode: string;
  companies: IndustryCompany[];
}

// GET /industries/{induty_code}/analysis
export interface IndustryAnalysisResponse {
  indutyCode: string;
  summary: string;
  outlook?: string;
  keywords: string[];
  sentiment: "positive" | "negative" | "neutral";
}

// ============================================
// Comparison API Types
// ============================================

export interface CompareCompany {
  stock_code: string;
  companyName: string;
  revenue: number;
  operatingProfit: number;
  netIncome: number;
  marketCap: number;
  roe: number;
  per: number;
  pbr?: number;
  eps?: number;
  yoy?: number;
  qoq?: number;
  operatingMargin?: number;
}

export interface Comparison {
  id: number;
  name: string;
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
  name: string;
  companyCount: number;
  createdAt: string;
}

export interface ComparisonListResponse {
  status: number;
  message: string;
  data: {
    comparisons: ComparisonListItem[];
  };
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

// POST /users/login - Request
export interface LoginRequest {
  email: string;
  password: string;
}

// POST /users/signup - Request
export interface SignupRequest {
  email: string;
  password: string;
  password2: string;
}

// POST /users/signup - Response
export interface SignupResponse {
  id: number;
  email: string;
  createdAt: string;
}

// POST /users/login - Response
export interface LoginResponse {
  access: string;
  refresh: string;
  email: string;
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
  amount: number;
}

// GET /companies/{stock_code}/prices/ - 주가 데이터 조회
export interface StockPriceItem {
  bucket: string;
  stock_code: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number;
  trade_count: number;
  source: string;
}

export interface StockPricesIntervalData {
  stock_code: string;
  interval: string;
  total_count: number;
  data: StockPriceItem[];
}

export interface StockPricesResponse {
  [interval: string]: StockPricesIntervalData;
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
  market: string;
  induty_code: string;
  industry: {
    industry_id: number;
    name: string;
    induty_code: string;
  };
  description: string;
  logo_url: string | null;
  market_amount: number;
  ceo_name: string;
  establishment_date: string;
  homepage_url: string;
  address: string;
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
// 기업 보고서 개별 항목 타입
export interface CompanyReportItem {
  rcept_no: string; // 접수 번호
  report_name: string; // 보고서 명
  report_type: string; // 보고서 유형 (예: 정기공시)
  submitted_at: string; // 제출 일시 (ISO 8601 형식)
  report_url: string; // 보고서 상세 URL
}

// 보고서 목록 응답 데이터 타입
export interface CompanyReportsResponse {
  total_count: number;
  page: number;
  page_size: number;
  reports: CompanyReportItem[]; // results가 아닌 reports로 매핑
}
// 매출 구성 (사업보고서용)
export interface RevenueComposition {
  ratio: number;
  revenue: number;
  segment: string;
}

// 추출된 상세 정보
export interface ExtractedInfo {
  summary: {
    date: string;
    title: string;
    one_line: string;
  };
  // key_info는 "매출액" 또는 "취득금액" 등 키값이 유동적이므로 인덱스 시그니처 사용
  key_info: {
    [key: string]: string;
  };
  report_type: string;
  company_name: string;
  revenue_composition: RevenueComposition[];
}

// 보고서 상세 분석 응답 데이터
export interface ReportAnalysisData {
  id: number;
  rcept_no: string;
  report_name: string;
  report_type: string;
  submitted_at: string;
  report_url: string;
  extracted_info: ExtractedInfo;
  created_at: string;
}
//산업
export type IndustryKey =
  | "agriculture_fishery" // 농어업
  | "manufacturing_kosdaq" // 제조업(코스닥)
  | "food" // 음식료품
  | "chemical" // 화학/정유
  | "pharmaceuticals" // 의약품
  | "battery" // 전기전자
  | "auto" // 운수장비(자동차/조선)
  | "semiconductor_kosdaq" // 반도체(코스닥)
  | "it_kosdaq" // IT산업(코스닥)
  | "insurance"; // 보험

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

// ============================================
// Financial Statements API Types
// ============================================

// GET /companies/{stock_code}/financials - 재무제표 항목
export interface FinancialStatement {
  fiscal_year: number;
  report_type: string;
  revenue: number;
  operating_profit: number;
  net_income: number;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  roe: string;
  debt_ratio: string;
  per: string;
  pbr: string;
  dividend_yield: string;
  metrics_calculated_at: string;
}

// GET /companies/{stock_code}/financials - 응답 데이터
export interface CompanyFinancialsData {
  stock_code: string;
  company_name: string;
  market_amount: number;
  financial_statements: FinancialStatement[];
  revenue_composition: unknown[];
}
