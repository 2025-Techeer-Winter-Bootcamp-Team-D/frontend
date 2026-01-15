import { http, HttpResponse } from "msw";

export const industryHandlers = [
  // 산업 목록
  // http.get('/api/industries', () => {
  //   return HttpResponse.json({
  //     industries: []
  //   })
  // }),
  // 산업 비교
  // http.get('/api/industries/compare', ({ request }) => {
  //   const url = new URL(request.url)
  //   return HttpResponse.json({
  //     data: []
  //   })
  // }),
];
