import techeerEntry from "./techeerEntry";
import {
  techeerBubbleChart,
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
  techeerBubbleChart,
  techeerPieToRoseChart,
  techeerSankeyChart,
  techeerIndustryRadar,
  techeerParallelChart,
  techeerSunburstToTreemap,
  techeerEnd,
];

export default scenes;
