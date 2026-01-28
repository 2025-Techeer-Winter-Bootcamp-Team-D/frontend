import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompanyOutlook } from "../api/company";
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { SkeletonOutlook } from "./Skeleton";
import type { CompanyOutlookData } from "../types";

interface OutlookSectionProps {
  companyCode: string;
}

/**
 * 기업 전망 분석 섹션
 * IntersectionObserver를 사용해 뷰포트에 들어올 때만 데이터를 가져옵니다.
 * 이렇게 하면 10초 걸리는 outlook API가 초기 LCP를 블로킹하지 않습니다.
 */
const OutlookSection: React.FC<OutlookSectionProps> = ({ companyCode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver로 섹션이 뷰포트에 들어오는지 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // 한번 보이면 관찰 중단
        }
      },
      {
        rootMargin: "200px", // 200px 전에 미리 로딩 시작
        threshold: 0,
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 뷰포트에 들어올 때만 데이터 fetch
  const {
    data: outlookData,
    isLoading: isOutlookLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["company", "outlook", companyCode],
    queryFn: async () => {
      const response = await getCompanyOutlook(companyCode);
      return response.data.data as CompanyOutlookData;
    },
    enabled: isVisible, // 뷰포트에 들어올 때만 활성화
    staleTime: 1000 * 60 * 10, // 10분 캐싱
  });

  return (
    <div ref={sectionRef}>
      {!isVisible || isOutlookLoading ? (
        <SkeletonOutlook />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <AlertCircle size={48} className="mb-3 text-red-400" />
          <p className="text-sm mb-1">
            기업 전망 데이터를 불러오는데 실패했습니다.
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {(error as Error)?.message || "알 수 없는 오류"}
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            다시 시도
          </button>
        </div>
      ) : outlookData ? (
        <div className="space-y-6">
          {/* 전망 요약 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-bold text-slate-800">전망 요약</h4>
              <span className="text-xs text-gray-400">
                분석일시:{" "}
                {outlookData.analyzed_at
                  ? new Date(outlookData.analyzed_at).toLocaleString("ko-KR")
                  : "-"}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {outlookData.analysis}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 긍정적 요인 */}
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-green-600" />
                <h4 className="font-bold text-green-800">긍정적 요인</h4>
              </div>
              <div className="flex items-start gap-2 text-sm text-green-700">
                <p>{outlookData.positive_factor}</p>
              </div>
            </div>

            {/* 리스크 요인 */}
            <div className="bg-red-50 rounded-xl p-5 border border-red-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={20} className="text-red-600" />
                <h4 className="font-bold text-red-800">리스크 요인</h4>
              </div>
              <div className="flex items-start gap-2 text-sm text-red-700">
                <p>{outlookData.risk_factor}</p>
              </div>
            </div>
          </div>

          {/* 투자 의견 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800">투자 의견</h4>
              <div className="flex gap-4">
                <span className="text-xs text-gray-500">
                  뉴스 출처: {outlookData.data_sources?.news_count ?? 0}건
                </span>
                <span className="text-xs text-gray-500">
                  리포트 출처: {outlookData.data_sources?.report_count ?? 0}건
                </span>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {outlookData.opinion}
            </p>

            {outlookData.target_price && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">목표 주가: </span>
                <span className="text-lg font-bold text-blue-600">
                  {outlookData.target_price.toLocaleString()}원
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Target size={48} className="mb-3 opacity-50" />
          <p className="text-sm">기업 전망 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default OutlookSection;
