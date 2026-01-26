import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import {
  photoColors,
  techeerFont,
  smoothMorphAnimation,
  CHART_CENTER,
} from "../styles/techeerStyle";

// 공통 데이터
const baseData = [
  { id: "ai-chip", n: "AI 반도체", v: 100 },
  { id: "hbm", n: "HBM", v: 95 },
  { id: "npu", n: "NPU", v: 92 },
  { id: "ondevice", n: "온디바이스", v: 90 },
  { id: "autonomous", n: "자율주행", v: 88 },
  { id: "robotics", n: "로보틱스", v: 85 },
  { id: "6g", n: "6G 네트워크", v: 82 },
  { id: "quantum", n: "양자컴퓨터", v: 80 },
];

// 확장 데이터 (버블용)
const expandedData = [
  ...baseData,
  { id: "cloud", n: "클라우드", v: 78 },
  { id: "datacenter", n: "데이터센터", v: 75 },
  { id: "security", n: "사이버보안", v: 72 },
  { id: "factory", n: "스마트팩토리", v: 70 },
  { id: "xr", n: "XR 기기", v: 68 },
  { id: "power", n: "전력설비", v: 65 },
  { id: "space", n: "우주항공", v: 62 },
  { id: "blockchain", n: "블록체인", v: 60 },
  { id: "metaverse", n: "메타버스", v: 58 },
  { id: "twin", n: "디지털트윈", v: 55 },
  { id: "esg", n: "ESG 경영", v: 52 },
  { id: "bio", n: "바이오헬스", v: 50 },
  { id: "fintech", n: "핀테크", v: 48 },
  { id: "mobility", n: "모빌리티", v: 45 },
  { id: "genai", n: "생성형 AI", v: 98 },
  { id: "llm", n: "LLM", v: 96 },
];

// ========== Scene 1: Bubble (Force Graph) ==========
const bubbleOptions: (GetOption | EChartsOption)[] = [
  () => ({
    series: [
      {
        type: "graph",
        layout: "force",
        data: expandedData.map((item, i) => ({
          id: item.id,
          name: item.n,
          value: item.v,
          symbolSize: item.v * 1.4 + 20,
          itemStyle: {
            color: photoColors[i % photoColors.length],
            opacity: 0.85,
            borderColor: "rgba(255,255,255,0.3)",
            borderWidth: 2,
          },
          label: {
            show: true,
            color: "#FFFFFF",
            fontSize: item.v > 80 ? 13 : 10,
            fontWeight: 700,
            fontFamily: techeerFont,
            formatter: "{b}\n{c}",
            lineHeight: 14,
          },
        })),
        force: {
          repulsion: 280,
          gravity: 0.1,
          edgeLength: 100,
          friction: 0.2,
        },
        roam: false,
        ...smoothMorphAnimation,
      },
    ],
  }),
];

export const techeerBubbleChart = new Scene({
  option: bubbleOptions,
  file: "techeerChartPreview",
  title: "Market Energy",
  duration: 2500,
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
        id: "pie-rose",
        radius: ["25%", "68%"],
        center: CHART_CENTER,
        data: baseData.map((d, i) => ({
          name: d.n,
          value: d.v,
          id: d.id,
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
        ...smoothMorphAnimation,
      },
    ],
  }),
  // Step 2: Rose Chart (morphs from Pie)
  () => ({
    series: [
      {
        type: "pie",
        id: "pie-rose",
        radius: ["12%", "72%"],
        center: CHART_CENTER,
        roseType: "area",
        data: baseData.map((d, i) => ({
          name: d.n,
          value: d.v,
          id: d.id,
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
        ...smoothMorphAnimation,
      },
    ],
  }),
];

export const techeerPieToRoseChart = new Scene({
  option: pieToRoseOptions,
  file: "techeerChartPreview",
  title: "Pie to Rose",
  duration: [2000, 2000],
  dark: false,
  background: "#FFFFFF",
});

export default techeerBubbleChart;
