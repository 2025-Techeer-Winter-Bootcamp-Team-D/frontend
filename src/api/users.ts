import { api } from "./axios";
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
 */
export const signup = (data: SignupRequest) => {
  return api.post<SignupResponse>("/users/signup/", data);
};

/**
 * 로그인
 */
export const login = (data: LoginRequest) => {
  return api.post<LoginResponse>("/users/login/", data);
};

/**
 * 로그아웃
 */
export const logout = () => {
  return api.post<LogoutResponse>("/users/logout/");
};

/**
 * 즐겨찾기 목록 조회
 * GET /users/favorites/
 */
export const getFavorites = () => {
  // 정의되지 않은 FavoritesListResponse 대신 FavoriteItem[] 사용
  return api.get<FavoriteItem[]>("/api/users/favorites/");
};

/**
 * 즐겨찾기 추가
 * POST /users/favorites/
 */
export const addFavorite = (companyId: string) => {
  // 정의되지 않은 FavoriteAddResponse 대신 FavoriteActionResponse 사용
  return api.post<FavoriteActionResponse>("/api/users/favorites/", {
    companyId,
  });
};

/**
 * 즐겨찾기 삭제
 */
export const removeFavorite = (favoriteId: number) => {
  return api.delete<FavoriteActionResponse>(
    `/api/users/favorites/${favoriteId}/`,
  );
};
