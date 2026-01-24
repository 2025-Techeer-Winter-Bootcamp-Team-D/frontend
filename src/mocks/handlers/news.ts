import { http, HttpResponse, delay } from "msw";

export const newsHandlers = [
  /* 뉴스 키워드 빈도수 조회 (GET /news/keywords/) */
  http.get("/news/keywords/", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const size = parseInt(url.searchParams.get("size") || "15", 10);
    const days = parseInt(url.searchParams.get("days") || "7", 10);

    const keywords = [
      { keyword: "반도체", count: 1250, doc_count: 850 },
      { keyword: "AI", count: 980, doc_count: 720 },
      { keyword: "배터리", count: 750, doc_count: 520 },
      { keyword: "전기차", count: 680, doc_count: 480 },
      { keyword: "금리", count: 620, doc_count: 450 },
      { keyword: "인플레이션", count: 580, doc_count: 420 },
      { keyword: "반도체장비", count: 520, doc_count: 380 },
      { keyword: "2차전지", count: 480, doc_count: 350 },
      { keyword: "바이오", count: 450, doc_count: 320 },
      { keyword: "금융", count: 420, doc_count: 300 },
      { keyword: "부동산", count: 380, doc_count: 280 },
      { keyword: "에너지", count: 350, doc_count: 250 },
      { keyword: "화학", count: 320, doc_count: 230 },
      { keyword: "자동차", count: 300, doc_count: 220 },
      { keyword: "IT", count: 280, doc_count: 200 },
    ].slice(0, size);

    return HttpResponse.json({
      status: 200,
      message: "뉴스 키워드 조회 성공",
      data: {
        period_days: days,
        total_keywords: keywords.length,
        keywords: keywords,
      },
    });
  }),
];
