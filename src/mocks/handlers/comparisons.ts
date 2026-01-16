import { http, HttpResponse, delay } from "msw";

type ComparisonCompany = {
  stock_code: string;
  companyName: string;
  logo?: string;
  price?: string;
  change?: string;
  per?: number;
  pbr?: number;
  roe?: number;
  eps?: number;
  yoy?: number;
  qoq?: number;
  operatingMargin?: number;
  revenue?: number;
  operatingProfit?: number;
  netIncome?: number;
  marketCap?: number;
};

type Comparison = {
  id: number;
  name: string;
  companies: ComparisonCompany[];
};

// In-Memory 비교 세트 저장소
const comparisons = new Map<number, Comparison>();
let nextComparisonId = 1;

// 초기 샘플 데이터
comparisons.set(nextComparisonId, {
  id: nextComparisonId++,
  name: "관심 종목 비교",
  companies: [
    {
      stock_code: "005930",
      companyName: "삼성전자",
      price: "73,400",
      change: "+0.96%",
      per: 15.2,
      pbr: 1.45,
      roe: 8.5,
      eps: 4521,
      yoy: 12.5,
      qoq: 3.2,
      operatingMargin: 15.8,
      revenue: 302,
      operatingProfit: 47.8,
      netIncome: 35.2,
      marketCap: 430,
    },
    {
      stock_code: "000660",
      companyName: "SK하이닉스",
      price: "164,500",
      change: "+2.10%",
      per: 25.4,
      pbr: 2.1,
      roe: 12.2,
      eps: 6480,
      yoy: 45.2,
      qoq: 8.5,
      operatingMargin: 22.1,
      revenue: 66,
      operatingProfit: 14.6,
      netIncome: 10.2,
      marketCap: 119,
    },
  ],
});

export const comparisonHandlers = [
  // 비교 세트 생성 (POST /comparisons)
  http.post("/comparisons", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as {
      name: string;
      companies: number[];
    };

    if (!body.name) {
      return HttpResponse.json(
        { status: 400, message: "비교 세트 이름은 필수입니다." },
        { status: 400 },
      );
    }

    const newComparison: Comparison = {
      id: nextComparisonId++,
      name: body.name,
      companies: (body.companies ?? []).map((id) => ({
        companyId: id,
        name: `기업 ${id}`,
      })),
    };

    comparisons.set(newComparison.id, newComparison);

    return HttpResponse.json(
      {
        status: 201,
        message: "비교 세트가 생성되었습니다.",
        data: newComparison,
      },
      { status: 201 },
    );
  }),

  // 비교 세트 목록 조회 (GET /comparisons)
  http.get("/comparisons", async () => {
    await delay(200);

    const list = Array.from(comparisons.values()).map((c) => ({
      id: c.id,
      name: c.name,
      companyCount: c.companies.length,
    }));

    return HttpResponse.json({
      status: 200,
      message: "비교 세트 목록 조회 성공",
      data: {
        comparisons: list,
      },
    });
  }),

  // 비교 세트 상세 조회 (GET /comparisons/:comparison_id)
  http.get<{ comparison_id: string }>(
    "/comparisons/:comparison_id",
    async ({ params }) => {
      await delay(150);
      const id = Number(params.comparison_id);
      const comparison = comparisons.get(id);

      if (!comparison) {
        return HttpResponse.json(
          { status: 404, message: "비교 세트를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      return HttpResponse.json(comparison);
    },
  ),

  // 비교 세트 이름 변경 (PATCH /comparisons/:comparison_id)
  http.patch<{ comparison_id: string }>(
    "/comparisons/:comparison_id",
    async ({ params, request }) => {
      await delay(150);
      const id = Number(params.comparison_id);
      const body = (await request.json()) as { name?: string };
      const comparison = comparisons.get(id);

      if (!comparison) {
        return HttpResponse.json(
          { status: 404, message: "비교 세트를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      if (body.name) {
        comparison.name = body.name;
      }

      comparisons.set(id, comparison);

      return HttpResponse.json({
        status: 200,
        message: "비교 세트가 수정되었습니다.",
        data: comparison,
      });
    },
  ),

  // 비교 세트 삭제 (DELETE /comparisons/:comparison_id)
  http.delete<{ comparison_id: string }>(
    "/comparisons/:comparison_id",
    async ({ params }) => {
      await delay(150);
      const id = Number(params.comparison_id);

      if (!comparisons.has(id)) {
        return HttpResponse.json(
          { status: 404, message: "비교 세트를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      comparisons.delete(id);

      return HttpResponse.json({
        status: 200,
        message: "비교 세트가 삭제되었습니다.",
      });
    },
  ),

  // 비교 세트에 기업 추가 (POST /comparisons/:comparison_id)
  http.post<{ comparison_id: string }>(
    "/comparisons/:comparison_id",
    async ({ params, request }) => {
      await delay(150);
      const id = Number(params.comparison_id);
      const body = (await request.json()) as { company: string };
      const comparison = comparisons.get(id);

      if (!comparison) {
        return HttpResponse.json(
          { status: 404, message: "비교 세트를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      const stockCode = body.company;
      const exists = comparison.companies.some(
        (c) => c.stock_code === stockCode,
      );

      if (exists) {
        return HttpResponse.json(
          { status: 400, message: "이미 추가된 기업입니다." },
          { status: 400 },
        );
      }

      comparison.companies.push({
        stock_code: stockCode,
        companyName: `기업 ${stockCode}`,
        price: "50,000",
        change: "+1.00%",
        per: 10,
        pbr: 1.0,
        roe: 5,
        eps: 2000,
        yoy: 5.0,
        qoq: 2.0,
        operatingMargin: 10.0,
        revenue: 50,
        operatingProfit: 5,
        netIncome: 3,
        marketCap: 10,
      });

      comparisons.set(id, comparison);

      return HttpResponse.json({
        status: 200,
        message: "기업이 추가되었습니다.",
        data: comparison,
      });
    },
  ),

  // 비교 세트에서 기업 삭제 (DELETE /comparisons/:comparison_id/:stock_code)
  http.delete<{ comparison_id: string; stock_code: string }>(
    "/comparisons/:comparison_id/:stock_code",
    async ({ params }) => {
      await delay(150);
      const id = Number(params.comparison_id);
      const stockCode = params.stock_code;
      const comparison = comparisons.get(id);

      if (!comparison) {
        return HttpResponse.json(
          { status: 404, message: "비교 세트를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      const initialLength = comparison.companies.length;
      comparison.companies = comparison.companies.filter(
        (c) => c.stock_code !== stockCode,
      );

      if (comparison.companies.length === initialLength) {
        return HttpResponse.json(
          { status: 404, message: "해당 기업을 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      comparisons.set(id, comparison);

      return HttpResponse.json({
        status: 200,
        message: "기업이 삭제되었습니다.",
        data: comparison,
      });
    },
  ),
];
