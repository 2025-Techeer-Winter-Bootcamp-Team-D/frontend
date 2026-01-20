import { http, HttpResponse, delay } from "msw";
import type {
  IndustryNewsResponse,
  IndustryCompaniesResponse,
  IndustryAnalysisResponse,
  IndustryNewsItem,
  IndustryCompany,
} from "../../types";

// 산업 정보 타입
type IndustryInfo = {
  id: string;
  name: string;
  indexName: string;
  indexValue: number;
  changePercent: number;
  outlook: string;
};
// 산업 분석 타입
type IndustryAnalysis = {
  summary: string;
  keywords: string[];
  sentiment: "positive" | "negative" | "neutral";
};

// In-Memory 산업 데이터 저장소 (빈 상태로 시작)
const industries = new Map<string, IndustryInfo>();

// In-Memory 산업별 기업 데이터 저장소
const industryCompanies = new Map<string, IndustryCompany[]>();

// In-Memory 산업별 뉴스 데이터 저장소
const industryNews = new Map<string, IndustryNewsItem[]>();

// In-Memory 산업 분석 데이터 저장소
const industryAnalysis = new Map<string, IndustryAnalysis>();

// ID 생성기
let nextNewsId = 1;

export const industryHandlers = [
  // 산업 등록 (POST /industries)
  http.post("/industries", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Partial<IndustryInfo>;

    if (!body.id || !body.name) {
      return HttpResponse.json(
        { status: 400, message: "id와 name은 필수입니다." },
        { status: 400 },
      );
    }

    if (industries.has(body.id)) {
      return HttpResponse.json(
        { status: 400, message: "이미 등록된 산업입니다." },
        { status: 400 },
      );
    }

    const newIndustry: IndustryInfo = {
      id: body.id,
      name: body.name,
      indexName: body.indexName ?? `KRX ${body.name}`,
      indexValue: body.indexValue ?? 1000,
      changePercent: body.changePercent ?? 0,
      outlook: body.outlook ?? "",
    };

    industries.set(body.id, newIndustry);

    return HttpResponse.json(
      {
        status: 201,
        message: "산업이 등록되었습니다.",
        data: newIndustry,
      },
      { status: 201 },
    );
  }),

  // 산업 목록 조회 (GET /industries)
  http.get("/industries", async () => {
    await delay(200);

    const list = Array.from(industries.values());

    return HttpResponse.json({
      status: 200,
      message: "산업 목록 조회 성공",
      data: list,
    });
  }),

  // 산업 뉴스 조회 (GET /industries/{industry_id}/news)
  http.get("/industries/:industry_id/news", async ({ params }) => {
    await delay(200);
    const indutyCode = String(params.industry_id);

    const news = industryNews.get(indutyCode) ?? [];

    const response: IndustryNewsResponse = {
      indutyCode,
      items: news,
    };

    return HttpResponse.json(response);
  }),

  // 산업 뉴스 추가 (POST /industries/{induty_code}/news)
  http.post("/industries/:induty_code/news", async ({ params, request }) => {
    await delay(200);
    const indutyCode = String(params.induty_code);
    const body = (await request.json()) as Partial<IndustryNewsItem>;

    if (!body.title) {
      return HttpResponse.json(
        { status: 400, message: "뉴스 제목은 필수입니다." },
        { status: 400 },
      );
    }

    const newNews: IndustryNewsItem = {
      id: nextNewsId++,
      title: body.title,
      source: body.source ?? "",
      time: body.time ?? "방금 전",
      content: body.content ?? "",
    };

    const existingNews = industryNews.get(indutyCode) ?? [];
    industryNews.set(indutyCode, [...existingNews, newNews]);

    return HttpResponse.json(
      {
        status: 201,
        message: "뉴스가 추가되었습니다.",
        data: newNews,
      },
      { status: 201 },
    );
  }),

  // 산업 내 기업 순위 조회 (GET /industries/{induty_code}/companies)
  http.get("/industries/:induty_code/companies", async ({ params }) => {
    await delay(200);
    const indutyCode = String(params.induty_code);

    const companies = industryCompanies.get(indutyCode) ?? [];

    const response: IndustryCompaniesResponse = {
      status: 200,
      message: "해당 산업 내 기업 순위 조회를 성공하였습니다.",
      data: companies,
    };

    return HttpResponse.json(response);
  }),

  // 산업 내 기업 추가 (POST /industries/{induty_code}/companies)
  http.post(
    "/industries/:induty_code/companies",
    async ({ params, request }) => {
      await delay(200);
      const indutyCode = String(params.induty_code);
      const body = (await request.json()) as Partial<IndustryCompany>;

      if (!body.companyId || !body.name) {
        return HttpResponse.json(
          { status: 400, message: "companyId와 name은 필수입니다." },
          { status: 400 },
        );
      }

      const existingCompanies = industryCompanies.get(indutyCode) ?? [];

      const newCompany: IndustryCompany = {
        companyId: body.companyId,
        stockCode: body.stockCode ?? "",
        name: body.name,
        rank: body.rank ?? existingCompanies.length + 1,
        marketCap: body.marketCap ?? 0,
        logoUrl: body.logoUrl ?? "",
      };

      industryCompanies.set(indutyCode, [...existingCompanies, newCompany]);

      return HttpResponse.json(
        {
          status: 201,
          message: "기업이 산업에 추가되었습니다.",
          data: newCompany,
        },
        { status: 201 },
      );
    },
  ),

  // 산업 전망 분석 조회 (GET /industries/{induty_code}/analysis)
  http.get("/industries/:induty_code/analysis", async ({ params }) => {
    await delay(400);
    const indutyCode = String(params.induty_code);

    const analysis = industryAnalysis.get(indutyCode) ?? {
      summary: "",
      keywords: [],
      sentiment: "neutral" as const,
    };

    const response: IndustryAnalysisResponse = {
      indutyCode,
      ...analysis,
    };

    return HttpResponse.json(response);
  }),

  // 산업 전망 분석 등록/수정 (PUT /industries/{induty_code}/analysis)
  http.put("/industries/:induty_code/analysis", async ({ params, request }) => {
    await delay(200);
    const indutyCode = String(params.induty_code);
    const body = (await request.json()) as Partial<IndustryAnalysis>;

    const existing = industryAnalysis.get(indutyCode);
    const updated: IndustryAnalysis = {
      summary: body.summary ?? existing?.summary ?? "",
      keywords: body.keywords ?? existing?.keywords ?? [],
      sentiment: body.sentiment ?? existing?.sentiment ?? "neutral",
    };

    industryAnalysis.set(indutyCode, updated);

    return HttpResponse.json({
      status: 200,
      message: "산업 분석이 등록/수정되었습니다.",
      data: { indutyCode, ...updated },
    });
  }),
];
