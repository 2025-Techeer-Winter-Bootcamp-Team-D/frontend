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
companies.set("055550", {
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
});

companyNews.set("055550", [
  {
    id: nextNewsId++,
    title: "신한금융, 역대 최대 실적 달성",
    summary: "신한금융지주가 사상 최대 실적을 기록했다.",
    source: "연합뉴스",
    date: "2024-12-01",
  },
]);

industryNews.set("0021", [
  {
    id: nextNewsId++,
    title: "금융업계, 금리 인하 기대감 확산",
    summary: "금융 산업 전반에 긍정적인 전망이 나오고 있다.",
    source: "한국경제",
    date: "2024-12-02",
  },
]);

//let nextNewsId = 1;
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
