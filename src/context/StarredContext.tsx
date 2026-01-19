/**
 * 즐겨찾기 Context - API 연동 버전
 *
 * 이 Context는 즐겨찾기 상태를 전역으로 관리합니다.
 * - 로그인 상태: 서버 API를 통해 즐겨찾기 관리
 * - 비로그인 상태: 로컬 상태만 사용 (임시)
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useFavorites } from "@/hooks/useFavorites";

interface StarredContextType {
  starred: Set<string>;
  toggleStar: (code: string) => void;
  isLoading: boolean;
  favoriteMap: Map<string, number>; // companyId -> favoriteId 매핑
}

const StarredContext = createContext<StarredContextType | undefined>(undefined);

export function StarredProvider({ children }: { children: ReactNode }) {
  // API 훅 사용
  const {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavoriteId,
  } = useFavorites();

  // 로컬 폴백 상태 (비로그인 시 사용)
  const [localStarred, setLocalStarred] = useState<Set<string>>(
    new Set(["005930", "000660", "055550"]),
  );

  // 로그인 여부 확인
  const isLoggedIn = !!localStorage.getItem("accessToken");

  // API 데이터를 Set으로 변환
  const starred = useMemo(() => {
    if (isLoggedIn && favorites.length > 0) {
      return new Set(favorites.map((fav) => fav.companyId));
    }
    return localStarred;
  }, [isLoggedIn, favorites, localStarred]);

  // companyId -> favoriteId 매핑 (삭제 시 필요)
  const favoriteMap = useMemo(() => {
    const map = new Map<string, number>();
    favorites.forEach((fav) => {
      map.set(fav.companyId, fav.favoriteId);
    });
    return map;
  }, [favorites]);

  // 즐겨찾기 토글
  const toggleStar = useCallback(
    (code: string) => {
      if (isLoggedIn) {
        // 로그인 상태: API 호출
        if (isFavorite(code)) {
          const favoriteId = getFavoriteId(code);
          if (favoriteId) {
            removeFavorite(favoriteId);
          }
        } else {
          addFavorite(code);
        }
      } else {
        // 비로그인 상태: 로컬 상태만 변경
        setLocalStarred((prev) => {
          const next = new Set(prev);
          if (next.has(code)) {
            next.delete(code);
          } else {
            next.add(code);
          }
          return next;
        });
      }
    },
    [isLoggedIn, isFavorite, getFavoriteId, removeFavorite, addFavorite],
  );

  return (
    <StarredContext.Provider
      value={{ starred, toggleStar, isLoading, favoriteMap }}
    >
      {children}
    </StarredContext.Provider>
  );
}

export function useStarred() {
  const context = useContext(StarredContext);
  if (context === undefined) {
    throw new Error("useStarred must be used within a StarredProvider");
  }
  return context;
}
