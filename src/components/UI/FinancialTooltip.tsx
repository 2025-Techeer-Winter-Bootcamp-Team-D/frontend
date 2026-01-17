import React, { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipData {
  title: string;
  description: string;
  formula?: {
    result: string;
    components: { label: string; operator?: string }[];
  };
}

// 재무 지표별 설명 데이터
const FINANCIAL_TOOLTIPS: Record<string, TooltipData> = {
  사업분석: {
    title: "사업분석",
    description:
      "기업의 주요 사업 영역별 매출 비중을 분석합니다. 매출 구성을 통해 기업의 핵심 사업과 수익 구조를 파악할 수 있습니다.",
  },
  매출액: {
    title: "매출액 (Revenue)",
    description:
      "기업이 상품 판매나 서비스 제공을 통해 얻은 총 수익입니다. 기업 규모와 성장성을 판단하는 기본 지표입니다.",
    formula: {
      result: "매출액",
      components: [
        { label: "상품매출" },
        { label: "제품매출", operator: "+" },
        { label: "서비스매출", operator: "+" },
      ],
    },
  },
  영업이익: {
    title: "영업이익 (Operating Profit)",
    description:
      "기업의 주요 영업활동에서 발생한 이익입니다. 본업의 수익성을 나타내는 핵심 지표입니다.",
    formula: {
      result: "영업이익",
      components: [
        { label: "매출액" },
        { label: "매출원가", operator: "−" },
        { label: "판매비와관리비", operator: "−" },
      ],
    },
  },
  당기순이익: {
    title: "당기순이익 (Net Income)",
    description:
      "해당 기간 동안 기업이 벌어들인 최종 이익입니다. 모든 수익과 비용을 반영한 실제 순이익을 나타냅니다.",
    formula: {
      result: "당기순이익",
      components: [
        { label: "영업이익" },
        { label: "영업외수익", operator: "+" },
        { label: "영업외비용", operator: "−" },
        { label: "법인세비용", operator: "−" },
      ],
    },
  },
};

interface FinancialTooltipProps {
  type: "사업분석" | "매출액" | "영업이익" | "당기순이익";
  size?: number;
}

const FinancialTooltip: React.FC<FinancialTooltipProps> = ({
  type,
  size = 14,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const data = FINANCIAL_TOOLTIPS[type];

  useEffect(() => {
    if (isVisible && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // 아래 공간이 부족하면 위로 표시
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [isVisible]);

  if (!data) return null;

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div ref={iconRef} className="cursor-help">
        <HelpCircle
          size={size}
          className="text-gray-300 hover:text-shinhan-blue transition-colors"
        />
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-fade-in ${
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          } left-1/2 -translate-x-1/2`}
        >
          {/* 화살표 */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-gray-100 rotate-45 ${
              position === "top"
                ? "bottom-[-6px] border-r border-b"
                : "top-[-6px] border-l border-t"
            }`}
          />

          {/* 제목 */}
          <h4 className="font-bold text-slate-800 text-sm mb-2">
            {data.title}
          </h4>

          {/* 설명 */}
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            {data.description}
          </p>

          {/* 계산식 표 */}
          {data.formula && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-[10px] text-gray-400 mb-2 font-medium">
                계산 공식
              </div>
              <div className="space-y-1.5">
                {data.formula.components.map((item, idx) => (
                  <div key={idx} className="flex items-center text-xs">
                    <span className="w-4 text-center font-medium text-gray-400">
                      {item.operator || ""}
                    </span>
                    <span className="text-slate-700">{item.label}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-1.5 mt-1.5">
                  <div className="flex items-center text-xs">
                    <span className="w-4 text-center font-bold text-shinhan-blue">
                      =
                    </span>
                    <span className="font-bold text-shinhan-blue">
                      {data.formula.result}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialTooltip;
