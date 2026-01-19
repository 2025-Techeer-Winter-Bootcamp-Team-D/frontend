import axios from "axios";

// 인증이 필요하지 않은 엔드포인트 목록
const PUBLIC_ENDPOINTS = ["/api/users/signup/", "/api/users/login/"];

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {},
});

// 요청 인터셉터: Content-Type 설정 및 JWT 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    // FormData가 아닌 경우 Content-Type 설정
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;
    if (!isFormData && config.headers && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    // 공개 엔드포인트에는 Authorization 헤더를 추가하지 않음
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
      config.url?.includes(endpoint),
    );

    if (!isPublicEndpoint) {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
