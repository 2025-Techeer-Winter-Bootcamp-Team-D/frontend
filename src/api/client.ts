import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {},
});

// (선택 사항) 요청 인터셉터: 로그인 후 토큰이 있다면 자동으로 헤더에 넣어줌
api.interceptors.request.use((config) => {
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;
  if (!isFormData && config.headers && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("accessToken"); // 예시
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 요청 인터셉터: JWT 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
