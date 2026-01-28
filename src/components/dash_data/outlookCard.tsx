import React from "react";
import { motion } from "framer-motion";
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

  // 카드 섹션 애니메이션 variants
  const containerVariants = {
    hover: {
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 70, 255, 0.25)",
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  const cardVariants = {
    initial: { opacity: 0.9, y: 0 },
    hover: {
      opacity: 1,
      y: -4,
      boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.25, ease: "easeOut" as const },
    },
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.2,
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="bg-quasa-gray rounded-[28px] p-6 shadow-lg w-full max-w-6xl mx-auto cursor-pointer"
      initial="initial"
      whileHover="hover"
      variants={containerVariants}
    >
      <div className="space-y-6">
        {/* 전망 요약 */}
        <motion.div
          className="bg-white rounded-xl p-6 border border-gray-200 transition-colors hover:border-[#0046FF]/30"
          variants={cardVariants}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-bold text-black flex items-center gap-2">
              {/* <motion.span variants={iconVariants}>
                <Target size={20} className="text-[#0046FF]" />
              </motion.span> */}
              전망 요약
            </h4>
            <span className="text-xs text-gray-500">
              분석일시:{" "}
              {analyzed_at
                ? new Date(analyzed_at).toLocaleString("ko-KR")
                : "-"}
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {analysis}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 긍정적 요인 */}
          <motion.div
            className="bg-white rounded-xl p-5 border border-gray-200 transition-colors hover:border-emerald-300"
            variants={cardVariants}
          >
            <div className="flex items-center gap-2 mb-4">
              {/* <motion.span variants={iconVariants}>
                <TrendingUp size={20} className="text-emerald-500" />
              </motion.span> */}
              <h4 className="font-bold text-emerald-500">긍정적 요인</h4>
            </div>
            <div className="space-y-2">
              {positiveFactors.map((factor, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700"
                  initial={{ opacity: 0.8, x: 0 }}
                  whileHover={{
                    opacity: 1,
                    x: 4,
                    transition: { duration: 0.2 },
                  }}
                >
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <p>{factor}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 리스크 요인 */}
          <motion.div
            className="bg-white rounded-xl p-5 border border-gray-200 transition-colors hover:border-rose-300"
            variants={cardVariants}
          >
            <div className="flex items-center gap-2 mb-4">
              {/* <motion.span variants={iconVariants}>
                <TrendingDown size={20} className="text-rose-500" />
              </motion.span> */}
              <h4 className="font-bold text-rose-500">리스크 요인</h4>
            </div>
            <div className="space-y-2">
              {riskFactors.map((factor, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700"
                  initial={{ opacity: 0.8, x: 0 }}
                  whileHover={{
                    opacity: 1,
                    x: 4,
                    transition: { duration: 0.2 },
                  }}
                >
                  <span className="text-rose-500 mt-0.5">•</span>
                  <p>{factor}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 투자 의견 */}
        <motion.div
          className="bg-white rounded-xl p-6 border border-gray-200 transition-colors hover:border-[#0046FF]/30"
          variants={cardVariants}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-black">투자 의견</h4>
            {data_sources && (
              <div className="flex gap-4">
                <span className="text-xs text-gray-500">
                  뉴스 출처: {data_sources.news_count}건
                </span>
                <span className="text-xs text-gray-500">
                  리포트 출처: {data_sources.report_count}건
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed">{opinion}</p>

          {target_price && (
            <motion.div
              className="mt-4 pt-4 border-t border-gray-200"
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <span className="text-sm text-gray-500">목표 주가: </span>
              <span className="text-lg font-bold text-[#0046FF]">
                {target_price.toLocaleString()}원
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OutlookCard;
