import techeerEntry from "./techeerEntry";
import {
  techeerBubbleChart,
  techeerBubbleToLineChart,
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
  techeerBubbleToLineChart, // 버블 → 라인 모핑
  techeerSankeyChart,
  techeerIndustryRadar,
  techeerParallelChart,
  techeerSunburstToTreemap,
  techeerEnd,
];

export default scenes;
