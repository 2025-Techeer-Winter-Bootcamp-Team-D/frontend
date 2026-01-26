import techeerEntry from "./techeerEntry";
import {
  techeerBubbleChart,
  techeerLineChart,
  techeerPieToRoseChart,
} from "./techeerChartPreview";
import {
  techeerSankeyChart,
  techeerIndustryRadar,
  techeerParallelChart,
} from "./techeerFinancialCharts";
import { techeerSunburstToTreemap } from "./techeerFullStack";
import techeerEnd from "./techeerEnd";

export const scenes = [
  techeerEntry,
  techeerPieToRoseChart, // Entry의 Pie와 모핑 연결
  techeerBubbleChart,
  techeerLineChart, // Bubble에서 모핑 → Line, 그 후 Sankey로 페이드
  techeerSankeyChart,
  techeerIndustryRadar,
  techeerParallelChart,
  techeerSunburstToTreemap,
  techeerEnd,
];

export default scenes;
