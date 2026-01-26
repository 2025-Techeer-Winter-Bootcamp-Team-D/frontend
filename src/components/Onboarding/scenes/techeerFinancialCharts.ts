import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import { techeerFont, smoothMorphAnimation } from "../styles/techeerStyle";

// Sankey 데이터 - 손익흐름도 (이미지 기반)
const sankeyLinks = [
  // 지역별 매출 → 사업부
  { source: "n1", target: "n5", value: 85 }, // Asia Pacific → DX
  { source: "n1", target: "n6", value: 65 }, // Asia Pacific → DS
  { source: "n2", target: "n5", value: 45 }, // Americas → DX
  { source: "n2", target: "n6", value: 25 }, // Americas → DS
  { source: "n2", target: "n7", value: 12 }, // Americas → SDC
  { source: "n3", target: "n5", value: 30 }, // Europe → DX
  { source: "n3", target: "n6", value: 15 }, // Europe → DS
  { source: "n3", target: "n8", value: 8 }, // Europe → Harman
  { source: "n4", target: "n6", value: 20 }, // Domestic → DS
  { source: "n4", target: "n7", value: 15 }, // Domestic → SDC
  { source: "n4", target: "n8", value: 5 }, // Domestic → Harman
  // 사업부 → 총매출
  { source: "n5", target: "n9", value: 160 }, // DX → Global Revenue
  { source: "n6", target: "n9", value: 125 }, // DS → Global Revenue
  { source: "n7", target: "n9", value: 27 }, // SDC → Global Revenue
  { source: "n8", target: "n9", value: 13 }, // Harman → Global Revenue
  // 총매출 → 비용/이익
  { source: "n9", target: "n10", value: 210 }, // Global Revenue → Cost of Revenue
  { source: "n9", target: "n11", value: 115 }, // Global Revenue → Gross Profit
  // 매출원가 → 세부비용
  { source: "n10", target: "n12", value: 95 }, // Cost of Revenue → Raw Materials
  { source: "n10", target: "n13", value: 115 }, // Cost of Revenue → Manufacturing
  // 매출총이익 → 영업이익/판관비
  { source: "n11", target: "n14", value: 65 }, // Gross Profit → Operating Income
  { source: "n11", target: "n15", value: 50 }, // Gross Profit → SG&A Expenses
  // 영업이익 → 순이익/세금
  { source: "n14", target: "n16", value: 48 }, // Operating Income → Net Profit
  { source: "n14", target: "n17", value: 17 }, // Operating Income → Corporate Tax
  // 판관비 → 세부비용
  { source: "n15", target: "n18", value: 22 }, // SG&A → R&D Investment
  { source: "n15", target: "n19", value: 15 }, // SG&A → Marketing
  { source: "n15", target: "n20", value: 13 }, // SG&A → Admin Costs
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
          show: false, // 라벨 숨김
        },
        data: [
          // 지역 (Sales Regions)
          { name: "n1", itemStyle: { color: "#818cf8" } }, // Asia Pacific Sales
          { name: "n2", itemStyle: { color: "#a5b4fc" } }, // Americas Sales
          { name: "n3", itemStyle: { color: "#c7d2fe" } }, // Europe Sales
          { name: "n4", itemStyle: { color: "#6366f1" } }, // Domestic Market
          // 사업부 (Divisions)
          { name: "n5", itemStyle: { color: "#3B82F6" } }, // DX Division
          { name: "n6", itemStyle: { color: "#10B981" } }, // DS Division
          { name: "n7", itemStyle: { color: "#F59E0B" } }, // SDC Display
          { name: "n8", itemStyle: { color: "#8B5CF6" } }, // Harman Audio
          // 중간 (Center)
          { name: "n9", itemStyle: { color: "#4264FB" } }, // Global Revenue
          { name: "n10", itemStyle: { color: "#EF4444" } }, // Cost of Revenue
          { name: "n11", itemStyle: { color: "#10B981" } }, // Gross Profit
          // 세부비용 (Cost Details)
          { name: "n12", itemStyle: { color: "#94a3b8" } }, // Raw Materials
          { name: "n13", itemStyle: { color: "#cbd5e1" } }, // Manufacturing
          // 이익/비용 (Income/Expenses)
          { name: "n14", itemStyle: { color: "#22c55e" } }, // Operating Income
          { name: "n15", itemStyle: { color: "#f472b6" } }, // SG&A Expenses
          // 최종 (Final)
          { name: "n16", itemStyle: { color: "#10B981" } }, // Net Profit
          { name: "n17", itemStyle: { color: "#6b7280" } }, // Corporate Tax
          { name: "n18", itemStyle: { color: "#ef4444" } }, // R&D Investment
          { name: "n19", itemStyle: { color: "#ec4899" } }, // Marketing
          { name: "n20", itemStyle: { color: "#9ca3af" } }, // Admin Costs
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
