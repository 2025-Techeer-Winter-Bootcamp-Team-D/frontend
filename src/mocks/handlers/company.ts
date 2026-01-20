import { http, HttpResponse, delay } from "msw";
import type { NewsItem } from "@/types";

/* =========================
   타입 정의
========================= */
type CompanyInfo = {
  stock_code: string;
  corp_code: string;
  company_name: string;
  industry: {
    induty_code: string;
    name: string;
  };
  description: string;
  logo_url: string;
  market_amount: number;
  ceo_name: string;
  establishment_date: string;
  homepage_url: string;
};

/* =========================
   In-Memory DB
========================= */
const companies = new Map<string, CompanyInfo>();
const companyNews = new Map<string, NewsItem[]>();
const industryNews = new Map<string, NewsItem[]>();
// 초기 기업 데이터
const initialCompanies: CompanyInfo[] = [
  {
    stock_code: "055550",
    corp_code: "00126380",
    company_name: "신한금융지주",
    industry: { induty_code: "0021", name: "금융" },
    description: "대한민국 대표 금융지주회사",
    logo_url: "",
    market_amount: 42000000000000,
    ceo_name: "진옥동",
    establishment_date: "2001-09-01",
    homepage_url: "https://www.shinhan.com",
  },
  {
    stock_code: "005930",
    corp_code: "00126380",
    company_name: "삼성전자",
    industry: { induty_code: "0001", name: "반도체" },
    description: "글로벌 반도체 및 전자제품 기업",
    logo_url: "",
    market_amount: 350000000000000,
    ceo_name: "한종희",
    establishment_date: "1969-01-13",
    homepage_url: "https://www.samsung.com",
  },
  {
    stock_code: "000270",
    corp_code: "00164742",
    company_name: "기아",
    industry: { induty_code: "0002", name: "자동차" },
    description: "글로벌 자동차 제조 기업",
    logo_url: "",
    market_amount: 35000000000000,
    ceo_name: "송호성",
    establishment_date: "1944-12-11",
    homepage_url: "https://www.kia.com",
  },
  {
    stock_code: "005380",
    corp_code: "00164779",
    company_name: "현대자동차",
    industry: { induty_code: "0002", name: "자동차" },
    description: "대한민국 대표 자동차 제조 기업",
    logo_url: "",
    market_amount: 45000000000000,
    ceo_name: "장재훈",
    establishment_date: "1967-12-29",
    homepage_url: "https://www.hyundai.com",
  },
  {
    stock_code: "035420",
    corp_code: "00401731",
    company_name: "네이버",
    industry: { induty_code: "0003", name: "IT" },
    description: "대한민국 최대 인터넷 포털 기업",
    logo_url: "",
    market_amount: 55000000000000,
    ceo_name: "최수연",
    establishment_date: "1999-06-02",
    homepage_url: "https://www.naver.com",
  },
  {
    stock_code: "035720",
    corp_code: "00258801",
    company_name: "카카오",
    industry: { induty_code: "0003", name: "IT" },
    description: "메신저 및 플랫폼 서비스 기업",
    logo_url: "",
    market_amount: 25000000000000,
    ceo_name: "홍은택",
    establishment_date: "1995-02-16",
    homepage_url: "https://www.kakaocorp.com",
  },
  {
    stock_code: "006400",
    corp_code: "00356361",
    company_name: "삼성SDI",
    industry: { induty_code: "0004", name: "배터리" },
    description: "2차전지 및 에너지 솔루션 기업",
    logo_url: "",
    market_amount: 30000000000000,
    ceo_name: "최윤호",
    establishment_date: "1970-01-13",
    homepage_url: "https://www.samsungsdi.co.kr",
  },
  {
    stock_code: "051910",
    corp_code: "00356370",
    company_name: "LG화학",
    industry: { induty_code: "0004", name: "배터리" },
    description: "화학 및 배터리 소재 전문 기업",
    logo_url: "",
    market_amount: 28000000000000,
    ceo_name: "신학철",
    establishment_date: "2001-04-03",
    homepage_url: "https://www.lgchem.com",
  },
  {
    stock_code: "000660",
    corp_code: "00164529",
    company_name: "SK하이닉스",
    industry: { induty_code: "0001", name: "반도체" },
    description: "메모리 반도체 전문 기업",
    logo_url: "",
    market_amount: 120000000000000,
    ceo_name: "곽노정",
    establishment_date: "1983-02-01",
    homepage_url: "https://www.skhynix.com",
  },
  {
    stock_code: "028260",
    corp_code: "00292146",
    company_name: "삼성물산",
    industry: { induty_code: "0005", name: "건설" },
    description: "건설 및 상사 전문 기업",
    logo_url: "",
    market_amount: 20000000000000,
    ceo_name: "오세철",
    establishment_date: "1938-11-01",
    homepage_url: "https://www.samsungcnt.com",
  },
];

initialCompanies.forEach((c) => companies.set(c.stock_code, c));

/* =========================
   Handlers
========================= */
export const companyHandlers = [
  /* 기업 검색 */
  http.get("/companies", async ({ request }) => {
    await delay(200);
    const keyword = new URL(request.url).searchParams.get("keyword");

    if (!keyword) {
      return HttpResponse.json(
        { message: "검색어가 필요합니다." },
        { status: 400 },
      );
    }

    const results = Array.from(companies.values())
      .filter((c) =>
        c.company_name.toLowerCase().includes(keyword.toLowerCase()),
      )
      .map((c) => ({
        companyId: c.stock_code,
        name: c.company_name,
        logo: c.logo_url,
      }));

    return HttpResponse.json({
      message: "기업 검색 성공",
      data: results,
    });
  }),

  /* 기업 상세 */
  http.get("/companies/:company_id", async ({ params }) => {
    await delay(150);
    const company = companies.get(params.company_id as string);

    if (!company) {
      return HttpResponse.json(
        { message: "기업을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      message: "기업 정보 조회 성공",
      data: company,
    });
  }),

  /* 주가 데이터 */
  http.get("/companies/:company_id/ohlcv", async ({ params, request }) => {
    await delay(150);
    const interval = new URL(request.url).searchParams.get("interval");

    if (!interval) {
      return HttpResponse.json(
        { message: "interval 파라미터가 필요합니다." },
        { status: 400 },
      );
    }

    if (!companies.has(params.company_id as string)) {
      return HttpResponse.json(
        { message: "기업을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const data = Array.from({ length: 30 }, (_, i) => ({
      time: now - (29 - i) * 86400,
      open: 50000,
      high: 51000,
      low: 49000,
      close: 50500,
      volume: 1200000,
      amount: 60000000000,
    }));

    return HttpResponse.json({
      message: "주가 데이터 조회 성공",
      data,
    });
  }),

  /* 기업 뉴스 */
  http.get("/companies/:company_id/news", async ({ params }) => {
    await delay(150);
    const companyId = params.company_id as string;
    if (!companies.has(companyId)) {
      return HttpResponse.json(
        { message: "기업을 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    const news = companyNews.get(companyId) ?? [];

    return HttpResponse.json({
      message: "기업 뉴스 조회 성공",
      data: news,
    });
  }),

  /* 산업 뉴스 (명세서 그대로) */
  http.get("/industries/:induty_code/news", async ({ params }) => {
    await delay(150);
    const indutyCode = String(params.induty_code ?? "");

    if (!/^\d+$/.test(indutyCode)) {
      return HttpResponse.json(
        { message: "induty_code 파라미터가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      message: "산업 뉴스 조회 성공",
      data: industryNews.get(indutyCode) ?? [],
    });
  }),
];
