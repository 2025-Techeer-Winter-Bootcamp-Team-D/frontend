import { http, HttpResponse } from "msw";
import companyData from "../data/company.json";

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
  // 기업 정보 조회
  http.get("/companies/:ticker_symbol", ({ params }) => {
    const { ticker_symbol } = params;
    const company = mockCompanies[ticker_symbol as string];

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
  }),
];
