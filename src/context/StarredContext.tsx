import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  type FavoriteItem,
} from "@/api/users";

// 즐겨찾기 데이터의 타입 정의
interface StarredContextType {
  starred: Set<string>;
  starredItems: string[];
  toggleStar: (id: string) => void;
  isStarred: (id: string) => boolean;
  isLoading: boolean;
  favoriteMap?: Map<string, FavoriteItem>;
}

const StarredContext = createContext<StarredContextType | undefined>(undefined);

export const StarredProvider = ({ children }: { children: ReactNode }) => {
  const [favoriteMap, setFavoriteMap] = useState<Map<string, FavoriteItem>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);

  // companyId 배열로 변환
  const starredItems = Array.from(favoriteMap.keys());

  // Set 형태로 변환
  const starred = new Set(starredItems);

  // 초기 로딩: 서버에서 즐겨찾기 목록 조회
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await getFavorites();
        const items = response.data;
        const newMap = new Map<string, FavoriteItem>();
        if (Array.isArray(items)) {
          items.forEach((item) => {
            newMap.set(item.companyId, item);
          });
        }
        setFavoriteMap(newMap);
      } catch {
        // 에러 시 빈 목록 유지
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // 즐겨찾기 추가/해제 함수
  const toggleStar = useCallback(
    async (id: string) => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("로그인이 필요합니다.");
        return;
      }

      setIsLoading(true);
      try {
        if (favoriteMap.has(id)) {
          const favoriteItem = favoriteMap.get(id);
          if (favoriteItem) {
            const response = await removeFavorite(favoriteItem.favoriteId);

            if (response.status === 200) {
              setFavoriteMap((prev) => {
                const newMap = new Map(prev);
                newMap.delete(id);
                return newMap;
              });
            }
          }
        } else {
          // 추가 로직 (기존 유지)
          const response = await addFavorite(id);

          if (response.data && response.data.data) {
            const newFavorite = response.data.data;
            setFavoriteMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(id, newFavorite);
              return newMap;
            });
          }
        }
      } catch (error: any) {
        if (error.response && error.response.data) {
          const errorMsg =
            error.response.data.message ||
            error.response.data.companyId?.[0] ||
            "처리 중 오류가 발생했습니다.";
          console.error("API Error:", errorMsg);
        } else {
          console.error("즐겨찾기 처리 중 알 수 없는 오류:", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [favoriteMap],
  );

  // 즐겨찾기 여부 확인 함수
  const isStarred = useCallback(
    (id: string) => favoriteMap.has(id),
    [favoriteMap],
  );

  return (
    <StarredContext.Provider
      value={{
        starred,
        starredItems,
        favoriteMap,
        toggleStar,
        isStarred,
        isLoading,
      }}
    >
      {children}
    </StarredContext.Provider>
  );
};

export const useStarred = () => {
  const context = useContext(StarredContext);
  if (!context) {
    throw new Error("useStarred must be used within a StarredProvider");
  }
  return context;
};
