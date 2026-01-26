import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import {
  photoColors,
  techeerFont,
  createTitleGraphic,
  smoothMorphAnimation,
  techeerEasing,
} from "../styles/techeerStyle";

// 공통 계층 데이터
const hierarchyData = [
  {
    name: "반도체",
    id: "semiconductor",
    itemStyle: { color: photoColors[0] },
    children: [
      { name: "AI 반도체", value: 100, id: "ai-chip" },
      { name: "HBM", value: 95, id: "hbm" },
      { name: "NPU", value: 92, id: "npu" },
      { name: "파운드리", value: 88, id: "foundry" },
    ],
  },
  {
    name: "AI/SW",
    id: "ai-sw",
    itemStyle: { color: photoColors[1] },
    children: [
      { name: "생성형 AI", value: 98, id: "genai" },
      { name: "LLM", value: 96, id: "llm" },
      { name: "온디바이스", value: 90, id: "ondevice" },
      { name: "엣지컴퓨팅", value: 85, id: "edge" },
    ],
  },
  {
    name: "모빌리티",
    id: "mobility",
    itemStyle: { color: photoColors[2] },
    children: [
      { name: "자율주행", value: 88, id: "autonomous" },
      { name: "로보틱스", value: 85, id: "robotics" },
      { name: "UAM", value: 75, id: "uam" },
    ],
  },
  {
    name: "인프라",
    id: "infra",
    itemStyle: { color: photoColors[4] },
    children: [
      { name: "6G", value: 82, id: "6g" },
      { name: "클라우드", value: 78, id: "cloud" },
      { name: "데이터센터", value: 75, id: "datacenter" },
    ],
  },
];

// 모핑 애니메이션 설정
const morphTransition = {
  animationDuration: 1500,
  animationDurationUpdate: 1500,
  animationEasing: techeerEasing.smooth,
  animationEasingUpdate: techeerEasing.smooth,
};

// ========== Sunburst -> Treemap (Combined) ==========
const sunburstToTreemapOptions: (GetOption | EChartsOption)[] = [
  // Step 1: Sunburst
  () => ({
    graphic: createTitleGraphic(
      "섹터별 계층 구조",
      "주요 산업 섹터와 하위 분야의 관계를 시각화합니다.",
    ),
    series: [
      {
        type: "sunburst",
        id: "hierarchy-morph",
        radius: ["18%", "78%"],
        center: ["52%", "55%"],
        nodeClick: false,
        emphasis: { disabled: true },
        label: {
          show: true,
          rotate: "radial",
          fontFamily: techeerFont,
          fontSize: 12,
          color: "#fff",
          minAngle: 15,
        },
        itemStyle: {
          borderWidth: 3,
          borderColor: "rgba(255, 255, 255, 0.9)",
        },
        levels: [
          {},
          {
            r0: "18%",
            r: "48%",
            label: { fontSize: 14, fontWeight: 700 },
            itemStyle: { borderRadius: 6 },
          },
          {
            r0: "48%",
            r: "78%",
            label: { fontSize: 11, fontWeight: 600 },
            itemStyle: { borderRadius: 8 },
          },
        ],
        ...morphTransition,
        universalTransition: {
          enabled: true,
          seriesKey: "hierarchy",
        },
        data: hierarchyData,
      },
    ],
  }),
  // Step 2: Treemap (morphs from Sunburst)
  () => ({
    graphic: createTitleGraphic(
      "섹터별 계층 구조",
      "주요 산업 섹터와 하위 분야의 관계를 시각화합니다.",
    ),
    series: [
      {
        type: "treemap",
        id: "hierarchy-morph",
        top: 180,
        left: 80,
        right: 80,
        bottom: 60,
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          fontFamily: techeerFont,
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          formatter: "{b}",
        },
        upperLabel: {
          show: true,
          height: 35,
          fontFamily: techeerFont,
          fontSize: 16,
          fontWeight: 700,
          color: "#fff",
        },
        itemStyle: {
          borderColor: "rgba(255, 255, 255, 0.8)",
          borderWidth: 3,
          gapWidth: 4,
        },
        levels: [
          {
            itemStyle: { borderWidth: 5, gapWidth: 8 },
          },
          {
            itemStyle: { borderWidth: 3, gapWidth: 4, borderRadius: 6 },
          },
        ],
        ...morphTransition,
        universalTransition: {
          enabled: true,
          seriesKey: "hierarchy",
        },
        data: hierarchyData,
      },
    ],
  }),
];

export const techeerSunburstToTreemap = new Scene({
  option: sunburstToTreemapOptions,
  file: "techeerFullStack",
  title: "Sunburst to Treemap",
  duration: [2000, 2000],
  dark: false,
  background: "#FFFFFF",
});

export default techeerSunburstToTreemap;
