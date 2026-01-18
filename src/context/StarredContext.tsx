import React, { createContext, useContext, useState, ReactNode } from "react";

interface StarredContextType {
  starred: Set<string>;
  toggleStar: (code: string) => void;
}

const StarredContext = createContext<StarredContextType | undefined>(undefined);

export function StarredProvider({ children }: { children: ReactNode }) {
  const [starred, setStarred] = useState<Set<string>>(
    new Set(["005930", "000660", "055550"]),
  );

  const toggleStar = (code: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  return (
    <StarredContext.Provider value={{ starred, toggleStar }}>
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
