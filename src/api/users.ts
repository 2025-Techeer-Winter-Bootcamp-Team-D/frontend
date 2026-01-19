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
  companyId: number;
  companyName: string;
  logoUrl: string;
  createdAt?: string;
}

export interface FavoritesListResponse {
  status: number;
  message: string;
  data: FavoriteItem[];
}

export interface FavoriteAddResponse {
  status: number;
  message: string;
  data: FavoriteItem;
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
 */
export const getFavorites = () => {
  return api.get<FavoritesListResponse>("/api/users/favorites/");
};

/**
 * 즐겨찾기 추가
 * POST /users/favorites/
 */
export const addFavorite = (companyId: number) => {
  return api.post<FavoriteAddResponse>("/api/users/favorites/", { companyId });
};

/**
 * 즐겨찾기 삭제
 * DELETE /users/favorites/:favoriteId
 */
export const removeFavorite = (favoriteId: number) => {
  return api.delete(`/api/users/favorites/${favoriteId}`);
};
