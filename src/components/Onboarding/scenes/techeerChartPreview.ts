import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import { photoColors, techeerFont, CHART_CENTER } from "../styles/techeerStyle";

// 모핑 애니메이션 설정 (빠른 전환)
const morphAnimation = {
  animationDuration: 500,
  animationDurationUpdate: 500,
  animationEasing: "cubicOut" as const,
  animationEasingUpdate: "cubicOut" as const,
  universalTransition: {
    enabled: true,
    seriesKey: "main",
    divideShape: "clone" as const,
  },
};

// 공통 데이터
const baseData = [
  { n: "AI 반도체", v: 100 },
  { n: "HBM", v: 95 },
  { n: "NPU", v: 92 },
  { n: "온디바이스", v: 90 },
  { n: "자율주행", v: 88 },
  { n: "로보틱스", v: 85 },
  { n: "6G 네트워크", v: 82 },
  { n: "양자컴퓨터", v: 80 },
];

// 확장 데이터 (버블용)
const expandedData = [
  ...baseData,
  { n: "클라우드", v: 78 },
  { n: "데이터센터", v: 75 },
  { n: "사이버보안", v: 72 },
  { n: "스마트팩토리", v: 70 },
  { n: "XR 기기", v: 68 },
  { n: "전력설비", v: 65 },
  { n: "우주항공", v: 62 },
  { n: "블록체인", v: 60 },
  { n: "메타버스", v: 58 },
  { n: "디지털트윈", v: 55 },
  { n: "ESG 경영", v: 52 },
  { n: "바이오헬스", v: 50 },
  { n: "핀테크", v: 48 },
  { n: "모빌리티", v: 45 },
  { n: "생성형 AI", v: 98 },
  { n: "LLM", v: 96 },
];

// 버블 위치 - 화면 전체에 분산
const bubblePositions = [
  { x: "15%", y: "20%" },
  { x: "85%", y: "25%" },
  { x: "25%", y: "75%" },
  { x: "75%", y: "80%" },
  { x: "50%", y: "50%" }, // 중앙 버블 (확대될 버블)
  { x: "10%", y: "50%" },
  { x: "90%", y: "55%" },
  { x: "35%", y: "15%" },
  { x: "65%", y: "12%" },
  { x: "20%", y: "40%" },
  { x: "80%", y: "42%" },
  { x: "40%", y: "85%" },
  { x: "60%", y: "88%" },
  { x: "8%", y: "75%" },
  { x: "92%", y: "72%" },
  { x: "30%", y: "55%" },
  { x: "70%", y: "58%" },
  { x: "45%", y: "30%" },
  { x: "55%", y: "70%" },
  { x: "12%", y: "88%" },
  { x: "88%", y: "15%" },
  { x: "50%", y: "8%" },
  { x: "50%", y: "92%" },
  { x: "5%", y: "30%" },
];

// ========== Scene 1: Bubble (Force Graph) ==========
const bubbleOptions: (GetOption | EChartsOption)[] = [
  // Step 1: 버블들이 화면 전체에 퍼져있는 상태
  (chart) => {
    const width = chart.getWidth();
    const height = chart.getHeight();

    return {
      series: [
        {
          type: "graph",
          id: "main",
          layout: "none", // 고정 위치 사용
          data: expandedData.map((item, i) => {
            const pos = bubblePositions[i % bubblePositions.length];
            const xPercent = parseFloat(pos.x) / 100;
            const yPercent = parseFloat(pos.y) / 100;

            return {
              id: `bubble-${i}`,
              name: item.n,
              value: item.v,
              x: width * xPercent,
              y: height * yPercent,
              symbolSize: item.v * 1.2 + 15,
              itemStyle: {
                color: photoColors[i % photoColors.length],
                opacity: 0.9,
                borderColor: "rgba(255,255,255,0.4)",
                borderWidth: 2,
                shadowBlur: 15,
                shadowColor: "rgba(0,0,0,0.15)",
              },
              label: {
                show: item.v > 60,
                color: "#FFFFFF",
                fontSize: item.v > 85 ? 12 : 10,
                fontWeight: 700,
                fontFamily: techeerFont,
                formatter: "{b}",
              },
            };
          }),
          roam: false,
          ...morphAnimation,
        },
      ],
    };
  },
];

