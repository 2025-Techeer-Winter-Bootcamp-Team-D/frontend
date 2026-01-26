import { photoColors } from "../styles/techeerStyle";

// 공통 8개 아이템 데이터 - 모든 씬에서 동일한 ID 사용
export const ITEM_COUNT = 8;

// 기본 데이터 (Pie, Rose 등)
export const baseData = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: String(i),
  value: 60 + ((i * 13 + 5) % 40),
  itemStyle: {
    color: photoColors[i % photoColors.length],
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 2,
  },
}));

// Sunburst/Treemap용 계층 데이터 (동일한 ID 유지)
export const hierarchyData = [
  {
    id: "0",
    itemStyle: { color: photoColors[0] },
    children: [
      { id: "1", value: 100, itemStyle: { color: photoColors[0] } },
      { id: "2", value: 85, itemStyle: { color: photoColors[1] } },
    ],
  },
  {
    id: "3",
    itemStyle: { color: photoColors[2] },
    children: [
      { id: "4", value: 90, itemStyle: { color: photoColors[2] } },
      { id: "5", value: 75, itemStyle: { color: photoColors[3] } },
    ],
  },
  {
    id: "6",
    itemStyle: { color: photoColors[4] },
    children: [{ id: "7", value: 80, itemStyle: { color: photoColors[4] } }],
  },
];

// 공통 universalTransition 설정
export const morphConfig = {
  universalTransition: {
    enabled: true,
    seriesKey: "main",
    divideShape: "clone" as const,
  },
  animationDuration: 1500,
  animationDurationUpdate: 1500,
  animationEasing: "cubicInOut" as const,
  animationEasingUpdate: "cubicInOut" as const,
};

// 모든 특수 컴포넌트 초기화 (이전 씬의 컴포넌트 제거용)
export const clearComponents = {
  radar: undefined,
  parallel: undefined,
  parallelAxis: [],
};
