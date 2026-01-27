import React from "react";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Info,
  ArrowRight,
  Star,
} from "lucide-react";

interface OutlookCardProps {
  data: {
    analysis: string;
    positive_factor: string[]; // 여러 요인으로 변경
    risk_factor: string[]; // 여러 요인으로 변경
    opinion: string;
    target_price: number;
    current_price: number;
    previous_target_price?: number;
    analyzed_at?: string;
    analyst_rating?: number; // 1-5점
  };
}

const OutlookCard: React.FC<OutlookCardProps> = ({ data }) => {
  const {
    analysis,
    positive_factor,
    risk_factor,
    opinion,
    target_price,
    current_price,
    previous_target_price,
    analyzed_at,
    analyst_rating,
  } = data;

  const targetPriceChange =
    target_price - (previous_target_price || target_price);
  const isTargetPriceUp = targetPriceChange > 0;
  const isTargetPriceDown = targetPriceChange < 0;

  return (
    <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* 상단 섹션: 헤더 및 AI 분석 요약 */}
      <div className="flex flex-col gap-4 pb-6 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="text-blue-600" size={22} />
            <h3 className="font-bold text-xl text-slate-800">AI 컨센서스</h3>
          </div>
          <span className="text-[12px] text-gray-500 font-medium">
            {analyzed_at ? `${analyzed_at} 업데이트` : "실시간 업데이트"}
          </span>
        </div>

        <p className="text-lg leading-relaxed text-slate-700 font-medium bg-blue-50/50 rounded-xl p-4">
          {analysis}
        </p>

        {analyst_rating && (
          <div className="flex items-center gap-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                fill={i < analyst_rating ? "#FACC15" : "#E0E0E0"}
                strokeWidth={0}
                className="text-yellow-400"
              />
            ))}
            <span className="text-sm font-semibold text-gray-600 ml-1">
              애널리스트 평가 ({analyst_rating}/5)
            </span>
          </div>
        )}
      </div>

      {/* 목표가 및 현재가 비교 섹션 */}
      <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-50">
        <div className="flex flex-col items-start bg-blue-50/30 rounded-xl p-4">
          <span className="text-sm text-gray-500 mb-1">AI 목표주가</span>
          <span className="text-2xl font-extrabold text-blue-600">
            {target_price.toLocaleString()}원
          </span>
          {previous_target_price && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${isTargetPriceUp ? "text-red-500" : isTargetPriceDown ? "text-blue-500" : "text-gray-600"} mt-1`}
            >
              {isTargetPriceUp ? (
                <TrendingUp size={16} />
              ) : isTargetPriceDown ? (
                <TrendingDown size={16} />
              ) : null}
              {targetPriceChange !== 0 && (
                <span>
                  {Math.abs(targetPriceChange).toLocaleString()}원
                  {previous_target_price &&
                    ` (${((targetPriceChange / previous_target_price) * 100).toFixed(1)}%)`}
                </span>
              )}
              {targetPriceChange === 0 && (
                <span className="text-gray-500">변동 없음</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end bg-gray-50 rounded-xl p-4">
          <span className="text-sm text-gray-500 mb-1">현재가</span>
          <span className="text-2xl font-extrabold text-slate-800">
            {current_price.toLocaleString()}원
          </span>
          <span className="text-sm text-gray-500 mt-1">시장가 기준</span>
        </div>
      </div>

      {/* 긍정적/리스크 요인 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6 border-b border-gray-50">
        {/* 긍정적 요인 */}
        <div className="flex flex-col gap-3 bg-red-50/30 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-red-600" size={20} />
            <h4 className="font-semibold text-red-700 text-base">
              핵심 성장 요인
            </h4>
          </div>
          <ul className="list-disc pl-5 text-slate-700 text-sm leading-relaxed space-y-1">
            {positive_factor.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>

        {/* 리스크 요인 */}
        <div className="flex flex-col gap-3 bg-blue-50/30 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-blue-600" size={20} />
            <h4 className="font-semibold text-blue-700 text-base">
              주의해야 할 리스크
            </h4>
          </div>
          <ul className="list-disc pl-5 text-slate-700 text-sm leading-relaxed space-y-1">
            {risk_factor.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI 투자 의견 섹션 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Info className="text-gray-500" size={20} />
          <h4 className="font-bold text-lg text-slate-800">
            QUASA AI 최종 투자 의견
          </h4>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-100">
          <p className="text-base text-blue-800 font-semibold leading-relaxed">
            {opinion}
          </p>
          <button className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0">
            전체 리포트 보기 <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutlookCard;