// ========== Scene 2: Bubble -> Line Chart ==========
// 역동적인 주식 차트 스타일 데이터
const volatileValues = [35, 52, 78, 45, 95, 38, 72, 88];
const lineChartData = baseData.map((item, i) => ({
  id: `bubble-${i}`,
  name: item.n,
  value: volatileValues[i],
}));

const bubbleToLineOptions: (GetOption | EChartsOption)[] = [
  () => ({
    xAxis: {
      type: "category",
      data: lineChartData.map((d) => d.name),
      axisLabel: {
        fontFamily: techeerFont,
        fontSize: 11,
        color: "#64748b",
        rotate: 30,
      },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 20,
      max: 110,
      axisLabel: {
        fontFamily: techeerFont,
        fontSize: 11,
        color: "#64748b",
      },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
    grid: {
      top: 50,
      left: 60,
      right: 60,
      bottom: 60,
    },
    series: [
      {
        type: "line",
        id: "main",
        smooth: true,
        data: lineChartData.map((d) => ({
          id: d.id,
          name: d.name,
          value: d.value,
        })),
        symbolSize: 16,
        symbol: "circle",
        itemStyle: {
          color: "#4264FB",
          borderColor: "#fff",
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: "rgba(66, 100, 251, 0.4)",
        },
        lineStyle: {
          width: 4,
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#4264FB" },
              { offset: 1, color: "#10B981" },
            ],
          },
          shadowBlur: 8,
          shadowColor: "rgba(66, 100, 251, 0.3)",
        },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(66, 100, 251, 0.25)" },
              { offset: 1, color: "rgba(66, 100, 251, 0.02)" },
            ],
          },
        },
        label: {
          show: false,
        },
        ...morphAnimation,
      },
    ],
  }),
];

export const techeerBubbleChart = new Scene({
  option: bubbleOptions,
  file: "techeerChartPreview",
  title: "Market Energy",
  duration: 1800,
  dark: false,
  background: "#FFFFFF",
  morphFromPrevious: true, // 로즈에서 버블로 모핑
});

export const techeerBubbleToLineChart = new Scene({
  option: bubbleToLineOptions,
  file: "techeerChartPreview",
  title: "Bubble to Line",
  duration: 1800,
  dark: false,
  background: "#FFFFFF",
  morphFromPrevious: true, // 버블에서 라인으로 모핑
});

// ========== Scene 2: Pie -> Rose Chart (Combined) ==========
// 버블과 모핑을 위해 ID 추가
const pieToRoseOptions: (GetOption | EChartsOption)[] = [
  // Step 1: Pie Chart
  () => ({
    series: [
      {
        type: "pie",
        id: "main",
        radius: ["20%", "75%"],
        center: CHART_CENTER,
        data: baseData.map((d, i) => ({
          id: `bubble-${i}`, // 버블과 동일한 ID
          name: d.n,
          value: d.v,
          itemStyle: { color: photoColors[i % photoColors.length] },
        })),
        itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 4 },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          fontFamily: techeerFont,
          fontSize: 13,
          fontWeight: 600,
          color: "#1e293b",
        },
        labelLine: {
          lineStyle: { color: "#94a3b8", width: 2 },
          length: 12,
          length2: 15,
        },
        ...morphAnimation,
      },
    ],
  }),
  // Step 2: Rose Chart (morphs from Pie)
  () => ({
    series: [
      {
        type: "pie",
        id: "main",
        radius: ["10%", "80%"],
        center: CHART_CENTER,
        roseType: "area",
        data: baseData.map((d, i) => ({
          id: `bubble-${i}`, // 버블과 동일한 ID
          name: d.n,
          value: d.v,
          itemStyle: { color: photoColors[i % photoColors.length] },
        })),
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 3 },
        label: {
          show: true,
          formatter: "{b}",
          fontFamily: techeerFont,
          fontSize: 13,
          fontWeight: 600,
          color: "#1e293b",
        },
        labelLine: { lineStyle: { color: "#94a3b8" } },
        ...morphAnimation,
      },
    ],
  }),
];

export const techeerPieToRoseChart = new Scene({
  option: pieToRoseOptions,
  file: "techeerChartPreview",
  title: "Pie to Rose",
  duration: [1500, 1500],
  dark: false,
  background: "#FFFFFF",
});

export default techeerBubbleChart;
