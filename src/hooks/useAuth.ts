/**
 * useAuth - 인증 상태 관리 훅
 * accessToken 존재 여부를 확인하여 API 요청 활성화 결정에 사용
 */

import { useMemo, useSyncExternalStore } from "react";

// localStorage 변경 감지를 위한 스냅샷
const getSnapshot = () => localStorage.getItem("accessToken");

// 서버 사이드 렌더링용 (항상 null)
const getServerSnapshot = () => null;

// localStorage 변경 구독
const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  // custom event for same-tab updates
  window.addEventListener("auth-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("auth-change", callback);
  };
};

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
  const accessToken = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return useMemo(
    () => ({
      isAuthenticated: !!accessToken,
      accessToken,
    }),
    [accessToken],
  );
}
