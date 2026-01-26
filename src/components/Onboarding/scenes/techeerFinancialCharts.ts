import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import {
  techeerFont,
  smoothMorphAnimation,
  universalTransitionConfig,
} from "../styles/techeerStyle";

// Sankey 데이터
const sankeyLinks = [
  { source: "DX 부문", target: "총매출", value: 159.6 },
  { source: "DS 부문", target: "총매출", value: 101.4 },
  { source: "SDC", target: "총매출", value: 26.7 },
  { source: "Harman", target: "총매출", value: 12.2 },
  { source: "총매출", target: "비용구조", value: 265.5 },
  { source: "총매출", target: "순수익", value: 34.5 },
  { source: "비용구조", target: "원가비용", value: 186.6 },
  { source: "비용구조", target: "판관비", value: 81.6 },
];

// Parallel 데이터
const parallelData = [
  [12.5, 1.2, 15.3, 35, 2.1],
  [8.2, 1.5, 18.7, 45, 1.5],
  [45.3, 4.2, 8.5, 60, 0.5],
  [5.8, 0.6, 12.1, 120, 3.5],
  [4.5, 0.8, 18.2, 95, 4.2],
  [7.2, 0.5, 8.9, 55, 5.1],
  [25.6, 1.8, 7.2, 25, 0.8],
  [35.2, 2.1, 5.8, 40, 0.3],
  [5.2, 0.45, 9.8, 180, 6.2],
  [4.8, 0.42, 10.2, 175, 5.8],
];

// ========== 1. Sankey Chart (손익흐름도) ==========
const sankeyOptions: (GetOption | EChartsOption)[] = [
  () => ({
    series: [
      {
        type: "sankey",
        top: "26%",
        left: "8%",
        right: "8%",
        bottom: "10%",
        nodeWidth: 18,
        nodeGap: 24,
        layoutIterations: 32,
        emphasis: { focus: "adjacency" },
        lineStyle: {
          color: "gradient",
          curveness: 0.5,
          opacity: 0.4,
        },
        label: {
          fontFamily: techeerFont,
          fontSize: 14,
          fontWeight: 600,
          color: "#1e293b",
        },
        data: [
          { name: "DX 부문", itemStyle: { color: "#3B82F6" } },
          { name: "DS 부문", itemStyle: { color: "#10B981" } },
          { name: "SDC", itemStyle: { color: "#F59E0B" } },
          { name: "Harman", itemStyle: { color: "#8B5CF6" } },
          { name: "총매출", itemStyle: { color: "#4264FB" } },
          { name: "비용구조", itemStyle: { color: "#64748b" } },
          { name: "순수익", itemStyle: { color: "#10B981" } },
          { name: "원가비용", itemStyle: { color: "#EF4444" } },
          { name: "판관비", itemStyle: { color: "#F97316" } },
        ],
        links: sankeyLinks,
        ...smoothMorphAnimation,
        universalTransition: universalTransitionConfig,
      },
    ],
  }),
];

export const techeerSankeyChart = new Scene({
  option: sankeyOptions,
  file: "techeerFinancialCharts",
  title: "Sankey",
  duration: 2000,
  dark: false,
  background: "#FFFFFF",
});

