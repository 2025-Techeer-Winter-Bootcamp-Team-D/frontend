import Scene, { type GetOption } from "./Scene";
import {
  techeerGradients,
  techeerFont,
  techeerColorPalette,
} from "../styles/techeerStyle";

export function getTecheerEndingFontSize(chart: { getWidth: () => number }) {
  return Math.round(chart.getWidth() / 12);
}

const endingOptions: GetOption[] = [
  (chart) => {
    const width = chart.getWidth();
    const height = chart.getHeight();
    const size = getTecheerEndingFontSize(chart);
    const centerX = width / 2;
    const centerY = height / 2;

    // Create particle ring elements
    const particles: any[] = [];
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.35;
      particles.push({
        type: "circle",
        shape: {
          cx: centerX + Math.cos(angle) * radius,
          cy: centerY + Math.sin(angle) * radius,
          r: 8,
        },
        style: {
          fill: techeerColorPalette[i % techeerColorPalette.length],
          shadowBlur: 20,
          shadowColor: techeerColorPalette[i % techeerColorPalette.length],
        },
        keyframeAnimation: {
          duration: 2000,
          loop: true,
          keyframes: [
            {
              percent: 0,
              shape: {
                cx: centerX + Math.cos(angle) * radius,
                cy: centerY + Math.sin(angle) * radius,
              },
              easing: "sinusoidalInOut",
            },
            {
              percent: 0.5,
              shape: {
                cx: centerX + Math.cos(angle + 0.3) * (radius * 1.1),
                cy: centerY + Math.sin(angle + 0.3) * (radius * 1.1),
              },
              easing: "sinusoidalInOut",
            },
            {
              percent: 1,
              shape: {
                cx: centerX + Math.cos(angle) * radius,
                cy: centerY + Math.sin(angle) * radius,
              },
            },
          ],
        },
      });
    }

    return {
      backgroundColor: "transparent",
      series: [],
      graphic: {
        elements: [
          // Animated background particles
          ...particles,

          // Inner glow ring
          {
            type: "circle",
            shape: {
              cx: centerX,
              cy: centerY,
              r: Math.min(width, height) * 0.2,
            },
            style: {
              fill: "transparent",
              stroke: "rgba(99, 102, 241, 0.3)",
              lineWidth: 3,
            },
            keyframeAnimation: {
              duration: 1800,
              loop: true,
              keyframes: [
                {
                  percent: 0,
                  shape: { r: Math.min(width, height) * 0.15 },
                  style: { opacity: 0.3 },
                },
                {
                  percent: 0.5,
                  shape: { r: Math.min(width, height) * 0.25 },
                  style: { opacity: 0.6 },
                },
                {
                  percent: 1,
                  shape: { r: Math.min(width, height) * 0.15 },
                  style: { opacity: 0.3 },
                },
              ],
            },
          },

          // Main text - BIZSCOPE
          {
            type: "text",
            left: "center",
            top: "center",
            style: {
              text: "BIZSCOPE",
              fontSize: size,
              fontWeight: 800,
              fontFamily: techeerFont,
              fill: "transparent",
              stroke: "#6366F1",
              lineWidth: 2,
              lineDash: [0, 300],
              lineDashOffset: 0,
            },
            keyframeAnimation: {
              duration: 800,
              delay: 100,
              keyframes: [
                {
                  percent: 0.6,
                  style: {
                    fill: "transparent",
                    lineDashOffset: 300,
                    lineDash: [300, 0],
                  },
                },
                {
                  percent: 0.8,
                  style: {
                    fill: "transparent",
                  },
                },
                {
                  percent: 1,
                  style: {
                    fill: "#F8FAFC",
                    textShadowColor: "rgba(99, 102, 241, 0.8)",
                    textShadowBlur: 20,
                  },
                },
              ],
            },
          },

          // Subtitle
          {
            type: "text",
            left: "center",
            top: centerY + size * 0.7,
            style: {
              text: "Financial Intelligence Platform",
              fontSize: size * 0.25,
              fontWeight: 500,
              fontFamily: techeerFont,
              fill: "#94A3B8",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 400,
              delay: 600,
              keyframes: [
                { percent: 0, style: { opacity: 0 } },
                { percent: 1, style: { opacity: 1 } },
              ],
            },
          },

          // Tech badges
          {
            type: "text",
            left: "center",
            top: centerY + size * 1.1,
            style: {
              text: "Analysis • Insights • Intelligence",
              fontSize: size * 0.18,
              fontWeight: 400,
              fontFamily: techeerFont,
              fill: "#64748B",
              opacity: 0,
            },
            keyframeAnimation: {
              duration: 400,
              delay: 800,
              keyframes: [
                { percent: 0, style: { opacity: 0 } },
                { percent: 1, style: { opacity: 1 } },
              ],
            },
          },
        ],
      },
    };
  },
];

export default new Scene({
  option: endingOptions,
  duration: 999999999, // 엔딩 화면 유지 (사실상 무한)
  file: "techeerEnd",
  title: "",
  dark: true,
  background: techeerGradients.dark,
});
