import axios from "axios";

export const api = axios.create({
  // 환경 변수 대신 직접 "/api"를 넣거나, .env 파일의 VITE_API_BASE_URL 값을 "/api"로 수정하세요.
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
