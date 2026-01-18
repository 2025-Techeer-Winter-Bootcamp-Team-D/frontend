import { http, HttpResponse, delay } from "msw";
import type {
  NewsItem,
  SankeyData,
  ExpenseItem,
  FinancialData,
  FinancialMetric,
} from "@/types";

// 공시 데이터 타입
interface DisclosureItem {
  date: string;
  type: string;
  title: string;
}

type CompanyInfo = {
  stock_code: string;
  corp_code: string;
  company_name: string;
  industry: {
    industry_id: number;
    name: string;
  };
  description: string;
  logo_url: string;
  market_amount: number;
  ceo_name: string;
  establishment_date: string;
  homepage_url: string;
};
// In-Memory 기업 데이터 저장소 (빈 상태로 시작)
const companies = new Map<string, CompanyInfo>();

// In-Memory 뉴스 데이터 저장소 (기업별)
const companyNews = new Map<string, NewsItem[]>();

// 뉴스 ID 생성기
let nextNewsId = 1;

export const companyHandlers = [
  // 기업 등록 (POST /companies)
  http.post("/companies", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Partial<CompanyInfo>;

    if (!body.stock_code || !body.company_name) {
      return HttpResponse.json(
        { status: 400, message: "stock_code와 company_name은 필수입니다." },
        { status: 400 },
      );
    }

    if (companies.has(body.stock_code)) {
      return HttpResponse.json(
        { status: 400, message: "이미 등록된 기업입니다." },
        { status: 400 },
      );
    }

    const newCompany: CompanyInfo = {
      stock_code: body.stock_code,
      corp_code: body.corp_code ?? "",
      company_name: body.company_name,
      industry: body.industry ?? { industry_id: 0, name: "미분류" },
      description: body.description ?? "",
      logo_url: body.logo_url ?? "",
      market_amount: body.market_amount ?? 0,
      ceo_name: body.ceo_name ?? "",
      establishment_date: body.establishment_date ?? "",
      homepage_url: body.homepage_url ?? "",
    };

    companies.set(body.stock_code, newCompany);

    return HttpResponse.json(
      {
        status: 201,
        message: "기업이 등록되었습니다.",
        data: newCompany,
      },
      { status: 201 },
    );
  }),

  // 기업 검색 (GET /companies?keyword=)
  http.get("/companies", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const keyword = url.searchParams.get("keyword");

    if (!keyword || keyword.trim() === "") {
      return HttpResponse.json(
        { status: 400, message: "검색 키워드가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const results = Array.from(companies.entries())
      .filter(([, company]) =>
        company.company_name.toLowerCase().includes(keyword.toLowerCase()),
      )
      .map(([code, company]) => ({
        companyId: code,
        name: company.company_name,
        logo: company.logo_url,
      }));

    if (results.length === 0) {
      return HttpResponse.json(
        { status: 404, message: "기업을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      status: 200,
      message: "기업 검색을 완료하였습니다.",
      data: results,
    });
  }),

  // 주가 데이터 조회 (GET /companies/:company_id/ohlcv)
  http.get("/companies/:company_id/ohlcv", async ({ params, request }) => {
    await delay(150);
    const { company_id } = params;
    const url = new URL(request.url);
    const interval = url.searchParams.get("interval");

    if (!interval || interval.trim() === "") {
      return HttpResponse.json(
        { status: 400, message: "interval 파라미터가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const companyId = company_id as string;
    if (!companies.has(companyId)) {
      return HttpResponse.json(
        { status: 404, message: "기업을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const mockOhlcvData = Array.from({ length: 30 }, (_, index) => {
      const basePrice = 50000 + Math.random() * 10000;
      return {
        time: now - (29 - index) * 86400,
        open: Math.round(basePrice * 100) / 100,
        high: Math.round((basePrice + Math.random() * 1000) * 100) / 100,
        low: Math.round((basePrice - Math.random() * 1000) * 100) / 100,
        close:
          Math.round((basePrice + (Math.random() - 0.5) * 500) * 100) / 100,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        amount: Math.floor(Math.random() * 10000000000) + 1000000000,
      };
    });

    return HttpResponse.json({
      status: 200,
      message: "과거 주가 데이터 조회를 성공하였습니다.",
      data: mockOhlcvData,
    });
  }),

  // 기업 정보 조회 (GET /companies/:ticker_symbol)
  http.get<{ ticker_symbol: string }>(
    "/companies/:ticker_symbol",
    async ({ params }) => {
      await delay(150);
      const { ticker_symbol } = params;
      const company = companies.get(ticker_symbol);

      if (!company) {
        return HttpResponse.json(
          { status: 404, message: "해당 기업을 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      return HttpResponse.json({
        status: 200,
        message: "기업 정보 조회 성공",
        data: company,
      });
    },
  ),

  // 기업 정보 수정 (PUT /companies/:ticker_symbol)
  http.put<{ ticker_symbol: string }>(
    "/companies/:ticker_symbol",
    async ({ params, request }) => {
      await delay(150);
      const { ticker_symbol } = params;
      const body = (await request.json()) as Partial<CompanyInfo>;

      if (!companies.has(ticker_symbol)) {
        return HttpResponse.json(
          { status: 404, message: "해당 기업을 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      const existing = companies.get(ticker_symbol)!;
      const updated: CompanyInfo = {
        ...existing,
        ...body,
        stock_code: ticker_symbol,
      };
      companies.set(ticker_symbol, updated);

      return HttpResponse.json({
        status: 200,
        message: "기업 정보가 수정되었습니다.",
        data: updated,
      });
    },
  ),

  // 기업 삭제 (DELETE /companies/:ticker_symbol)
  http.delete<{ ticker_symbol: string }>(
    "/companies/:ticker_symbol",
    async ({ params }) => {
      await delay(150);
      const { ticker_symbol } = params;

      if (!companies.has(ticker_symbol)) {
        return HttpResponse.json(
          { status: 404, message: "해당 기업을 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      companies.delete(ticker_symbol);
      companyNews.delete(ticker_symbol);

      return HttpResponse.json({
        status: 200,
        message: "기업이 삭제되었습니다.",
      });
    },
  ),

  // 기업 뉴스 조회 (GET /companies/:company_id/news)
  http.get("/companies/:company_id/news", async ({ params }) => {
    await delay(200);
    const { company_id } = params;
    const companyId = company_id as string;

    if (!companies.has(companyId)) {
      return HttpResponse.json(
        { status: 404, message: "기업을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const news = companyNews.get(companyId) ?? [];

    return HttpResponse.json({
      status: 200,
      message: "기업 뉴스 조회 성공",
      data: news,
    });
  }),

  // 기업 뉴스 추가 (POST /companies/:company_id/news)
  http.post("/companies/:company_id/news", async ({ params, request }) => {
    await delay(200);
    const { company_id } = params;
    const companyId = company_id as string;
    const body = (await request.json()) as Partial<NewsItem>;

    if (!companies.has(companyId)) {
      return HttpResponse.json(
        { status: 404, message: "기업을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (!body.title) {
      return HttpResponse.json(
        { status: 400, message: "뉴스 제목은 필수입니다." },
        { status: 400 },
      );
    }

    const newNews: NewsItem = {
      id: nextNewsId++,
      title: body.title,
      summary: body.summary,
      source: body.source,
      date: body.date ?? new Date().toISOString().split("T")[0],
      author: body.author,
      content: body.content,
      keywords: body.keywords,
    };

    const existingNews = companyNews.get(companyId) ?? [];
    companyNews.set(companyId, [...existingNews, newNews]);

    return HttpResponse.json(
      {
        status: 201,
        message: "뉴스가 추가되었습니다.",
        data: newNews,
      },
      { status: 201 },
    );
  }),
];
