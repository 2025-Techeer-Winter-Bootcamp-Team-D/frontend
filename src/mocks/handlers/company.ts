import { http, HttpResponse } from "msw";

export const companyHandlers = [
  // 기업 검색
  // http.get('/api/companies/search', ({ request }) => {
  //   const url = new URL(request.url)
  //   const query = url.searchParams.get('q')
  //   return HttpResponse.json({
  //     companies: []
  //   })
  // }),
  // 기업 상세
  // http.get('/api/companies/:id', ({ params }) => {
  //   return HttpResponse.json({
  //     id: params.id,
  //     name: '테스트 기업'
  //   })
  // }),
  // 기업 비교
  // http.post('/api/companies/compare', async ({ request }) => {
  //   const body = await request.json()
  //   return HttpResponse.json({
  //     companies: []
  //   })
  // }),
];
