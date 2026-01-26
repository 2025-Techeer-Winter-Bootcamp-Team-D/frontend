import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import { photoColors, techeerFont } from "../styles/techeerStyle";

// 모핑 애니메이션 설정
const morphAnimation = {
  universalTransition: {
    enabled: true,
    seriesKey: "main",
  },
};

// 로즈 차트 데이터 - 고정값으로 생성 (애니메이션 일관성 유지)
const roseData = Array.from({ length: 40 }, (_, i) => ({
  value: 40 + ((i * 17 + 7) % 60), // 의사 난수 패턴으로 고정값 생성
  itemStyle: {
    color: photoColors[i % photoColors.length],
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
  },
}));

const entryOptions: (GetOption | EChartsOption)[] = [
  // Step 1: 로즈 차트 + 텍스트 요소 등장
  (chart) => {
    const height = chart.getHeight();
    const fontSize = Math.min(chart.getWidth() * 0.08, 90);
    const textLeft = 150;
    const textTop = height * 0.22;

    return {
      backgroundColor: "transparent",
      graphic: {
        elements: [
          // 서브타이틀
          {
            type: "text",
            left: textLeft,
            top: textTop,
            style: {
              text: "QUAntitative Stock Analysis",
              font: `700 14px ${techeerFont}`,
              fill: "#0A1A3F",
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
          // 메인 타이틀 - QUASA
          {
            type: "text",
            left: textLeft,
            top: textTop + 30,
            style: {
              text: "QUASA",
              font: `900 ${fontSize}px ${techeerFont}`,
              fill: "#3B82F6",
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
          // 메인 타이틀 - Insight
          {
            type: "text",
            left: textLeft,
            top: textTop + 30 + fontSize * 1.05,
            style: {
              text: "Insight",
              font: `900 ${fontSize}px ${techeerFont}`,
              fill: "#1D4ED8",
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
          // 설명 텍스트
          {
            type: "text",
            left: textLeft,
            top: textTop + 55 + fontSize * 2.1,
            style: {
              text: "복잡한 재무 데이터를",
              font: `500 18px ${techeerFont}`,
              fill: "#4B5563",
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
          {
            type: "text",
            left: textLeft,
            top: textTop + 85 + fontSize * 2.1,
            style: {
              text: "직관적인 차트로 분석합니다.",
              font: `500 18px ${techeerFont}`,
              fill: "#4B5563",
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
          radius: ["25%", "75%"],
          center: ["68%", "50%"],
          roseType: "area",
          emphasis: {
            scale: true,
            scaleSize: 10,
            itemStyle: {
              shadowBlur: 20,
              shadowColor: "rgba(59, 130, 246, 0.6)",
            },
          },
          label: { show: false },
          itemStyle: { borderRadius: 5 },
          data: roseData,
          animationDuration: 1200,
          animationEasing: "cubicOut",
          ...morphAnimation,
        },
      ],
    };
  },

  // Step 2: 텍스트 페이드아웃 + 로즈 차트 수축
  (chart) => {
    const height = chart.getHeight();
    const fontSize = Math.min(chart.getWidth() * 0.08, 90);
    const textLeft = 150;
    const textTop = height * 0.22;

    return {
      graphic: {
        elements: [
          // 모든 텍스트 요소 페이드아웃
          {
            type: "text",
            left: textLeft,
            top: textTop,
            style: {
              text: "QUAntitative Stock Analysis",
              font: `700 14px ${techeerFont}`,
              fill: "#0A1A3F",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 500,
              keyframes: [
                { percent: 0, style: { opacity: 1 } },
                { percent: 1, style: { opacity: 0 } },
              ],
            },
          },
          {
            type: "text",
            left: textLeft,
            top: textTop + 30,
            style: {
              text: "QUASA",
              font: `900 ${fontSize}px ${techeerFont}`,
              fill: "#3B82F6",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 500,
              keyframes: [
                { percent: 0, style: { opacity: 1 } },
                { percent: 1, style: { opacity: 0 } },
              ],
            },
          },
          {
            type: "text",
            left: textLeft,
            top: textTop + 30 + fontSize * 1.05,
            style: {
              text: "Insight",
              font: `900 ${fontSize}px ${techeerFont}`,
              fill: "#1D4ED8",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 500,
              keyframes: [
                { percent: 0, style: { opacity: 1 } },
                { percent: 1, style: { opacity: 0 } },
              ],
            },
          },
          {
            type: "text",
            left: textLeft,
            top: textTop + 55 + fontSize * 2.1,
            style: {
              text: "복잡한 재무 데이터를",
              font: `500 18px ${techeerFont}`,
              fill: "#4B5563",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 500,
              keyframes: [
                { percent: 0, style: { opacity: 1 } },
                { percent: 1, style: { opacity: 0 } },
              ],
            },
          },
          {
            type: "text",
            left: textLeft,
            top: textTop + 85 + fontSize * 2.1,
            style: {
              text: "직관적인 차트로 분석합니다.",
              font: `500 18px ${techeerFont}`,
              fill: "#4B5563",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 500,
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
  duration: [2500, 1200],
  dark: false,
  background: "rgba(255, 255, 255, 0.95)",
});
