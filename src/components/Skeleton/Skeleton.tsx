import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// 기본 스켈레톤 블록
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  style,
}) => (
  <div
    className={`bg-gray-200 rounded animate-pulse ${className}`}
    style={style}
  />
);

// 텍스트 라인 스켈레톤
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = "",
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
      />
    ))}
  </div>
);

// 카드 스켈레톤
export const SkeletonCard: React.FC<SkeletonProps> = ({ className = "" }) => (
  <div
    className={`bg-white rounded-2xl p-5 border border-gray-100 ${className}`}
  >
    <Skeleton className="h-4 w-24 mb-4" />
    <Skeleton className="h-8 w-32 mb-4" />
    <Skeleton className="h-32 w-full" />
  </div>
);

// 차트 스켈레톤
export const SkeletonChart: React.FC<{
  height?: string;
  className?: string;
}> = ({ height = "h-64", className = "" }) => (
  <div className={`${height} ${className}`}>
    <div className="h-full flex items-end gap-2 px-4 pb-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end">
          <Skeleton
            className="w-full rounded-t"
            style={{ height: `${30 + Math.random() * 50}%` }}
          />
        </div>
      ))}
    </div>
  </div>
);

// 뉴스 카드 스켈레톤
export const SkeletonNewsCard: React.FC<SkeletonProps> = ({
  className = "",
}) => (
  <div
    className={`p-5 rounded-2xl bg-white/5 border border-white/10 ${className}`}
  >
    <div className="flex justify-between mb-2">
      <Skeleton className="h-4 w-16 bg-gray-600" />
      <Skeleton className="h-3 w-12 bg-gray-700" />
    </div>
    <Skeleton className="h-5 w-full mb-2 bg-gray-600" />
    <Skeleton className="h-5 w-4/5 mb-3 bg-gray-600" />
    <Skeleton className="h-3 w-20 bg-gray-700" />
  </div>
);

// 뉴스 리스트 스켈레톤 (다크 테마용)
export const SkeletonNewsList: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonNewsCard key={i} />
    ))}
  </div>
);

// 라이트 테마용 뉴스 카드 스켈레톤
export const SkeletonNewsCardLight: React.FC<SkeletonProps> = ({
  className = "",
}) => (
  <div className={`p-4 border border-gray-100 rounded-xl ${className}`}>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-2/3 mb-2" />
    <div className="flex gap-2 mt-2">
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

// 테이블 스켈레톤
export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 4,
  cols = 3,
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className={`h-4 ${j === 0 ? "w-20" : "flex-1"}`} />
        ))}
      </div>
    ))}
  </div>
);

// 랭킹 리스트 스켈레톤
export const SkeletonRankingList: React.FC<{ count?: number }> = ({
  count = 5,
}) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

// 시장 지수 카드 스켈레톤
export const SkeletonMarketCard: React.FC<SkeletonProps> = ({
  className = "",
}) => (
  <div
    className={`p-8 bg-white border border-slate-100 rounded-3xl min-h-[280px] ${className}`}
  >
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-4 w-12" />
    </div>
    <Skeleton className="h-10 w-28 mb-4" />
    <div className="h-32 mt-4">
      <SkeletonChart height="h-full" />
    </div>
  </div>
);

// 공시 카드 스켈레톤
export const SkeletonDisclosure: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="pb-4 border-b border-slate-50">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
);

// 파이 차트 스켈레톤
export const SkeletonPieChart: React.FC<{ size?: number }> = ({
  size = 130,
}) => (
  <div className="flex items-center">
    <div className="w-1/2 flex justify-center">
      <Skeleton
        className="rounded-full"
        style={{ width: size, height: size }}
      />
    </div>
    <div className="w-1/2 space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
  </div>
);

// 재무 차트 카드 스켈레톤
export const SkeletonFinancialCard: React.FC<SkeletonProps> = ({
  className = "",
}) => (
  <div
    className={`bg-white rounded-xl p-5 border border-gray-100 ${className}`}
  >
    <Skeleton className="h-5 w-20 mb-4" />
    <div className="flex justify-between mb-6 pb-4 border-b border-gray-50">
      <div>
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="text-right">
        <Skeleton className="h-3 w-12 mb-2" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
    <SkeletonChart height="h-48" />
  </div>
);

// 전체 페이지 로딩 스켈레톤
export const SkeletonPage: React.FC = () => (
  <div className="animate-fade-in pb-12 space-y-6">
    <div className="flex items-center gap-4 mb-6">
      <Skeleton className="w-16 h-16 rounded-2xl" />
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <SkeletonCard className="min-h-[200px]" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <SkeletonCard className="min-h-[400px]" />
      </div>
      <div className="lg:col-span-4">
        <SkeletonCard className="min-h-[400px]" />
      </div>
    </div>
  </div>
);

// 검색 결과 스켈레톤
export const SkeletonSearchResults: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

// 주가 차트 로딩 스켈레톤
export const SkeletonStockChart: React.FC<SkeletonProps> = ({
  className = "",
}) => (
  <div className={`${className}`}>
    <div className="flex items-baseline gap-4 mb-4 pb-4 border-b border-gray-100">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
    <div className="h-[300px] flex flex-col justify-between py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-px w-full" />
      ))}
    </div>
  </div>
);

// Sankey 차트 스켈레톤
export const SkeletonSankey: React.FC<{ height?: string }> = ({
  height = "h-[500px]",
}) => (
  <div className={`${height} flex items-center justify-center`}>
    <div className="flex items-center gap-8 w-full px-8">
      {/* 왼쪽 노드들 */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-24 rounded" />
        ))}
      </div>
      {/* 중간 연결선 */}
      <div className="flex-1 flex flex-col items-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-2 w-full rounded-full" />
        ))}
      </div>
      {/* 오른쪽 노드들 */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-24 rounded" />
        ))}
      </div>
    </div>
  </div>
);

// 전망 분석 스켈레톤
export const SkeletonOutlook: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <div className="flex justify-between items-center mb-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
      <SkeletonText lines={4} />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-green-50 rounded-xl p-5 border border-green-100">
        <Skeleton className="h-5 w-24 mb-4" />
        <SkeletonText lines={2} />
      </div>
      <div className="bg-red-50 rounded-xl p-5 border border-red-100">
        <Skeleton className="h-5 w-24 mb-4" />
        <SkeletonText lines={2} />
      </div>
    </div>
  </div>
);

// 공시 테이블 스켈레톤
export const SkeletonDisclosureTable: React.FC<{ rows?: number }> = ({
  rows = 5,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <div className="grid grid-cols-12 bg-gray-100 py-3">
      <div className="col-span-2 px-4">
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="col-span-3 px-4">
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="col-span-7 px-4">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-12 border-b border-gray-200 py-3">
        <div className="col-span-2 px-4">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="col-span-3 px-4">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="col-span-7 px-4">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
