import axios from "axios";

// 환경 변수나 기본값을 모두 '/api'로 통일해야 프록시가 작동합니다.
export const api = axios.create({
  // 백엔드 전체 주소를 지우고 상대 경로인 '/api'만 사용하세요.
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

// 인터셉터는 확인용으로 그대로 두셔도 무방합니다.
api.interceptors.request.use((config) => {
  console.log(`🚀 실제 요청 주소: ${config.baseURL}${config.url}`);
  // ... 나머지 로직
  return config;
});
