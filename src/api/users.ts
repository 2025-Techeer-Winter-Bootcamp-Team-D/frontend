import { api } from "./client";
import type { LoginRequest, SignupResponse, LoginResponse } from "@/types";

/**
 * 회원가입
 * POST /users/signup
 */
export const signup = (data: LoginRequest) => {
  return api.post<SignupResponse>("/users/signup", data);
};

/**
 * 로그인
 * POST /users/login
 */
export const login = (data: LoginRequest) => {
  return api.post<LoginResponse>("/users/login", data);
};
