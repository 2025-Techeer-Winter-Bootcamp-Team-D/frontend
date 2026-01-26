import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import { photoColors, techeerFont, CHART_CENTER } from "../styles/techeerStyle";

// 모핑 애니메이션 설정
const morphAnimation = {
  animationDuration: 800,
  animationDurationUpdate: 800,
  animationEasing: "cubicInOut" as const,
  animationEasingUpdate: "cubicInOut" as const,
  universalTransition: {
    enabled: true,
    seriesKey: "main",
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

export const techeerBubbleChart = new Scene({
  option: bubbleOptions,
  file: "techeerChartPreview",
  title: "Market Energy",
  duration: 1800,
  dark: false,
  background: "#FFFFFF",
});

// ========== Scene 2: Pie -> Rose Chart (Combined) ==========
const pieToRoseOptions: (GetOption | EChartsOption)[] = [
  // Step 1: Pie Chart
  () => ({
    series: [
      {
        type: "pie",
        id: "main",
        radius: ["25%", "68%"],
        center: CHART_CENTER,
        data: baseData.map((d, i) => ({
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
          length: 15,
          length2: 20,
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
        radius: ["12%", "72%"],
        center: CHART_CENTER,
        roseType: "area",
        data: baseData.map((d, i) => ({
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
