/**
 * useAuth - 인증 상태 관리 훅
 * accessToken 존재 여부를 확인하여 API 요청 활성화 결정에 사용
 */

import { useState, useEffect, useCallback } from "react";

/**
 * 인증 토큰 변경 알림 (로그인/로그아웃 시 호출)
 */
export const notifyAuthChange = () => {
  window.dispatchEvent(new CustomEvent("auth-change"));
};

/**
 * 인증 상태 훅
 * @returns { isAuthenticated, accessToken }
 */
export function useAuth() {
  // 초기 상태: localStorage에서 직접 읽기 (새로고침 시에도 유지)
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  });

  // localStorage 변경 감지
  const handleStorageChange = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    setAccessToken(token);
  }, []);

  useEffect(() => {
    // 다른 탭에서의 localStorage 변경 감지
    window.addEventListener("storage", handleStorageChange);
    // 같은 탭에서의 인증 변경 감지 (로그인/로그아웃 시)
    window.addEventListener("auth-change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleStorageChange);
    };
  }, [handleStorageChange]);

  return {
    isAuthenticated: !!accessToken,
    accessToken,
  };
}
