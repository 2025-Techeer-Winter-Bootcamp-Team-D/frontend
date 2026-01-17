import { http, HttpResponse, delay } from "msw";
import type { CompanyRank, IndustryRank, KeywordRank } from "../../types";

// 초기 기업 순위 목데이터
const initialCompanyRankings: CompanyRank[] = [
  {
    rank: 1,
    name: "삼성전자",
    code: "005930",
    sector: "반도체",
    price: "71,800",
    change: "+0.96%",
    changeVal: 700,
    marketCap: "428조",
  },
  {
    rank: 2,
    name: "SK하이닉스",
    code: "000660",
    sector: "반도체",
    price: "178,500",
    change: "+2.10%",
    changeVal: 3700,
    marketCap: "130조",
  },
  {
    rank: 3,
    name: "LG에너지솔루션",
    code: "373220",
    sector: "2차전지",
    price: "371,000",
    change: "-1.50%",
    changeVal: -5500,
    marketCap: "86조",
  },
  {
    rank: 4,
    name: "현대차",
    code: "005380",
    sector: "자동차",
    price: "245,000",
    change: "-1.20%",
    changeVal: -3000,
    marketCap: "52조",
  },
  {
    rank: 5,
    name: "신한지주",
    code: "055550",
    sector: "금융",
    price: "51,200",
    change: "+0.51%",
    changeVal: 260,
    marketCap: "26조",
  },
  {
    rank: 6,
    name: "KB금융",
    code: "105560",
    sector: "금융",
    price: "78,900",
    change: "+1.12%",
    changeVal: 880,
    marketCap: "32조",
  },
  {
    rank: 7,
    name: "카카오",
    code: "035720",
    sector: "IT",
    price: "42,350",
    change: "-2.30%",
    changeVal: -1000,
    marketCap: "18조",
  },
  {
    rank: 8,
    name: "NAVER",
    code: "035420",
    sector: "IT",
    price: "185,200",
    change: "+0.82%",
    changeVal: 1500,
    marketCap: "30조",
  },
  {
    rank: 9,
    name: "하나금융",
    code: "086790",
    sector: "금융",
    price: "62,100",
    change: "-0.32%",
    changeVal: -200,
    marketCap: "18조",
  },
  {
    rank: 10,
    name: "카카오뱅크",
    code: "323410",
    sector: "금융",
    price: "28,450",
    change: "-1.50%",
    changeVal: -430,
    marketCap: "13조",
  },
];

// In-Memory 기업 순위 데이터 저장소
const companyRankings = new Map<string, CompanyRank>(
  initialCompanyRankings.map((item) => [item.code, item]),
);

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
