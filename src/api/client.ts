import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// (선택 사항) 요청 인터셉터: 로그인 후 토큰이 있다면 자동으로 헤더에 넣어줌
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // 예시
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
