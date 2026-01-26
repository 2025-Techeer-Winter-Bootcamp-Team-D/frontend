import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import { techeerFont } from "../styles/techeerStyle";

// 모핑 애니메이션 설정
const morphAnimation = {
  universalTransition: {
    enabled: true,
    seriesKey: "main",
  },
};

// Liquid Glass 스타일 색상 - 반짝이는 글래스 효과
const liquidGlassColors = [
  {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(37, 99, 235, 0.95)" },
      { offset: 0.3, color: "rgba(59, 130, 246, 0.9)" },
      { offset: 1, color: "rgba(37, 99, 235, 0.85)" },
    ],
  },
  {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(59, 130, 246, 0.9)" },
      { offset: 0.3, color: "rgba(96, 165, 250, 0.85)" },
      { offset: 1, color: "rgba(59, 130, 246, 0.8)" },
    ],
  },
  {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(96, 165, 250, 0.85)" },
      { offset: 0.3, color: "rgba(147, 197, 253, 0.8)" },
      { offset: 1, color: "rgba(96, 165, 250, 0.75)" },
    ],
  },
  {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(147, 197, 253, 0.8)" },
      { offset: 0.3, color: "rgba(191, 219, 254, 0.75)" },
      { offset: 1, color: "rgba(147, 197, 253, 0.7)" },
    ],
  },
  {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(191, 219, 254, 0.75)" },
      { offset: 0.3, color: "rgba(224, 242, 254, 0.7)" },
      { offset: 1, color: "rgba(191, 219, 254, 0.65)" },
    ],
  },
  {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(224, 242, 254, 0.7)" },
      { offset: 0.3, color: "rgba(241, 245, 249, 0.65)" },
      { offset: 1, color: "rgba(224, 242, 254, 0.55)" },
    ],
  },
  {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(241, 245, 249, 0.6)" },
      { offset: 0.3, color: "rgba(255, 255, 255, 0.5)" },
      { offset: 1, color: "rgba(241, 245, 249, 0.4)" },
    ],
  },
];

// 로즈 차트 데이터 - 반짝이는 Liquid Glass 스타일
const roseData = Array.from({ length: 7 }, (_, i) => ({
  value: 45 - i * 4,
  itemStyle: {
    color: liquidGlassColors[i],
    borderColor: "rgba(255, 255, 255, 0.35)",
    borderWidth: 1.5,
    shadowBlur: 20,
    shadowColor: "rgba(37, 99, 235, 0.25)",
    shadowOffsetX: 0,
    shadowOffsetY: 6,
  },
}));

