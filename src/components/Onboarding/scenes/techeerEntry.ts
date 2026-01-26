import type { EChartsOption } from "echarts";
import Scene, { type GetOption } from "./Scene";
import {
  photoColors,
  universalTransitionConfig,
  FADE_DURATION,
} from "../styles/techeerStyle";

// 로즈 차트 데이터 생성 - id 포함
const generateRoseData = () =>
  Array.from({ length: 40 }, (_, i) => ({
    id: `rose-${i}`,
    groupId: `rose-${i}`,
    value: 40 + Math.random() * 60,
    itemStyle: {
      color: photoColors[i % photoColors.length],
      borderColor: "rgba(255, 255, 255, 0.3)",
      borderWidth: 1,
    },
  }));

const entryOptions: (GetOption | EChartsOption)[] = [
  // Step 1: 로즈 차트 천천히 등장
  () => ({
    backgroundColor: "transparent",
    series: [
      {
        type: "pie",
        radius: ["0%", "0%"],
        roseType: "area",
        emphasis: { disabled: true },
        label: { show: false },
        itemStyle: { borderRadius: 5 },
        data: generateRoseData(),
        animationDuration: 600,
        animationDelay: FADE_DURATION,
        animationEasing: "cubicOut",
        universalTransition: universalTransitionConfig,
      },
    ],
  }),

  // Step 2: 로즈 차트 확장
  () => ({
    series: [
      {
        type: "pie",
        radius: ["20%", "85%"],
        roseType: "area",
        emphasis: { disabled: true },
        label: { show: false },
        itemStyle: { borderRadius: 5 },
        data: generateRoseData(),
        animationDuration: 1400,
        animationDurationUpdate: 1400,
        animationEasing: "cubicInOut",
        animationEasingUpdate: "cubicInOut",
        universalTransition: universalTransitionConfig,
      },
    ],
  }),

  // Step 3: 로즈 차트가 중앙으로 수축
  () => ({
    series: [
      {
        type: "pie",
        radius: ["0%", "5%"],
        roseType: "area",
        emphasis: { disabled: true },
        label: { show: false },
        data: generateRoseData().map((d) => ({ ...d, value: 0.1 })),
        animationDuration: 1000,
        animationDurationUpdate: 1200,
        animationEasing: "cubicIn",
        animationEasingUpdate: "cubicIn",
        animationDelayUpdate: (idx: number) => idx * 10,
        universalTransition: universalTransitionConfig,
      },
    ],
  }),
];

export default new Scene({
  option: entryOptions,
  file: "techeerEntry",
  duration: [500, 1800, 1000],
  dark: false,
  background: "rgba(255, 255, 255, 0.95)",
});
