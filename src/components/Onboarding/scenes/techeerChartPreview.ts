import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import { photoColors, techeerFont, CHART_CENTER } from "../styles/techeerStyle";

// 모핑 애니메이션 설정 (divideShape: 'clone'이 핵심)
const morphAnimation = {
  animationDurationUpdate: 1100,
  universalTransition: {
    enabled: true,
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

// 데이터 포인트 ID (버블과 라인 간 모핑 매칭용)
const dataIds = Array.from({ length: 20 }, (_, i) => `node_${i}`);

// ========== Scene 1: Bubble (Graph with Force Layout) ==========
const bubbleOptions: (GetOption | EChartsOption)[] = [
  (chart) => {
    const width = chart.getWidth();
    const height = chart.getHeight();
    const centerX = width / 2;
    const centerY = height / 2;

    // 기준 단위: 화면 비율 보정해서 원형에 가깝게 분포
    const padding = 60;
    // 가로가 더 넓으므로 세로 기준으로 맞추고, 가로는 비율만큼 확장
    const base = height / 2 - padding;
    const aspectRatio = width / height;
    const baseX = base * aspectRatio * 1.05; // 가로 확장
    const baseY = base * 1.1; // 세로 확장

    const mainNames = expandedData.slice(0, 20).map((d) => d.n);

    // === 규칙 기반 버블 배치 ===
    // 1. 크기와 반경은 단조 관계: 클수록 중심에
    // 2. 같은 티어 내 각도 균등 분포
    // 3. 무게중심이 정확히 화면 중앙
    // 4. 반경 = base * ratio (ratio: 0~1)

    // 티어 1: 가장 큰 버블 3개 - 중앙에서 약간 떨어진 위치
    const tier1 = [
      { size: 140, radiusRatio: 0.18, angle: 270 }, // 상단
      { size: 135, radiusRatio: 0.22, angle: 30 }, // 우하단
      { size: 130, radiusRatio: 0.2, angle: 150 }, // 좌하단
    ];

    // 티어 2: 중대형 버블 5개 - 중간 영역
    const tier2 = [
      { size: 110, radiusRatio: 0.42, angle: 0 }, // 우
      { size: 105, radiusRatio: 0.45, angle: 72 }, // 우상
      { size: 100, radiusRatio: 0.48, angle: 144 }, // 좌상
      { size: 95, radiusRatio: 0.45, angle: 216 }, // 좌하
      { size: 90, radiusRatio: 0.42, angle: 288 }, // 우하
    ];

    // 티어 3: 중형 버블 6개 - 중간 영역
    const tier3 = [
      { size: 80, radiusRatio: 0.55, angle: 20 },
      { size: 75, radiusRatio: 0.58, angle: 80 },
      { size: 72, radiusRatio: 0.6, angle: 140 },
      { size: 70, radiusRatio: 0.62, angle: 200 },
      { size: 68, radiusRatio: 0.58, angle: 260 },
      { size: 65, radiusRatio: 0.6, angle: 320 },
    ];

    // 티어 4: 작은 버블 6개 - 외곽
    const tier4 = [
      { size: 58, radiusRatio: 0.78, angle: 45 },
      { size: 55, radiusRatio: 0.82, angle: 105 },
      { size: 52, radiusRatio: 0.8, angle: 165 },
      { size: 50, radiusRatio: 0.84, angle: 225 },
      { size: 48, radiusRatio: 0.8, angle: 285 },
      { size: 45, radiusRatio: 0.85, angle: 345 },
    ];

    const allTiers = [...tier1, ...tier2, ...tier3, ...tier4];

    const mainNodes = dataIds.map((id, i) => {
      const config = allTiers[i];
      const angleRad = (config.angle * Math.PI) / 180;
      // 타원형 분포: x, y 반경 따로 계산
      const radiusX = baseX * config.radiusRatio;
      const radiusY = baseY * config.radiusRatio;

      return {
        id,
        name: mainNames[i],
        symbolSize: config.size,
        x: centerX + Math.cos(angleRad) * radiusX,
        y: centerY + Math.sin(angleRad) * radiusY,
        itemStyle: {
          color: photoColors[i % photoColors.length],
          opacity: 0.92,
        },
        fixed: false,
      };
    });

    // === 외곽 헤일로 링 ===
    // 동일 크기, 낮은 투명도, 타원형 궤도 배치
    const haloRatioX = 0.92;
    const haloRatioY = 0.92;
    const haloCount = 10;
    const haloSize = 20;
    const haloNodes = Array.from({ length: haloCount }, (_, i) => {
      const angle = (((i * 360) / haloCount) * Math.PI) / 180;
      return {
        id: `halo_${i}`,
        name: "",
        symbolSize: haloSize,
        x: centerX + Math.cos(angle) * baseX * haloRatioX,
        y: centerY + Math.sin(angle) * baseY * haloRatioY,
        itemStyle: {
          color: photoColors[(i + 2) % photoColors.length],
          opacity: 0.18,
        },
        fixed: true,
      };
    });

    return {
      series: [
        {
          type: "graph",
          id: "main",
          layout: "none", // Force 끔 - 정적 배치 유지
          roam: false,
          data: [...mainNodes, ...haloNodes],
          label: {
            show: true,
            position: "inside",
            fontSize: 11,
            fontWeight: 800,
            fontFamily: techeerFont,
            color: "#fff",
          },
          // 진입 애니메이션
          animationDuration: 800,
          animationEasing: "cubicOut",
          animationDelay: (idx: number) => idx * 50,
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
  duration: 2000,
  dark: false,
  background: "#FFFFFF",
});

// ========== Scene 2: Line Chart (Growth Path) - Morphs from Bubble ==========
// 굴곡있는 라인 데이터 - 부드러운 파형 (20개)
const waveLineData = [
  { n: "1", v: 75 },
  { n: "2", v: 82 },
  { n: "3", v: 72 },
  { n: "4", v: 88 },
  { n: "5", v: 78 },
  { n: "6", v: 85 },
  { n: "7", v: 70 },
  { n: "8", v: 80 },
  { n: "9", v: 74 },
  { n: "10", v: 90 },
  { n: "11", v: 77 },
  { n: "12", v: 85 },
  { n: "13", v: 68 },
  { n: "14", v: 92 },
  { n: "15", v: 76 },
  { n: "16", v: 83 },
  { n: "17", v: 71 },
  { n: "18", v: 87 },
  { n: "19", v: 79 },
  { n: "20", v: 84 },
];

const lineChartOptions: (GetOption | EChartsOption)[] = [
  () => ({
    xAxis: { type: "category", data: dataIds, show: false },
    yAxis: { type: "value", show: false },
    series: [
      {
        type: "line",
        id: "main",
        smooth: true,
        // 각 데이터 포인트에 id를 부여하여 버블과 1:1 매칭
        data: dataIds.map((id, i) => ({
          id, // 모핑 매칭용 ID
          value: waveLineData[i].v,
        })),
        symbolSize: 14,
        lineStyle: {
          width: 6,
          color: photoColors[0],
        },
        areaStyle: {
          color: {
            type: "linear",
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
        ...morphAnimation,
      },
    ],
  }),
];

export const techeerLineChart = new Scene({
  option: lineChartOptions,
  file: "techeerChartPreview",
  title: "Growth Path",
  duration: 2000,
  dark: false,
  background: "#FFFFFF",
  morphFromPrevious: true, // Bubble에서 모핑 전환 (페이드 없음)
});

// ========== Scene 3: Pie -> Rose Chart (Combined) ==========
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
  duration: [1600, 1600],
  dark: false,
  background: "#FFFFFF",
});

export default techeerBubbleChart;
