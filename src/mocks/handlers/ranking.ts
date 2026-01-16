import { http, HttpResponse, delay } from "msw";

export const rankingHandlers = [
  // 기업 순위 조회 (시가총액 기준)
  http.get("/rankings/companies", async () => {
    await delay(200);

    const companies = [
      {
        rank: 1,
        name: "삼성전자",
        code: "005930",
        sector: "반도체",
        price: "73,400",
        change: "+0.96%",
        changeVal: 700,
        marketCap: "430조",
      },
      {
        rank: 2,
        name: "SK하이닉스",
        code: "000660",
        sector: "반도체",
        price: "164,500",
        change: "+2.10%",
        changeVal: 3400,
        marketCap: "119조",
      },
      {
        rank: 3,
        name: "LG에너지솔루션",
        code: "373220",
        sector: "2차전지",
        price: "385,000",
        change: "-1.50%",
        changeVal: -5000,
        marketCap: "90조",
      },
      {
        rank: 4,
        name: "삼성바이오로직스",
        code: "207940",
        sector: "바이오",
        price: "812,000",
        change: "+2.50%",
        changeVal: 19000,
        marketCap: "57조",
      },
      {
        rank: 5,
        name: "현대차",
        code: "005380",
        sector: "자동차",
        price: "245,000",
        change: "-1.20%",
        changeVal: -3000,
        marketCap: "51조",
      },
      {
        rank: 6,
        name: "기아",
        code: "000270",
        sector: "자동차",
        price: "112,000",
        change: "-0.80%",
        changeVal: -900,
        marketCap: "44조",
      },
      {
        rank: 7,
        name: "셀트리온",
        code: "068270",
        sector: "바이오",
        price: "185,000",
        change: "+1.80%",
        changeVal: 3300,
        marketCap: "40조",
      },
      {
        rank: 8,
        name: "POSCO홀딩스",
        code: "005490",
        sector: "철강",
        price: "420,000",
        change: "+0.50%",
        changeVal: 2000,
        marketCap: "35조",
      },
      {
        rank: 9,
        name: "신한지주",
        code: "055550",
        sector: "금융",
        price: "78,200",
        change: "+0.51%",
        changeVal: 400,
        marketCap: "40조",
      },
      {
        rank: 10,
        name: "KB금융",
        code: "105560",
        sector: "금융",
        price: "72,100",
        change: "+1.12%",
        changeVal: 800,
        marketCap: "38조",
      },
      {
        rank: 11,
        name: "NAVER",
        code: "035420",
        sector: "서비스",
        price: "185,500",
        change: "-0.30%",
        changeVal: -500,
        marketCap: "30조",
      },
      {
        rank: 12,
        name: "삼성SDI",
        code: "006400",
        sector: "2차전지",
        price: "385,000",
        change: "+0.20%",
        changeVal: 1000,
        marketCap: "26조",
      },
      {
        rank: 13,
        name: "LG화학",
        code: "051910",
        sector: "화학",
        price: "450,000",
        change: "-1.10%",
        changeVal: -5000,
        marketCap: "31조",
      },
      {
        rank: 14,
        name: "카카오",
        code: "035720",
        sector: "서비스",
        price: "52,100",
        change: "+0.80%",
        changeVal: 400,
        marketCap: "23조",
      },
      {
        rank: 15,
        name: "하나금융지주",
        code: "086790",
        sector: "금융",
        price: "58,400",
        change: "-0.32%",
        changeVal: -200,
        marketCap: "28조",
      },
    ];

    return HttpResponse.json({
      status: 200,
      message: "기업 순위 조회 성공",
      data: companies,
    });
  }),

  // 산업 순위 조회
  http.get("/rankings/industries", async () => {
    await delay(200);

    const industries = [
      { rank: 1, name: "반도체", change: "+2.5%", marketCap: "600조" },
      { rank: 2, name: "2차전지", change: "-0.8%", marketCap: "150조" },
      { rank: 3, name: "바이오", change: "+1.2%", marketCap: "100조" },
      { rank: 4, name: "자동차", change: "-0.5%", marketCap: "95조" },
      { rank: 5, name: "금융", change: "+0.3%", marketCap: "90조" },
    ];

    return HttpResponse.json({
      status: 200,
      message: "산업 순위 조회 성공",
      data: industries,
    });
  }),

  // 뉴스 키워드 빈도 순위 조회
  http.get("/rankings/keywords", async () => {
    await delay(200);

    const keywords = [
      { rank: 1, keyword: "AI", count: 1520 },
      { rank: 2, keyword: "반도체", count: 1340 },
      { rank: 3, keyword: "2차전지", count: 980 },
      { rank: 4, keyword: "금리", count: 870 },
      { rank: 5, keyword: "환율", count: 650 },
    ];

    return HttpResponse.json({
      status: 200,
      message: "키워드 순위 조회 성공",
      data: keywords,
    });
  }),
];
