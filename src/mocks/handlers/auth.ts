import { http, HttpResponse, delay } from "msw";
import type { User, LoginRequest } from "../../types";

// In-Memory 사용자 데이터 저장소
let nextUserId = 2;
const users = new Map<string, User>([
  [
    "test@test.com",
    {
      id: 1,
      email: "test@test.com",
      password: "Test123!@#",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  ],
]);

// In-Memory 세션 저장소 (토큰 -> 사용자)
const sessions = new Map<string, User>();

// 토큰 생성 헬퍼
function generateToken(): string {
  return `mock-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

export const authHandlers = [
  // 회원가입 (POST /users/signup)
  http.post("/users/signup", async ({ request }) => {
    await delay(300);
    const { email, password } = (await request.json()) as LoginRequest;

    // 필수 필드 누락
    if (!email || !password) {
      return HttpResponse.json(
        {
          status: 400,
          code: "MISSING_FIELD",
          message: "이메일과 비밀번호는 필수 입력 항목입니다.",
        },
        { status: 400 },
      );
    }

    // 이미 사용 중인 이메일
    if (users.has(email)) {
      return HttpResponse.json(
        {
          status: 400,
          code: "ALREADY_EXISTS",
          message: "이미 사용 중인 이메일입니다.",
        },
        { status: 400 },
      );
    }

    // 비밀번호 규칙 위반
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return HttpResponse.json(
        {
          status: 400,
          code: "INVALID_PASSWORD",
          message:
            "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.",
        },
        { status: 400 },
      );
    }

    // 사용자 생성
    const newUser: User = {
      id: nextUserId++,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    users.set(email, newUser);

    return HttpResponse.json(
      {
        status: 201,
        message: "회원가입이 완료되었습니다.",
        userId: newUser.id,
      },
      { status: 201 },
    );
  }),

  // 로그인 (POST /users/login)
  http.post("/users/login", async ({ request }) => {
    await delay(200);
    const { email, password } = (await request.json()) as LoginRequest;

    if (!email || !password) {
      return HttpResponse.json(
        { status: 400, message: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 },
      );
    }

    const user = users.get(email);

    // 존재하지 않는 사용자
    if (!user) {
      return HttpResponse.json(
        { status: 404, message: "존재하지 않는 사용자입니다." },
        { status: 404 },
      );
    }

    // 비밀번호 불일치
    if (user.password !== password) {
      return HttpResponse.json(
        { status: 401, message: "비밀번호가 일치하지 않습니다." },
        { status: 401 },
      );
    }

    // 토큰 생성 및 세션 저장
    const accessToken = generateToken();
    sessions.set(accessToken, user);

    return HttpResponse.json(
      {
        status: 200,
        message: "로그인 성공",
        accessToken,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 200 },
    );
  }),

  // 로그아웃 (POST /users/logout)
  http.post("/users/logout", async ({ request }) => {
    await delay(100);
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token && sessions.has(token)) {
      sessions.delete(token);
    }

    return HttpResponse.json(
      {
        status: 200,
        message: "로그아웃 되었습니다.",
      },
      { status: 200 },
    );
  }),

  // 현재 사용자 정보 조회 (GET /users/me)
  http.get("/users/me", async ({ request }) => {
    await delay(100);
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token || !sessions.has(token)) {
      return HttpResponse.json(
        { status: 401, message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const user = sessions.get(token)!;

    return HttpResponse.json(
      {
        status: 200,
        data: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 200 },
    );
  }),
];
