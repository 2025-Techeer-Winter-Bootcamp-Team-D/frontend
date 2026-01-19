import { api } from "./client";
import type {
  LoginRequest,
  SignupRequest,
  SignupResponse,
  LoginResponse,
  LogoutResponse,
} from "@/types";

// 즐겨찾기 관련 타입
export interface FavoriteItem {
  favoriteId: number;
  companyId: string; // 종목코드 (예: "005930")
  companyName: string;
  logoUrl: string;
}

// 추가/삭제 응답 타입
export interface FavoriteActionResponse {
  status: number;
  message: string;
  data: FavoriteItem | null;
}

/**
 * 회원가입
 * POST /users/signup/
 */
export const signup = (data: SignupRequest) => {
  return api.post<SignupResponse>("/api/users/signup/", data);
};

/**
 * 로그인
 * POST /users/login/
 */
export const login = (data: LoginRequest) => {
  return api.post<LoginResponse>("/api/users/login/", data);
};
/**
 * 로그아웃
 * POST /users/logout/
 */
export const logout = () => {
  return api.post<LogoutResponse>("/api/users/logout/");
};

/**
 * 즐겨찾기 목록 조회
 * GET /users/favorites/
 * @returns 즐겨찾기 배열 (직접 반환)
 */
export const getFavorites = () => {
  return api.get<FavoriteItem[]>("/api/users/favorites/");
};

/**
 * 즐겨찾기 추가
 * POST /users/favorites/
 * @param companyId 종목코드 (예: "005930")
 */
export const addFavorite = (companyId: string) => {
  return api.post<FavoriteActionResponse>("/api/users/favorites/", {
    companyId,
  });
};

/**
 * 즐겨찾기 삭제
 * DELETE /users/favorites/{favoriteId}/
 * @param favoriteId 즐겨찾기 ID
 */
export const removeFavorite = (favoriteId: number) => {
  return api.delete<FavoriteActionResponse>(
    `/api/users/favorites/${favoriteId}/`,
  );
};
