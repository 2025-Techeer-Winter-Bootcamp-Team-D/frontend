import { http, HttpResponse } from "msw";

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

const mockCompanies = companyData as Record<string, CompanyInfo>;

export const companyHandlers = [
  // 기업 검색
  http.get("/companies", ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("keyword");

    // 400 에러: keyword 파라미터가 없거나 빈 값인 경우
    if (!keyword || keyword.trim() === "") {
      return HttpResponse.json(
        {
          status: 400,
          message: "검색 키워드가 올바르지 않습니다.",
        },
        { status: 400 },
      );
    }

    const results = Object.entries(mockCompanies)
      .filter(([, company]) =>
        company.company_name.toLowerCase().includes(keyword.toLowerCase()),
      )
      .map(([key, company]) => ({
        companyId: key,
        name: company.company_name,
        logo: company.logo_url,
      }));

    // 404 에러: 검색 결과가 없는 경우
    if (results.length === 0) {
      return HttpResponse.json(
        {
          status: 404,
          message: "기업을 찾을 수 없습니다.",
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(
      {
        status: 200,
        message: "기업 검색을 완료하였습니다.",
        data: results,
      },
      { status: 200 },
    );
  }),

  // 주가 데이터 조회
  http.get("/companies/:company_id/ohlcv", ({ params, request }) => {
    const { company_id } = params;
    const url = new URL(request.url);
    const interval = url.searchParams.get("interval");

    // 400 에러: interval 파라미터가 없거나 빈 값인 경우
    if (!interval || interval.trim() === "") {
      return HttpResponse.json(
        {
          status: 400,
          message: "interval 파라미터가 올바르지 않습니다.",
        },
        { status: 400 },
      );
    }

    // 404 에러: 해당 기업이 없는 경우
    const companyId = company_id as string;
    if (!mockCompanies[companyId]) {
      return HttpResponse.json(
        {
          status: 404,
          message: "기업을 찾을 수 없습니다.",
        },
        { status: 404 },
      );
    }

    // mock 주가 데이터 생성
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

    return HttpResponse.json(
      {
        status: 200,
        message: "과거 주가 데이터 조회를 성공하였습니다.",
        data: mockOhlcvData,
      },
      { status: 200 },
    );
  }),

  // 기업 정보 조회
  http.get<{ ticker_symbol: string }>(
    "/companies/:ticker_symbol",
    ({ params }) => {
      const { ticker_symbol } = params;
      const company = mockCompanies[ticker_symbol];

      if (!company) {
        return HttpResponse.json(
          {
            status: 404,
            message: "해당 기업을 찾을 수 없습니다.",
          },
          { status: 404 },
        );
      }

      return HttpResponse.json(
        {
          status: 200,
          message: "기업 정보 조회 성공",
          data: company,
        },
        { status: 200 },
      );
    },
  ),
];
