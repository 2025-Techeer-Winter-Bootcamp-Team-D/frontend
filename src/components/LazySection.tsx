import React, { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
}

/**
 * 뷰포트 진입 시에만 children을 렌더링하는 컴포넌트
 * Recharts 등 무거운 라이브러리의 초기 로딩을 지연시켜 Script Evaluation 시간 감소
 */
const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback,
  rootMargin = "100px",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0,
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={sectionRef}>{isVisible ? children : fallback}</div>;
};

export default LazySection;
