import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { AITrend } from "../../types";

// 기본 샘플 데이터 (API 데이터가 없을 때 사용)
const SAMPLE_DATA: AITrend[] = [
  {
    keyword: "AI 반도체",
    score: 98,
    category: "Core",
    x: 50,
    y: 50,
    size: 1400,
  },
  { keyword: "HBM", score: 94, category: "Memory", x: 32, y: 40, size: 900 },
  {
    keyword: "온디바이스AI",
    score: 91,
    category: "Tech",
    x: 68,
    y: 42,
    size: 850,
  },
  { keyword: "NPU", score: 89, category: "Processor", x: 45, y: 68, size: 800 },
  {
    keyword: "로보틱스",
    score: 87,
    category: "Future",
    x: 58,
    y: 28,
    size: 750,
  },
  {
    keyword: "자율주행",
    score: 82,
    category: "Mobility",
    x: 25,
    y: 60,
    size: 600,
  },
  {
    keyword: "6G 네트워크",
    score: 78,
    category: "Infra",
    x: 75,
    y: 65,
    size: 550,
  },
  {
    keyword: "양자컴퓨터",
    score: 76,
    category: "Future",
    x: 80,
    y: 30,
    size: 500,
  },
  {
    keyword: "스마트팩토리",
    score: 74,
    category: "Industry",
    x: 20,
    y: 30,
    size: 480,
  },
  {
    keyword: "데이터센터",
    score: 70,
    category: "Infra",
    x: 40,
    y: 15,
    size: 400,
  },
  {
    keyword: "사이버보안",
    score: 68,
    category: "Security",
    x: 60,
    y: 85,
    size: 380,
  },
  {
    keyword: "XR 기기",
    score: 65,
    category: "Device",
    x: 15,
    y: 48,
    size: 350,
  },
  {
    keyword: "클라우드",
    score: 62,
    category: "Infra",
    x: 85,
    y: 50,
    size: 320,
  },
  {
    keyword: "전력설비",
    score: 58,
    category: "Infra",
    x: 35,
    y: 82,
    size: 300,
  },
];

export interface KeywordData {
  keyword: string;
  count: number;
  doc_count: number;
}

const COLORS = [
  "#0046FF", // Shinhan Blue
  "#0055FF",
  "#0064FF",
  "#1A75FF",
  "#3385FF",
  "#4D94FF",
  "#66A3FF",
  "#80B3FF",
  "#99C2FF",
  "#2563EB",
  "#1D4ED8",
  "#1E40AF",
  "#1E3A8A",
];

const CustomBubble = (props: any) => {
  const { cx, cy, fill, payload } = props;
  const [isHovered, setIsHovered] = React.useState(false);

  // Calculate radius based on size. Adjust divider to fit container.
  const baseRadius = Math.sqrt(payload.size) * 1.5;
  const radius = isHovered ? baseRadius * 1.1 : baseRadius;

  // Determine if bubble is small to adjust text size or hide score
  const isSmall = baseRadius < 30;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <defs>
        <filter
          id={`shadow-${payload.keyword.replace(/\s+/g, "-")}`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation={isHovered ? "10" : "6"}
            floodColor={fill}
            floodOpacity={isHovered ? "0.5" : "0.3"}
          />
        </filter>
        <linearGradient
          id={`grad-${payload.keyword.replace(/\s+/g, "-")}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor={fill} stopOpacity={0.9} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.7} />
        </linearGradient>
      </defs>

      {/* Pulse effect for top ranked items */}
      {payload.score > 90 && (
        <circle cx={cx} cy={cy} r={baseRadius + 5} fill={fill} opacity="0.2">
          <animate
            attributeName="r"
            values={`${baseRadius};${baseRadius + 10};${baseRadius}`}
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0;0.2"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={`url(#grad-${payload.keyword.replace(/\s+/g, "-")})`}
        filter={`url(#shadow-${payload.keyword.replace(/\s+/g, "-")})`}
        stroke="white"
        strokeWidth={isHovered ? 2 : 1}
        strokeOpacity={isHovered ? 0.5 : 0.2}
        style={{ transition: "all 0.3s ease" }}
      />

      <text
        x={cx}
        y={cy}
        dy={isSmall ? 4 : -4}
        textAnchor="middle"
        fill="white"
        fontSize={isSmall ? 10 : 14}
        fontWeight="bold"
        style={{
          pointerEvents: "none",
          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        {payload.keyword}
      </text>

      {!isSmall && (
        <text
          x={cx}
          y={cy}
          dy={14}
          textAnchor="middle"
          fill="white"
          fontSize={11}
          fillOpacity={0.9}
          style={{ pointerEvents: "none" }}
        >
          {payload.score}
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur border border-blue-100 p-4 rounded-2xl shadow-xl">
        <p className="font-bold text-slate-800 text-lg mb-1">{data.keyword}</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-shinhan-blue text-xs font-bold">
            {data.category}
          </span>
          <span className="text-sm text-gray-500">관심도 Score</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold text-shinhan-blue">
            {data.score}
          </span>
          <span className="text-xs text-gray-400 mb-1">/ 100</span>
        </div>
      </div>
    );
  }
  return null;
};

interface AIBubbleChartProps {
  keywords?: KeywordData[];
}

// API 키워드 데이터를 버블 차트 데이터로 변환
const convertKeywordsToChartData = (keywords: KeywordData[]): AITrend[] => {
  if (!keywords || keywords.length === 0) return SAMPLE_DATA;

  const maxCount = Math.max(...keywords.map((k) => k.count));

  // 버블 위치를 골든 앵글 패턴으로 배치 (더 균일한 분포)
  return keywords.map((item, index) => {
    // 스코어: count 기반으로 100점 만점 환산
    const score = Math.round((item.count / maxCount) * 100);

    // 버블 크기: count에 비례
    const size = 300 + (item.count / maxCount) * 1100;

    // 골든 앵글 기반 위치 계산 (중앙 집중형)
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const angle = index * goldenAngle;
    const radius = 15 + (index / keywords.length) * 30;

    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);

    return {
      keyword: item.keyword,
      score,
      category: "Trend",
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
      size,
    };
  });
};

const AIBubbleChart: React.FC<AIBubbleChartProps> = ({ keywords }) => {
  const chartData = useMemo(() => {
    return convertKeywordsToChartData(keywords ?? []);
  }, [keywords]);

  return (
    <div className="w-full h-[400px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
          <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
          <ZAxis type="number" dataKey="size" range={[0, 1200]} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: "3 3" }}
            isAnimationActive={false}
          />
          <Scatter name="AI Trends" data={chartData} shape={<CustomBubble />}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AIBubbleChart;
