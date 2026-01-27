import React from "react";
import { Target, TrendingUp, TrendingDown } from "lucide-react";

interface OutlookCardProps {
  data: {
    analysis: string;
    positive_factor: string | string[];
    risk_factor: string | string[];
    opinion: string;
    target_price?: number;
    current_price?: number;
    previous_target_price?: number;
    analyzed_at?: string;
    analyst_rating?: number;
    data_sources?: {
      news_count: number;
      report_count: number;
    };
  };
}

const OutlookCard: React.FC<OutlookCardProps> = ({ data }) => {
  const {
    analysis,
    positive_factor,
    risk_factor,
    opinion,
    target_price,
    analyzed_at,
    data_sources,
  } = data;

  // string | string[] 둘 다 처리
  const positiveFactors = Array.isArray(positive_factor)
    ? positive_factor
    : [positive_factor];
  const riskFactors = Array.isArray(risk_factor) ? risk_factor : [risk_factor];

  return (
    <div className="bg-blue-600 rounded-[28px] p-6 shadow-lg w-full max-w-6xl mx-auto">
      <div className="space-y-6">
        {/* 전망 요약 */}
        <div className="bg-blue-500/50 rounded-xl p-6 border border-blue-400/30">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Target size={20} className="text-blue-200" />
              전망 요약
            </h4>
            <span className="text-xs text-blue-200">
              분석일시:{" "}
              {analyzed_at
                ? new Date(analyzed_at).toLocaleString("ko-KR")
                : "-"}
            </span>
          </div>
          <p className="text-blue-50 leading-relaxed whitespace-pre-wrap">
            {analysis}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 긍정적 요인 */}
          <div className="bg-blue-500/50 rounded-xl p-5 border border-blue-400/30">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-emerald-300" />
              <h4 className="font-bold text-emerald-300">긍정적 요인</h4>
            </div>
            <div className="space-y-2">
              {positiveFactors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-blue-100"
                >
                  <span className="text-emerald-300 mt-0.5">•</span>
                  <p>{factor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 리스크 요인 */}
          <div className="bg-blue-500/50 rounded-xl p-5 border border-blue-400/30">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={20} className="text-rose-300" />
              <h4 className="font-bold text-rose-300">리스크 요인</h4>
            </div>
            <div className="space-y-2">
              {riskFactors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-blue-100"
                >
                  <span className="text-rose-300 mt-0.5">•</span>
                  <p>{factor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 투자 의견 */}
        <div className="bg-blue-500/50 rounded-xl p-6 border border-blue-400/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white">투자 의견</h4>
            {data_sources && (
              <div className="flex gap-4">
                <span className="text-xs text-blue-200">
                  뉴스 출처: {data_sources.news_count}건
                </span>
                <span className="text-xs text-blue-200">
                  리포트 출처: {data_sources.report_count}건
                </span>
              </div>
            )}
          </div>
          <p className="text-blue-50 leading-relaxed">{opinion}</p>

          {target_price && (
            <div className="mt-4 pt-4 border-t border-blue-400/30">
              <span className="text-sm text-blue-200">목표 주가: </span>
              <span className="text-lg font-bold text-yellow-300">
                {target_price.toLocaleString()}원
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutlookCard;
