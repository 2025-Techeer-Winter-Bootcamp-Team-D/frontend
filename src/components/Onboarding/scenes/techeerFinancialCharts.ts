import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import { techeerFont, smoothMorphAnimation } from "../styles/techeerStyle";

// Sankey 데이터 - 복잡한 손익흐름도
const sankeyLinks = [
  // 지역별 매출 → 사업부
  { source: "아시아태평양", target: "DX 부문", value: 85 },
  { source: "아시아태평양", target: "DS 부문", value: 65 },
  { source: "미주", target: "DX 부문", value: 45 },
  { source: "미주", target: "DS 부문", value: 25 },
  { source: "미주", target: "SDC", value: 12 },
  { source: "유럽", target: "DX 부문", value: 30 },
  { source: "유럽", target: "DS 부문", value: 15 },
  { source: "유럽", target: "Harman", value: 8 },
  { source: "국내", target: "DS 부문", value: 20 },
  { source: "국내", target: "SDC", value: 15 },
  { source: "국내", target: "Harman", value: 5 },
  // 사업부 → 총매출
  { source: "DX 부문", target: "총매출", value: 160 },
  { source: "DS 부문", target: "총매출", value: 125 },
  { source: "SDC", target: "총매출", value: 27 },
  { source: "Harman", target: "총매출", value: 13 },
  // 총매출 → 비용/이익
  { source: "총매출", target: "매출원가", value: 210 },
  { source: "총매출", target: "매출총이익", value: 115 },
  // 매출원가 → 세부비용
  { source: "매출원가", target: "원자재비", value: 95 },
  { source: "매출원가", target: "제조비", value: 115 },
  // 매출총이익 → 영업이익/판관비
  { source: "매출총이익", target: "영업이익", value: 65 },
  { source: "매출총이익", target: "판관비", value: 50 },
  // 영업이익 → 순이익/세금
  { source: "영업이익", target: "순이익", value: 48 },
  { source: "영업이익", target: "법인세", value: 17 },
  // 판관비 → 세부비용
  { source: "판관비", target: "R&D 투자", value: 22 },
  { source: "판관비", target: "마케팅", value: 15 },
  { source: "판관비", target: "관리비", value: 13 },
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
        id: "main",
        top: "12%",
        left: "8%",
        right: "8%",
        bottom: "12%",
        nodeWidth: 14,
        nodeGap: 16,
        layoutIterations: 64,
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
          // 지역
          { name: "아시아태평양", itemStyle: { color: "#818cf8" } },
          { name: "미주", itemStyle: { color: "#a5b4fc" } },
          { name: "유럽", itemStyle: { color: "#c7d2fe" } },
          { name: "국내", itemStyle: { color: "#6366f1" } },
          // 사업부
          { name: "DX 부문", itemStyle: { color: "#3B82F6" } },
          { name: "DS 부문", itemStyle: { color: "#10B981" } },
          { name: "SDC", itemStyle: { color: "#F59E0B" } },
          { name: "Harman", itemStyle: { color: "#8B5CF6" } },
          // 중간
          { name: "총매출", itemStyle: { color: "#4264FB" } },
          { name: "매출원가", itemStyle: { color: "#EF4444" } },
          { name: "매출총이익", itemStyle: { color: "#10B981" } },
          // 세부비용
          { name: "원자재비", itemStyle: { color: "#94a3b8" } },
          { name: "제조비", itemStyle: { color: "#cbd5e1" } },
          // 이익/비용
          { name: "영업이익", itemStyle: { color: "#22c55e" } },
          { name: "판관비", itemStyle: { color: "#f472b6" } },
          // 최종
          { name: "순이익", itemStyle: { color: "#10B981" } },
          { name: "법인세", itemStyle: { color: "#6b7280" } },
          { name: "R&D 투자", itemStyle: { color: "#ef4444" } },
          { name: "마케팅", itemStyle: { color: "#ec4899" } },
          { name: "관리비", itemStyle: { color: "#9ca3af" } },
        ],
        links: sankeyLinks,
        ...smoothMorphAnimation,
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
    legend: { show: false },
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
        id: "main",
        symbol: "circle",
        symbolSize: 10,
        data: [
          {
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
        id: "main",
        lineStyle: {
          width: 2.5,
          opacity: 0.7,
          color: "#4264FB",
        },
        data: parallelData,
        ...smoothMorphAnimation,
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
