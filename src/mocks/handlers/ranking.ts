import { http, HttpResponse, delay } from "msw";

// 기업 순위 타입
type CompanyRank = {
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
type IndustryRank = {
  rank: number;
  name: string;
  change: string;
  marketCap: string;
};

// 키워드 순위 타입
type KeywordRank = {
  rank: number;
  keyword: string;
  count: number;
};

// In-Memory 기업 순위 데이터 저장소 (빈 상태로 시작)
const companyRankings = new Map<string, CompanyRank>();

// In-Memory 산업 순위 데이터 저장소 (빈 상태로 시작)
const industryRankings = new Map<string, IndustryRank>();

// In-Memory 키워드 순위 데이터 저장소 (빈 상태로 시작)
const keywordRankings = new Map<string, KeywordRank>();

export const rankingHandlers = [
  // 기업 순위 등록 (POST /rankings/companies)
  http.post("/rankings/companies", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Partial<CompanyRank>;

    if (!body.code || !body.name) {
      return HttpResponse.json(
        { status: 400, message: "code와 name은 필수입니다." },
        { status: 400 },
      );
    }

    const existingCount = companyRankings.size;
    const newRank: CompanyRank = {
      rank: body.rank ?? existingCount + 1,
      name: body.name,
      code: body.code,
      sector: body.sector ?? "미분류",
      price: body.price ?? "0",
      change: body.change ?? "0%",
      changeVal: body.changeVal ?? 0,
      marketCap: body.marketCap ?? "0",
    };

    companyRankings.set(body.code, newRank);

    // 순위 재정렬
    const sorted = Array.from(companyRankings.values()).sort(
      (a, b) => a.rank - b.rank,
    );
    sorted.forEach((item, index) => {
      item.rank = index + 1;
      companyRankings.set(item.code, item);
    });

    return HttpResponse.json(
      {
        status: 201,
        message: "기업 순위가 등록되었습니다.",
        data: newRank,
      },
      { status: 201 },
    );
  }),

  // 기업 순위 조회 (GET /rankings/companies)
  http.get("/rankings/companies", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const sector = url.searchParams.get("sector");
    const limit = parseInt(url.searchParams.get("limit") ?? "15", 10);

    let companies = Array.from(companyRankings.values());

    // 섹터 필터링
    if (sector) {
      companies = companies.filter((c) => c.sector === sector);
    }

    // 순위순 정렬 및 제한
    companies = companies.sort((a, b) => a.rank - b.rank).slice(0, limit);

    return HttpResponse.json({
      status: 200,
      message: "기업 순위 조회 성공",
      data: companies,
    });
  }),

  // 기업 순위 삭제 (DELETE /rankings/companies/:code)
  http.delete("/rankings/companies/:code", async ({ params }) => {
    await delay(150);
    const { code } = params;
    const companyCode = code as string;

    if (!companyRankings.has(companyCode)) {
      return HttpResponse.json(
        { status: 404, message: "해당 기업을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    companyRankings.delete(companyCode);

    // 순위 재정렬
    const sorted = Array.from(companyRankings.values()).sort(
      (a, b) => a.rank - b.rank,
    );
    sorted.forEach((item, index) => {
      item.rank = index + 1;
      companyRankings.set(item.code, item);
    });

    return HttpResponse.json({
      status: 200,
      message: "기업 순위가 삭제되었습니다.",
    });
  }),

  // 산업 순위 등록 (POST /rankings/industries)
  http.post("/rankings/industries", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Partial<IndustryRank>;

    if (!body.name) {
      return HttpResponse.json(
        { status: 400, message: "name은 필수입니다." },
        { status: 400 },
      );
    }

    const existingCount = industryRankings.size;
    const newRank: IndustryRank = {
      rank: body.rank ?? existingCount + 1,
      name: body.name,
      change: body.change ?? "0%",
      marketCap: body.marketCap ?? "0",
    };

    industryRankings.set(body.name, newRank);

    return HttpResponse.json(
      {
        status: 201,
        message: "산업 순위가 등록되었습니다.",
        data: newRank,
      },
      { status: 201 },
    );
  }),

  // 산업 순위 조회 (GET /rankings/industries)
  http.get("/rankings/industries", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);

    const industries = Array.from(industryRankings.values())
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);

    return HttpResponse.json({
      status: 200,
      message: "산업 순위 조회 성공",
      data: industries,
    });
  }),

  // 키워드 순위 등록 (POST /rankings/keywords)
  http.post("/rankings/keywords", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Partial<KeywordRank>;

    if (!body.keyword) {
      return HttpResponse.json(
        { status: 400, message: "keyword는 필수입니다." },
        { status: 400 },
      );
    }

    const existing = keywordRankings.get(body.keyword);
    const existingCount = keywordRankings.size;

    const newRank: KeywordRank = {
      rank: body.rank ?? existing?.rank ?? existingCount + 1,
      keyword: body.keyword,
      count: body.count ?? (existing?.count ?? 0) + 1,
    };

    keywordRankings.set(body.keyword, newRank);

    // count 기준으로 순위 재정렬
    const sorted = Array.from(keywordRankings.values()).sort(
      (a, b) => b.count - a.count,
    );
    sorted.forEach((item, index) => {
      item.rank = index + 1;
      keywordRankings.set(item.keyword, item);
    });

    return HttpResponse.json(
      {
        status: 201,
        message: "키워드 순위가 등록되었습니다.",
        data: newRank,
      },
      { status: 201 },
    );
  }),

  // 뉴스 키워드 빈도 순위 조회 (GET /rankings/keywords)
  http.get("/rankings/keywords", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);

    const keywords = Array.from(keywordRankings.values())
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);

    return HttpResponse.json({
      status: 200,
      message: "키워드 순위 조회 성공",
      data: keywords,
    });
  }),
];
