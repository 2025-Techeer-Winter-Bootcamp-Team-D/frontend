import { http, HttpResponse, delay } from "msw";
import type {
  IndustryNewsResponse,
  IndustryCompaniesResponse,
  IndustryAnalysisResponse,
} from "../../types";

export const industryHandlers = [
  // 산업 뉴스 조회 (GET /industries/{industry_id}/news)
  http.get("/industries/:industry_id/news", async ({ params }) => {
    await delay(200);
    const industryId = String(params.industry_id);

    const response: IndustryNewsResponse = {
      industryId,
      items: [
        {
          title: `산업(${industryId}) 뉴스 1`,
          url: "https://example.com/1",
          publishedAt: "2026-01-10",
        },
        {
          title: `산업(${industryId}) 뉴스 2`,
          url: "https://example.com/2",
          publishedAt: "2026-01-11",
        },
      ],
    };

    return HttpResponse.json(response);
  }),

  // 산업 내 기업 순위 조회 (GET /industries/{industry_id}/companies)
  http.get("/industries/:industry_id/companies", async ({ params }) => {
    await delay(200);
    const industryId = String(params.industry_id);

    const response: IndustryCompaniesResponse = {
      industryId,
      companies: [
        {
          stockCode: "005930",
          name: "삼성전자",
          rank: 1,
          marketCap: 500,
          revenue: 1000,
        },
        {
          stockCode: "000660",
          name: "SK하이닉스",
          rank: 2,
          marketCap: 300,
          revenue: 700,
        },
        {
          stockCode: "035420",
          name: "NAVER",
          rank: 3,
          marketCap: 200,
          revenue: 400,
        },
      ],
    };

    return HttpResponse.json(response);
  }),

  // 산업 전망 분석 조회 (GET /industries/{industry_id}/analysis)
  http.get("/industries/:industry_id/analysis", async ({ params }) => {
    await delay(400);
    const industryId = String(params.industry_id);

    const response: IndustryAnalysisResponse = {
      industryId,
      summary: `산업(${industryId}) 전망 요약 (mock)`,
      keywords: ["성장", "수요", "리스크"],
      sentiment: "positive",
    };

    return HttpResponse.json(response);
  }),
];
