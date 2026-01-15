import { http, HttpResponse, delay } from "msw";
import type {
  CompareCompany,
  Comparison,
  ComparisonListResponse,
  DeleteComparisonResponse,
  CreateComparisonRequest,
  AddCompanyToComparisonRequest,
} from "../../types";

let nextId = 1;
const comparisons = new Map<number, Comparison>();

function makeCompany(stockCode: string): CompareCompany {
  const name =
    stockCode === "005930"
      ? "삼성전자"
      : stockCode === "000660"
        ? "SK하이닉스"
        : stockCode === "035420"
          ? "NAVER"
          : "비교회사";

  return {
    stockCode,
    name,
    revenue: Math.floor(Math.random() * 1000),
    operatingProfit: Math.floor(Math.random() * 300),
    roe: +(Math.random() * 20 + 1).toFixed(1),
    per: +(Math.random() * 15 + 1).toFixed(1),
  };
}

export const comparisonHandlers = [
  // 기업 비교 생성 (POST /comparisons)
  http.post("/comparisons", async ({ request }) => {
    await delay(300);

    const body = (await request
      .json()
      .catch(() => ({}))) as Partial<CreateComparisonRequest>;

    // companies는 number[] (회사 ID), stockCode로 변환
    const companyIds: number[] = body?.companies ?? [5930, 660];
    const stockCodes = companyIds.map((id) => String(id).padStart(6, "0"));

    const id = nextId++;
    const comparison: Comparison = {
      id,
      title: body?.name ?? `비교 ${id}`,
      companies: stockCodes.map(makeCompany),
      createdAt: new Date().toISOString(),
    };

    comparisons.set(id, comparison);

    return HttpResponse.json(comparison, { status: 201 });
  }),

  // 기업 비교 목록 조회 (GET /comparisons)
  http.get("/comparisons", async () => {
    await delay(200);

    const response: ComparisonListResponse = {
      items: Array.from(comparisons.values()).map((c) => ({
        id: c.id,
        title: c.title,
        companyCount: c.companies.length,
        createdAt: c.createdAt,
      })),
    };

    return HttpResponse.json(response);
  }),

  // 기업 비교 조회 (GET /comparisons/{comparison_id})
  http.get("/comparisons/:comparison_id", async ({ params }) => {
    await delay(200);
    const id = Number(params.comparison_id);
    const found = comparisons.get(id);

    if (!found) {
      return HttpResponse.json(
        { message: "comparison not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(found);
  }),

  // 비교할 기업 추가 (POST /comparisons/{comparison_id})
  http.post("/comparisons/:comparison_id", async ({ params, request }) => {
    await delay(200);
    const id = Number(params.comparison_id);
    const found = comparisons.get(id);

    if (!found) {
      return HttpResponse.json(
        { message: "comparison not found" },
        { status: 404 },
      );
    }

    const body = (await request
      .json()
      .catch(() => ({}))) as Partial<AddCompanyToComparisonRequest>;
    const stockCode: string = body?.company ?? "035420";

    // 중복 방지
    if (!found.companies.some((c) => c.stockCode === stockCode)) {
      found.companies.push(makeCompany(stockCode));
    }

    comparisons.set(id, found);
    return HttpResponse.json(found);
  }),

  // 기업 비교 삭제 (DELETE /comparisons/{comparison_id})
  http.delete("/comparisons/:comparison_id", async ({ params }) => {
    await delay(200);
    const id = Number(params.comparison_id);
    comparisons.delete(id);

    const response: DeleteComparisonResponse = { ok: true };
    return HttpResponse.json(response);
  }),

  // 비교 매치업 내 기업 삭제 (DELETE /api/comparisons/{comparison_id}/{stock_code}/)
  http.delete(
    "/api/comparisons/:comparison_id/:stock_code/",
    async ({ params }) => {
      await delay(200);
      const id = Number(params.comparison_id);
      const stockCode = String(params.stock_code);
      const found = comparisons.get(id);

      if (!found) {
        return HttpResponse.json(
          { message: "comparison not found" },
          { status: 404 },
        );
      }

      found.companies = found.companies.filter(
        (c) => c.stockCode !== stockCode,
      );
      comparisons.set(id, found);
      return HttpResponse.json(found);
    },
  ),

  // /comparisons/{id}/{stockCode} 경로도 대비
  http.delete("/comparisons/:comparison_id/:stock_code", async ({ params }) => {
    await delay(200);
    const id = Number(params.comparison_id);
    const stockCode = String(params.stock_code);
    const found = comparisons.get(id);

    if (!found) {
      return HttpResponse.json(
        { message: "comparison not found" },
        { status: 404 },
      );
    }

    found.companies = found.companies.filter((c) => c.stockCode !== stockCode);
    comparisons.set(id, found);
    return HttpResponse.json(found);
  }),
];
