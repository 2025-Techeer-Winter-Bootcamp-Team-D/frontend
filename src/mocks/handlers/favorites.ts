import { http, HttpResponse, delay } from "msw";

// In-Memory 즐겨찾기 데이터 저장소
interface FavoriteItem {
  favoriteId: number;
  companyId: number;
  companyName: string;
  logoUrl: string;
  createdAt: string;
}

let nextFavoriteId = 11;
const favorites = new Map<number, FavoriteItem>([
  [
    10,
    {
      favoriteId: 10,
      companyId: 101,
      companyName: "삼성전자",
      logoUrl: "https://example.com/samsung.png",
      createdAt: "2026-01-09T10:00:00Z",
    },
  ],
  [
    9,
    {
      favoriteId: 9,
      companyId: 202,
      companyName: "LG에너지솔루션",
      logoUrl: "https://example.com/lg.png",
      createdAt: "2026-01-08T15:00:00Z",
    },
  ],
  [
    8,
    {
      favoriteId: 8,
      companyId: 303,
      companyName: "신한지주",
      logoUrl: "https://example.com/shinhan.png",
      createdAt: "2026-01-07T12:00:00Z",
    },
  ],
]);

// 기업 정보 매핑 (companyId -> 기업명)
const companyInfo: Record<number, { name: string; logoUrl: string }> = {
  101: { name: "삼성전자", logoUrl: "https://example.com/samsung.png" },
  202: { name: "LG에너지솔루션", logoUrl: "https://example.com/lg.png" },
  303: { name: "신한지주", logoUrl: "https://example.com/shinhan.png" },
  404: { name: "SK하이닉스", logoUrl: "https://example.com/skhynix.png" },
  505: { name: "현대차", logoUrl: "https://example.com/hyundai.png" },
  606: { name: "KB금융", logoUrl: "https://example.com/kb.png" },
};

export const favoritesHandlers = [
  // 즐겨찾기 목록 조회 (GET /users/favorites)
  http.get("/users/favorites", async ({ request }) => {
    await delay(200);
    const authHeader = request.headers.get("Authorization");

    // 인증 체크 (실제로는 토큰 검증 필요)
    if (!authHeader) {
      return HttpResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "로그인이 필요한 서비스입니다.",
        },
        { status: 401 },
      );
    }

    const favoriteList = Array.from(favorites.values()).sort(
      (a, b) => b.favoriteId - a.favoriteId,
    );

    if (favoriteList.length === 0) {
      return HttpResponse.json(
        {
          status: 404,
          code: "EMPTY_LIST",
          message: "즐겨찾기한 기업이 없습니다.",
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(
      {
        status: 200,
        message: "즐겨찾기 목록 조회 성공",
        data: favoriteList,
      },
      { status: 200 },
    );
  }),

  // 즐겨찾기 추가 (POST /users/favorites)
  http.post("/users/favorites", async ({ request }) => {
    await delay(300);
    const authHeader = request.headers.get("Authorization");

    // 인증 체크
    if (!authHeader) {
      return HttpResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "로그인 후 이용 가능합니다.",
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { companyId: number };
    const { companyId } = body;

    // 필수 필드 검증
    if (!companyId || typeof companyId !== "number") {
      return HttpResponse.json(
        {
          status: 400,
          code: "INVALID_REQUEST",
          message: "올바른 기업 ID를 입력해주세요.",
        },
        { status: 400 },
      );
    }

    // 이미 즐겨찾기에 추가된 기업인지 확인
    const existingFavorite = Array.from(favorites.values()).find(
      (f) => f.companyId === companyId,
    );
    if (existingFavorite) {
      return HttpResponse.json(
        {
          status: 409,
          code: "ALREADY_EXISTS",
          message: "이미 즐겨찾기에 추가된 기업입니다.",
        },
        { status: 409 },
      );
    }

    // 기업 정보 조회 (없으면 기본값 사용)
    const company = companyInfo[companyId] || {
      name: `기업 ${companyId}`,
      logoUrl: "",
    };

    // 새 즐겨찾기 생성
    const newFavorite: FavoriteItem = {
      favoriteId: nextFavoriteId++,
      companyId,
      companyName: company.name,
      logoUrl: company.logoUrl,
      createdAt: new Date().toISOString(),
    };

    favorites.set(newFavorite.favoriteId, newFavorite);

    return HttpResponse.json(
      {
        status: 201,
        message: "즐겨찾기에 추가되었습니다.",
        data: newFavorite,
      },
      { status: 201 },
    );
  }),

  // 즐겨찾기 삭제 (DELETE /users/favorites/:favoriteId)
  http.delete("/users/favorites/:favoriteId", async ({ request, params }) => {
    await delay(200);
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return HttpResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "로그인이 필요한 서비스입니다.",
        },
        { status: 401 },
      );
    }

    const favoriteId = Number(params.favoriteId);

    if (!favorites.has(favoriteId)) {
      return HttpResponse.json(
        {
          status: 404,
          code: "NOT_FOUND",
          message: "해당 즐겨찾기를 찾을 수 없습니다.",
        },
        { status: 404 },
      );
    }

    favorites.delete(favoriteId);

    return HttpResponse.json(
      {
        status: 200,
        message: "즐겨찾기에서 삭제되었습니다.",
      },
      { status: 200 },
    );
  }),
];
