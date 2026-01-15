import { http, HttpResponse, delay } from "msw";

export const industryHandlers = [
  http.get("/industries/:industry_id/news", async ({ params }) => {
    await delay(200);
    const industryId = String(params.industry_id);
    return HttpResponse.json({
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
    });
  }),

  http.get("/industries/:industry_id/companies", async ({ params }) => {
    await delay(200);
    const industryId = String(params.industry_id);
    return HttpResponse.json({
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
    });
  }),

  http.get("/industries/:industry_id/analysis", async ({ params }) => {
    await delay(400);
    const industryId = String(params.industry_id);
    return HttpResponse.json({
      industryId,
      summary: `산업(${industryId}) 전망 요약 (mock)`,
      keywords: ["성장", "수요", "리스크"],
      sentiment: "positive",
    });
  }),
];
