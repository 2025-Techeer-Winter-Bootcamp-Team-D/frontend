import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// 즐겨찾기 데이터의 타입 정의 (프로젝트에 맞게 수정 가능)
interface StarredContextType {
  starredItems: string[];
  toggleStar: (id: string) => void;
  isStarred: (id: string) => boolean;
}

const StarredContext = createContext<StarredContextType | undefined>(undefined);

export const StarredProvider = ({ children }: { children: ReactNode }) => {
  const [starredItems, setStarredItems] = useState<string[]>([]);

  // 즐겨찾기 추가/해제 함수
  const toggleStar = (id: string) => {
    setStarredItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // 즐겨찾기 여부 확인 함수
  const isStarred = (id: string) => starredItems.includes(id);

  return (
    <StarredContext.Provider value={{ starredItems, toggleStar, isStarred }}>
      {children}
    </StarredContext.Provider>
  );
};

// 커스텀 훅 (App.tsx에서 useStarred를 쓰고 있으므로 필수)
export const useStarred = () => {
  const context = useContext(StarredContext);
  if (!context) {
    throw new Error("useStarred must be used within a StarredProvider");
  }
  return context;
};
