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
export const logout = (refresh: string) => {
  return api.post<LogoutResponse>("/users/logout/", { refresh });
};

/**
 * 즐겨찾기 목록 조회
 * GET /api/users/favorites/
 */
export const getFavorites = () => {
  return api.get<FavoriteItem[]>("/users/favorites/");
};

/**
 * 즐겨찾기 추가
 * POST /api/users/favorites/
 */
export const addFavorite = (companyId: string) => {
  return api.post<FavoriteActionResponse>("/users/favorites/", {
    companyId,
  });
};

/**
 * 즐겨찾기 삭제
 * DELETE /api/users/favorites/:favoriteId/
 */
export const removeFavorite = (favoriteId: number) => {
  return api.delete<FavoriteActionResponse>(`/users/favorites/${favoriteId}/`);
};

// 방문 기록 관련 타입
export interface VisitItem {
  visitId: number;
  stockCode: string;
  companyName: string;
  logoUrl: string;
  visitedAt: string;
}

export interface VisitActionResponse {
  status: number;
  message: string;
  data: VisitItem | null;
}

/**
 * 방문 기록 목록 조회
 * GET /api/users/visits/
 */
export const getVisits = () => {
  return api.get<VisitItem[]>("/users/visits/");
};

/**
 * 방문 기록 추가
 * POST /api/users/visits/
 */
export const addVisit = (stockCode: string) => {
  return api.post<VisitActionResponse>("/users/visits/", { stockCode });
};

/**
 * 방문 기록 삭제
 * DELETE /api/users/visits/:visitId/
 */
export const removeVisit = (visitId: number) => {
  return api.delete<VisitActionResponse>(`/users/visits/${visitId}/`);
};

/**
 * 전체 방문 기록 삭제
 * DELETE /api/users/visits/clear/
 */
export const clearVisits = () => {
  return api.delete<{ status: number; message: string; data: null }>(
    "/users/visits/clear/",
  );
};