const entryOptions: (GetOption | EChartsOption)[] = [
  // Step 1: Apple/Toss 스타일 랜딩 - 로즈 차트 + 텍스트
  (chart) => {
    const width = chart.getWidth();
    const height = chart.getHeight();
    const mainFontSize = Math.min(width * 0.055, 56);
    const textLeft = width * 0.08;
    const textTop = height * 0.28;

    return {
      backgroundColor: "transparent",
      graphic: {
        elements: [
          // 서브타이틀 - QUANTUM ANALYTICS ENGINE
          {
            type: "text",
            left: textLeft,
            top: textTop,
            style: {
              text: "QUANTUM ANALYTICS ENGINE",
              font: `800 14px ${techeerFont}`,
              fill: "#3b82f6",
              letterSpacing: 2,
            },
            keyframeAnimation: {
              duration: 800,
              delay: 200,
              keyframes: [
                { percent: 0, style: { opacity: 0 } },
                { percent: 1, style: { opacity: 1 } },
              ],
            },
          },
          // 메인 타이틀 1줄
          {
            type: "text",
            left: textLeft,
            top: textTop + 35,
            style: {
              text: "금융 데이터의 본질,",
              font: `900 ${mainFontSize}px ${techeerFont}`,
              fill: "#191f28",
            },
            keyframeAnimation: {
              duration: 800,
              delay: 300,
              keyframes: [
                { percent: 0, style: { opacity: 0 } },
                { percent: 1, style: { opacity: 1 } },
              ],
            },
          },
          // 메인 타이틀 2줄 - QUASA 강조
          {
            type: "text",
            left: textLeft,
            top: textTop + 35 + mainFontSize * 1.25,
            style: {
              text: "QUASA에서 더 명확하게",
              font: `900 ${mainFontSize}px ${techeerFont}`,
              fill: "#191f28",
            },
            keyframeAnimation: {
              duration: 800,
              delay: 400,
              keyframes: [
                { percent: 0, style: { opacity: 0 } },
                { percent: 1, style: { opacity: 1 } },
              ],
            },
          },
          // QUASA 텍스트 오버레이 (블루 컬러)
          {
            type: "text",
            left: textLeft,
            top: textTop + 35 + mainFontSize * 1.25,
            style: {
              text: "QUASA",
              font: `900 ${mainFontSize}px ${techeerFont}`,
              fill: "#3b82f6",
            },
            keyframeAnimation: {
              duration: 800,
              delay: 400,
              keyframes: [
                { percent: 0, style: { opacity: 0 } },
                { percent: 1, style: { opacity: 1 } },
              ],
            },
          },
          // 설명 텍스트 1줄
          {
            type: "text",
            left: textLeft,
            top: textTop + 60 + mainFontSize * 2.5,
            style: {
              text: "흩어진 기업 정보를 하나의 투명하게 재구성합니다.",
              font: `500 19px ${techeerFont}`,
              fill: "#6b7684",
            },
            keyframeAnimation: {
              duration: 800,
              delay: 500,
              keyframes: [
                { percent: 0, style: { opacity: 0 } },
                { percent: 1, style: { opacity: 1 } },
              ],
            },
          },
          // 설명 텍스트 2줄
          {
            type: "text",
            left: textLeft,
            top: textTop + 90 + mainFontSize * 2.5,
            style: {
              text: "당신의 판단을 위한 가장 정교하고 깨끗한 데이터 레이어.",
              font: `500 19px ${techeerFont}`,
              fill: "#6b7684",
            },
            keyframeAnimation: {
              duration: 800,
              delay: 600,
              keyframes: [
                { percent: 0, style: { opacity: 0 } },
                { percent: 1, style: { opacity: 1 } },
              ],
            },
          },
        ],
      },
      series: [
        {
          type: "pie",
          id: "main",
          radius: ["15%", "85%"],
          center: ["70%", "50%"],
          roseType: "area",
          silent: true,
          emphasis: { disabled: true },
          label: { show: false },
          itemStyle: {
            borderRadius: 20,
            borderColor: "rgba(255, 255, 255, 0.25)",
            borderWidth: 1,
            shadowBlur: 30,
            shadowColor: "rgba(37, 99, 235, 0.4)",
            shadowOffsetY: 10,
          },
          data: roseData,
          animationType: "expansion",
          animationDuration: 1800,
          animationEasing: "cubicOut",
          ...morphAnimation,
        },
      ],
    };
  },

  // Step 2: 텍스트 페이드아웃 + 로즈 차트 수축
  (chart) => {
    const width = chart.getWidth();
    const height = chart.getHeight();
    const mainFontSize = Math.min(width * 0.055, 56);
    const textLeft = width * 0.08;
    const textTop = height * 0.28;

    return {
      graphic: {
        elements: [
          // 모든 텍스트 요소 페이드아웃
          {
            type: "text",
            left: textLeft,
            top: textTop,
            style: {
              text: "QUANTUM ANALYTICS ENGINE",
              font: `800 14px ${techeerFont}`,
              fill: "#3b82f6",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 800,
              keyframes: [
                { percent: 0, style: { opacity: 1 } },
                { percent: 1, style: { opacity: 0 } },
              ],
            },
          },
          {
            type: "text",
            left: textLeft,
            top: textTop + 35,
            style: {
              text: "금융 데이터의 본질,",
              font: `900 ${mainFontSize}px ${techeerFont}`,
              fill: "#191f28",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 800,
              keyframes: [
                { percent: 0, style: { opacity: 1 } },
                { percent: 1, style: { opacity: 0 } },
              ],
            },
          },
          {
            type: "text",
            left: textLeft,
            top: textTop + 35 + mainFontSize * 1.25,
            style: {
              text: "QUASA에서 더 명확하게",
              font: `900 ${mainFontSize}px ${techeerFont}`,
              fill: "#191f28",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 800,
              keyframes: [
                { percent: 0, style: { opacity: 1 } },
                { percent: 1, style: { opacity: 0 } },
              ],
            },
          },
          {
            type: "text",
            left: textLeft,
            top: textTop + 35 + mainFontSize * 1.25,
            style: {
              text: "QUASA",
              font: `900 ${mainFontSize}px ${techeerFont}`,
              fill: "#3b82f6",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 800,
              keyframes: [
                { percent: 0, style: { opacity: 1 } },
                { percent: 1, style: { opacity: 0 } },
              ],
            },
          },
          {
            type: "text",
            left: textLeft,
            top: textTop + 60 + mainFontSize * 2.5,
            style: {
              text: "흩어진 기업 정보를 하나의 투명하게 재구성합니다.",
              font: `500 19px ${techeerFont}`,
              fill: "#6b7684",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 800,
              keyframes: [
                { percent: 0, style: { opacity: 1 } },
                { percent: 1, style: { opacity: 0 } },
              ],
            },
          },
          {
            type: "text",
            left: textLeft,
            top: textTop + 90 + mainFontSize * 2.5,
            style: {
              text: "당신의 판단을 위한 가장 정교하고 깨끗한 데이터 레이어.",
              font: `500 19px ${techeerFont}`,
              fill: "#6b7684",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 800,
              keyframes: [
                { percent: 0, style: { opacity: 1 } },
                { percent: 1, style: { opacity: 0 } },
              ],
            },
          },
        ],
      },
      series: [
        {
          type: "pie",
          id: "main",
          radius: ["0%", "5%"],
          center: ["50%", "50%"],
          roseType: "area",
          emphasis: { disabled: true },
          label: { show: false },
          data: roseData.map((d) => ({ ...d, value: 0.1 })),
          animationDurationUpdate: 1000,
          animationEasingUpdate: "cubicIn",
          animationDelayUpdate: (idx: number) => idx * 10,
          ...morphAnimation,
        },
      ],
    };
  },
];

export default new Scene({
  option: entryOptions,
  file: "techeerEntry",
  duration: [1600, 1000],
  dark: false,
  background: "linear-gradient(135deg, #f0f7ff 0%, #eef2ff 60%, #e0e7ff 100%)",
});
