import { http, HttpResponse } from "msw";

export const authHandlers = [
  // 로그인
  // http.post('/api/auth/login', async ({ request }) => {
  //   const body = await request.json()
  //   return HttpResponse.json({
  //     token: 'mock-token',
  //     user: { id: 1, email: body.email }
  //   })
  // }),
  // 회원가입
  // http.post('/api/auth/signup', async ({ request }) => {
  //   const body = await request.json()
  //   return HttpResponse.json({
  //     message: '회원가입 성공',
  //     user: { id: 1, email: body.email }
  //   })
  // }),
];
