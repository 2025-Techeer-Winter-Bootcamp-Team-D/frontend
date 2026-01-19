/**
 * 즐겨찾기 관련 React Query 훅
 *
 * 사용법:
 * const { favorites, isLoading, addFavorite, removeFavorite } = useFavorites();
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFavorites,
  addFavorite as addFavoriteApi,
  removeFavorite as removeFavoriteApi,
  type FavoriteItem,
} from "@/api/users";

// Query Key 상수 (다른 곳에서 재사용 가능)
export const FAVORITES_QUERY_KEY = ["favorites"];

export function useFavorites() {
  const queryClient = useQueryClient();

  // 1. 즐겨찾기 목록 조회
  const {
    data: favorites = [],
    isLoading,
    isError,
    error,
  } = useQuery<FavoriteItem[]>({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: async () => {
      const response = await getFavorites();
      return response.data;
    },
  });

  // 2. 즐겨찾기 추가
  const addMutation = useMutation({
    mutationFn: (companyId: string) => addFavoriteApi(companyId),
    onSuccess: () => {
      // 성공 시 목록 다시 불러오기
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  // 3. 즐겨찾기 삭제
  const removeMutation = useMutation({
    mutationFn: (favoriteId: number) => removeFavoriteApi(favoriteId),
    onSuccess: () => {
      // 성공 시 목록 다시 불러오기
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  // 특정 종목이 즐겨찾기에 있는지 확인하는 헬퍼 함수
  const isFavorite = (companyId: string): boolean => {
    return favorites.some((fav) => fav.companyId === companyId);
  };

  // 종목코드로 favoriteId 찾기 (삭제 시 필요)
  const getFavoriteId = (companyId: string): number | undefined => {
    return favorites.find((fav) => fav.companyId === companyId)?.favoriteId;
  };

  return {
    // 상태
    favorites,
    isLoading,
    isError,
    error,

    // 액션
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,

    // 헬퍼
    isFavorite,
    getFavoriteId,
  };
}
