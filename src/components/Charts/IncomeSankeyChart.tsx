import React, { useMemo, useState, useRef, useEffect } from "react";
import { sankey as d3Sankey, sankeyLinkHorizontal } from "d3-sankey";
import type { SankeyGraph, SankeyNode as D3SankeyNode } from "d3-sankey";
import type { SankeyData, SankeyNode, SankeyLink } from "../../types";

interface IncomeSankeyChartProps {
  data: SankeyData;
  totalRevenue: number;
}

interface ExtendedNode extends D3SankeyNode<SankeyNode, SankeyLink> {
  id: string;
  name: string;
  color: string;
  category: "Revenue" | "Profit" | "Expense" | "Hub";
}

export const IncomeSankeyChart: React.FC<IncomeSankeyChartProps> = ({
  data,
  totalRevenue,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(width, 600),
        height: Math.max(height, 480),
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { nodes, links } = useMemo(() => {
    const { width, height } = dimensions;
    const paddingX = 80;
    const paddingY = 30;

    const sankeyGenerator = d3Sankey<SankeyNode, SankeyLink>()
      .nodeId((d) => d.id)
      .nodeWidth(14)
      .nodePadding(24)
      .extent([
        [paddingX, paddingY],
        [width - paddingX, height - paddingY],
      ])
      // 노드 정렬: Revenue(왼쪽) → Hub(중앙) → Expense/Profit(오른쪽)
      .nodeSort((a, b) => {
        // 같은 레이어에서 Profit이 위로, Expense가 아래로
        if (a.category === "Profit" && b.category === "Expense") return -1;
        if (a.category === "Expense" && b.category === "Profit") return 1;
        return 0;
      });

    // Deep copy data to avoid mutation issues with D3
    const graphData = {
      nodes: data.nodes.map((d) => ({ ...d })),
      links: data.links.map((d) => ({ ...d })),
    };

    return sankeyGenerator(graphData as any) as unknown as SankeyGraph<
      ExtendedNode,
      any
    >;
  }, [data, dimensions]);

  const pathGenerator = sankeyLinkHorizontal();

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] relative font-sans"
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
      >
        <defs>
          {links.map((link: any, i) => (
            <linearGradient
              key={`grad-${i}`}
              id={`link-grad-${i}`}
              gradientUnits="userSpaceOnUse"
              x1={link.source.x1}
              x2={link.target.x0}
            >
              <stop
                offset="0%"
                stopColor={link.source.color}
                stopOpacity="0.1"
              />
              <stop
                offset="100%"
                stopColor={link.target.color}
                stopOpacity="0.1"
              />
            </linearGradient>
          ))}
        </defs>

        {/* Links */}
        <g>
          {links.map((link: any, i) => (
            <path
              key={i}
              d={pathGenerator(link) || ""}
              fill="none"
              stroke={
                hoveredLink === i ? link.source.color : `url(#link-grad-${i})`
              }
              strokeWidth={Math.max(1, link.width)}
              strokeOpacity={hoveredLink === i ? 0.4 : 1}
              onMouseEnter={() => setHoveredLink(i)}
              onMouseLeave={() => setHoveredLink(null)}
              className="transition-all duration-300 cursor-help"
            />
          ))}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((node: any) => {
            const isLeftSide = node.x0 < dimensions.width / 3;
            const isRightSide = node.x0 > (dimensions.width * 2) / 3;
            const textAnchor = isLeftSide
              ? "end"
              : isRightSide
                ? "start"
                : "middle";
            const textX = isLeftSide
              ? node.x0 - 10
              : isRightSide
                ? node.x1 + 10
                : (node.x0 + node.x1) / 2;
            const nodeHeight = node.y1 - node.y0;

            return (
              <g key={node.id}>
                {/* Node bar with gradient effect */}
                <defs>
                  <linearGradient
                    id={`node-grad-${node.id}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={node.color} stopOpacity="1" />
                    <stop
                      offset="100%"
                      stopColor={node.color}
                      stopOpacity="0.7"
                    />
                  </linearGradient>
                </defs>
                <rect
                  x={node.x0}
                  y={node.y0}
                  width={node.x1 - node.x0}
                  height={nodeHeight}
                  fill={`url(#node-grad-${node.id})`}
                  rx={3}
                  className="drop-shadow-sm"
                />
                {/* Node name */}
                <text
                  x={textX}
                  y={(node.y0 + node.y1) / 2 - (nodeHeight > 40 ? 6 : 0)}
                  dy="0.35em"
                  textAnchor={textAnchor}
                  className="text-[11px] font-bold fill-[#1a1a1a]"
                >
                  {node.name}
                </text>
                {/* Node value */}
                {nodeHeight > 30 && (
                  <text
                    x={textX}
                    y={(node.y0 + node.y1) / 2 + 12}
                    dy="0.35em"
                    textAnchor={textAnchor}
                    className="text-[10px] font-medium fill-[#666]"
                  >
                    ₩{(node.value / 1000000000000).toFixed(1)}조
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Custom Tooltip */}
      {hoveredLink !== null && (
        <div
          className="absolute bg-white border border-[#E5EAEF] shadow-xl p-3 rounded-lg z-50 pointer-events-none text-[12px]"
          style={{
            left:
              (links[hoveredLink].source.x1 + links[hoveredLink].target.x0) / 2,
            top: (links[hoveredLink].y0 + links[hoveredLink].y1) / 2 - 40,
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[#333]">
              {links[hoveredLink].source.name}
            </span>
            <span className="text-[#888]">→</span>
            <span className="font-bold text-[#333]">
              {links[hoveredLink].target.name}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[#888]">금액</span>
            <span className="font-bold text-[#0046FF]">
              ₩{(links[hoveredLink].value / 1000000000000).toFixed(2)}조원
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[#888]">매출 비중</span>
            <span className="font-bold text-[#1a1a1a]">
              {totalRevenue > 0
                ? ((links[hoveredLink].value / totalRevenue) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
