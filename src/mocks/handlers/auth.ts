import { http, HttpResponse } from "msw";

type LoginRequestBody = {
  email: string;
  password: string;
};

export const authHandlers = [
  // 회원가입
  http.post("/users/signup", async ({ request }) => {
    const { email, password } = (await request.json()) as LoginRequestBody;

    // 1️⃣ 필수 필드 누락
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

    // 2️⃣ 이미 사용 중인 이메일
    if (email === "test@test.com") {
      return HttpResponse.json(
        {
          status: 400,
          code: "ALREADY_EXISTS",
          message: "이미 사용 중인 이메일입니다.",
        },
        { status: 400 },
      );
    }

    // 3️⃣ 비밀번호 규칙 위반
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

    // 4️⃣ 성공
    return HttpResponse.json(
      {
        status: 201,
        message: "회원가입이 완료되었습니다.",
        userId: 550,
      },
      { status: 201 },
    );
  }),

  // 로그인
  http.post("/users/login", async ({ request }) => {
    const { email, password } = (await request.json()) as LoginRequestBody;

    if (!email || !password) {
      return HttpResponse.json(
        { status: 400, message: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 },
      );
    }

    if (email !== "test@test.com") {
      return HttpResponse.json(
        { status: 404, message: "존재하지 않는 사용자입니다." },
        { status: 404 },
      );
    }

    return HttpResponse.json(
      {
        status: 200,
        accessToken: "mock-access-token",
      },
      { status: 200 },
    );
  }),
];