// ========== 2. Radar Chart (산업 평균 이탈 탐지) ==========
const industryRadarOptions: (GetOption | EChartsOption)[] = [
  () => ({
    legend: {
      right: 80,
      top: 55,
      data: ["삼성전자(주)", "SK(주)"],
      textStyle: { fontFamily: techeerFont, fontSize: 13, fontWeight: 600 },
      itemWidth: 20,
      itemHeight: 10,
    },
    radar: {
      center: ["50%", "55%"],
      radius: "55%",
      indicator: [
        { name: "ROE", max: 30 },
        { name: "PER", max: 50 },
        { name: "PBR", max: 5 },
        { name: "YoY", max: 30 },
        { name: "영업이익률", max: 30 },
      ],
      axisName: {
        fontFamily: techeerFont,
        fontSize: 14,
        color: "#1e293b",
        fontWeight: 600,
      },
      splitArea: {
        areaStyle: {
          color: ["rgba(255,255,255,0.9)", "rgba(241,245,249,0.5)"],
        },
      },
      axisLine: { lineStyle: { color: "rgba(100,116,139,0.3)" } },
      splitLine: { lineStyle: { color: "rgba(100,116,139,0.2)" } },
    },
    series: [
      {
        type: "radar",
        symbol: "circle",
        symbolSize: 10,
        data: [
          {
            id: "samsung",
            name: "삼성전자(주)",
            value: [15, 27, 1.8, 5, 12],
            areaStyle: { color: "rgba(66,100,251,0.35)" },
            lineStyle: { color: "#4264FB", width: 3 },
            itemStyle: {
              color: "#4264FB",
              borderWidth: 2,
              borderColor: "#fff",
            },
          },
          {
            id: "sk",
            name: "SK(주)",
            value: [8, 12, 0.9, -2, 6],
            areaStyle: { color: "rgba(148,163,184,0.25)" },
            lineStyle: { color: "#94a3b8", width: 2 },
            itemStyle: {
              color: "#94a3b8",
              borderWidth: 2,
              borderColor: "#fff",
            },
          },
        ],
        ...smoothMorphAnimation,
        universalTransition: universalTransitionConfig,
      },
    ],
  }),
];

export const techeerIndustryRadar = new Scene({
  option: industryRadarOptions,
  file: "techeerFinancialCharts",
  title: "Industry Radar",
  duration: 2000,
  dark: false,
  background: "#FFFFFF",
});

// ========== 3. Parallel Coordinates (평행좌표 차트) ==========
const parallelOptions: (GetOption | EChartsOption)[] = [
  () => ({
    parallelAxis: [
      {
        dim: 0,
        name: "PER",
        nameLocation: "start",
        nameGap: 20,
        nameTextStyle: {
          fontFamily: techeerFont,
          fontSize: 13,
          color: "#1e293b",
          fontWeight: 700,
        },
        max: 50,
        axisLabel: { show: false },
      },
      {
        dim: 1,
        name: "PBR",
        nameLocation: "start",
        nameGap: 20,
        nameTextStyle: {
          fontFamily: techeerFont,
          fontSize: 13,
          color: "#1e293b",
          fontWeight: 700,
        },
        max: 10,
        axisLabel: { show: false },
      },
      {
        dim: 2,
        name: "ROE",
        nameLocation: "start",
        nameGap: 20,
        nameTextStyle: {
          fontFamily: techeerFont,
          fontSize: 13,
          color: "#1e293b",
          fontWeight: 700,
        },
        max: 30,
        axisLabel: { show: false },
      },
      {
        dim: 3,
        name: "부채비율",
        nameLocation: "start",
        nameGap: 20,
        nameTextStyle: {
          fontFamily: techeerFont,
          fontSize: 13,
          color: "#EF4444",
          fontWeight: 700,
        },
        max: 200,
        axisLabel: { show: false },
      },
      {
        dim: 4,
        name: "배당수익률",
        nameLocation: "start",
        nameGap: 20,
        nameTextStyle: {
          fontFamily: techeerFont,
          fontSize: 13,
          color: "#1e293b",
          fontWeight: 700,
        },
        max: 10,
        axisLabel: { show: false },
      },
    ],
    parallel: {
      top: 180,
      left: 100,
      right: 100,
      bottom: 80,
      parallelAxisDefault: {
        type: "value",
        nameGap: 20,
        axisLine: { lineStyle: { color: "#cbd5e1", width: 2 } },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    },
    series: [
      {
        type: "parallel",
        lineStyle: {
          width: 2.5,
          opacity: 0.7,
          color: "#4264FB",
        },
        data: parallelData,
        ...smoothMorphAnimation,
        universalTransition: universalTransitionConfig,
      },
    ],
  }),
];

export const techeerParallelChart = new Scene({
  option: parallelOptions,
  file: "techeerFinancialCharts",
  title: "Parallel Coordinates",
  duration: 2000,
  dark: false,
  background: "#FFFFFF",
});

export default techeerSankeyChart;
