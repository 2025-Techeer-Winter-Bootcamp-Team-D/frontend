// Techeer Brand Colors - QUASA Style Blue Palette
export const techeerPrimary = "#4264FB"; // Main Blue
export const techeerSecondary = "#2563EB"; // Royal Blue
export const techeerAccent = "#60A5FA"; // Light Blue

// Photo-realistic Blue Palette (from QUASA design)
export const photoColors = [
  "#1E3A8A", // Deep Navy
  "#4264FB", // Main Blue
  "#60A5FA", // Light Blue
  "#93C5FD", // Very Light Blue
  "#3730A3", // Deep Purple/Indigo
  "#2563EB", // Royal Blue
  "#172554", // Very Dark Navy
];

// Frontend Color Palette
export const frontendColorPalette = [
  "#4264FB", // React
  "#2563EB", // TypeScript
  "#60A5FA", // Next.js
  "#93C5FD", // Vue.js
  "#1E3A8A", // Tailwind
  "#3730A3", // Redux
  "#172554", // Webpack
  "#1E40AF", // Vite
];

// Backend Color Palette
export const backendColorPalette = [
  "#1E3A8A", // Spring
  "#2563EB", // Node.js
  "#3730A3", // Python
  "#4264FB", // Go
  "#60A5FA", // Docker
  "#93C5FD", // K8s
  "#172554", // PostgreSQL
  "#1E40AF", // Redis
];

// Combined palette
export const techeerColorPalette = [...photoColors];

// Gradient backgrounds (QUASA style)
export const techeerGradients = {
  dark: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)",
  light: "linear-gradient(135deg, #FAFAFA 0%, #E2E8F0 50%, #FAFAFA 100%)",
  frontend: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
  backend: "linear-gradient(135deg, #0F172A 0%, #172554 100%)",
  accent: "linear-gradient(135deg, #172554 0%, #4264FB 100%)",
  silver:
    "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9) 0%, transparent 60%), linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)",
};

// Typography
export const techeerFont = "'Pretendard', 'Inter', sans-serif";

// Animation easings (QUASA style)
export const techeerEasing = {
  smooth: "cubicInOut" as const,
  bounce: "elasticOut" as const,
  fast: "cubicOut" as const,
  slow: "quinticInOut" as const,
};

// Force graph settings (for bubble clustering effect)
export const forceGraphSettings = {
  repulsion: 200,
  gravity: 0.08,
  edgeLength: 100,
  friction: 0.2,
};

// Bubble style with opacity for overlapping effect
export const bubbleStyle = {
  opacity: 0.75,
  borderColor: "rgba(255,255,255,0.05)",
  borderWidth: 1,
};

// Common text styles
export const techeerTitleStyle = {
  fontFamily: techeerFont,
  fontWeight: 700,
  fontSize: 28,
  color: "#F8FAFC",
};

export const techeerLabelStyle = {
  fontFamily: techeerFont,
  fontSize: 14,
  color: "#E2E8F0",
};

// ========== 통일된 타이틀 시스템 ==========
export const TITLE_LEFT = 80;
export const TITLE_TOP = {
  main: 55,
  desc: 110,
};

export const mainTitleStyle = {
  fontSize: 36,
  fontFamily: techeerFont,
  fontWeight: 800,
  color: "#1e293b",
};

export const descStyle = {
  fontSize: 15,
  fontFamily: techeerFont,
  fontWeight: 500,
  color: "#64748b",
};

// 타이틀을 graphic 요소로 생성
export function createTitleGraphic(main: string, desc: string) {
  return [
    {
      type: "text",
      z: 10000,
      left: TITLE_LEFT,
      top: TITLE_TOP.main,
      style: {
        text: main,
        font: `800 36px ${techeerFont}`,
        fill: "#1e293b",
      },
    },
    {
      type: "text",
      z: 10000,
      left: TITLE_LEFT,
      top: TITLE_TOP.desc,
      style: {
        text: desc,
        font: `500 15px ${techeerFont}`,
        fill: "#64748b",
      },
    },
  ];
}

// ========== 통일된 애니메이션 시스템 ==========
export const FADE_DURATION = 400;

export const sequentialFadeOut = {
  animationDuration: 400,
  animationDurationUpdate: 400,
  animationEasing: "cubicOut" as const,
  animationEasingUpdate: "cubicOut" as const,
  animationDelayUpdate: (idx: number) => idx * 100,
};

export const smoothMorphAnimation = {
  animationDuration: 1200,
  animationDurationUpdate: 1400,
  animationEasing: "cubicInOut" as const,
  animationEasingUpdate: "cubicInOut" as const,
  animationDelay: FADE_DURATION,
  animationDelayUpdate: (idx: number) => FADE_DURATION + idx * 20,
};

export const universalTransitionConfig = {
  enabled: false,
};

// 차트 센터 위치 (전체 화면 활용)
export const CHART_CENTER: [string, string] = ["50%", "50%"];
