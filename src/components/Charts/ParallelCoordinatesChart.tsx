import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Stock, AxisKey, AxisInfo, BrushRange } from "../../types";
import { AXES } from "../../constants";

interface Props {
  data: Stock[];
  onFilterChange: (filters: Partial<Record<AxisKey, BrushRange>>) => void;
  filters: Partial<Record<AxisKey, BrushRange>>;
  filteredIds: Set<string>;
  onStockSelect: (stock: Stock | null) => void;
  selectedStockId: string | null;
}

const ParallelCoordinatesChart: React.FC<Props> = ({
  data,
  onFilterChange,
  filters,
  filteredIds,
  onStockSelect,
  selectedStockId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const activeFilters = useRef<Partial<Record<AxisKey, BrushRange>>>({});
  const filteredIdsRef = useRef<Set<string>>(filteredIds);

  // filteredIds가 변경될 때 ref 업데이트
  useEffect(() => {
    filteredIdsRef.current = filteredIds;
  }, [filteredIds]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // 설명 글씨가 들어갈 공간을 확보하기 위해 상단 여백을 60으로 설정
    const margin = { top: 60, right: 20, bottom: 30, left: 20 };
    const width = containerRef.current.clientWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    // --- 모눈종이 배경 패턴 정의 ---
    const patternSize = 20;
    const gridPattern = defs
      .append("pattern")
      .attr("id", "grid")
      .attr("width", patternSize)
      .attr("height", patternSize)
      .attr("patternUnits", "userSpaceOnUse");

    gridPattern
      .append("path")
      .attr("d", `M ${patternSize} 0 L 0 0 0 ${patternSize}`)
      .attr("fill", "none")
      .attr("stroke", "#f1f5f9")
      .attr("stroke-width", "1");

    // 발광 효과 필터
    const glow = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    glow
      .append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const totalWidth = width + margin.left + margin.right;
    const totalHeight = height + margin.top + margin.bottom;

    // 배경 모눈종이 추가
    svg
      .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#grid)");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scalePoint<AxisKey>()
      .range([0, width])
      .padding(0.5)
      .domain(AXES.map((d) => d.key));

    const y: Record<string, d3.ScaleLinear<number, number>> = {};
    AXES.forEach((axis) => {
      y[axis.key] = d3
        .scaleLinear()
        .domain(axis.domain)
        .range([height, 0])
        .clamp(true);
    });

    const path = (stock: Stock) => {
      const lineGenerator = d3
        .line<AxisKey>()
        .x((key) => x(key) ?? 0)
        .y((key) => y[key](stock[key] as number));
      return lineGenerator(AXES.map((axis) => axis.key));
    };

    const lineGroup = g.append("g").attr("class", "lines");

    lineGroup
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "stock-line")
      .attr("id", (d) => `line-${d.id}`)
      .attr("d", (d) => path(d))
      .style("fill", "none")
      .style("cursor", "pointer")
      .style("stroke", (d) =>
        filteredIds.has(d.id)
          ? d.id === selectedStockId
            ? "#ff3366"
            : "#0046FF"
          : "#e2e8f0",
      )
      .style("opacity", (d) =>
        filteredIds.has(d.id) ? (d.id === selectedStockId ? 1 : 0.6) : 0.05,
      )
      .style("stroke-width", (d) =>
        filteredIds.has(d.id) ? (d.id === selectedStockId ? 3 : 1.2) : 1,
      )
      .style("pointer-events", (d) => (filteredIds.has(d.id) ? "auto" : "none"))
      .on("mouseover", function (event, d) {
        if (!filteredIds.has(d.id)) return;
        d3.select(this)
          .raise()
          .style("stroke", "#ff3366")
          .style("stroke-width", 4)
          .style("opacity", 1);

        if (tooltipRef.current) {
          // 초기 위치를 마우스 근처로 설정하여 왼쪽 위에서 날아오는 현상 방지
          tooltipRef.current.style.left = event.clientX + 15 + "px";
          tooltipRef.current.style.top = event.clientY - 15 + "px";
          tooltipRef.current.style.opacity = "1";
          tooltipRef.current.style.visibility = "visible";
          tooltipRef.current.innerHTML = `
            <div class="font-bold text-slate-900 text-sm">${d.name}</div>
            <div class="text-xs text-slate-500 mb-2">${d.sector}</div>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between"><span class="text-slate-500">PER</span><span class="font-mono font-bold text-slate-800">${d.per.toFixed(1)}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">PBR</span><span class="font-mono font-bold text-slate-800">${d.pbr.toFixed(2)}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">ROE</span><span class="font-mono font-bold text-[#0046FF]">${d.roe.toFixed(1)}%</span></div>
            </div>
          `;
        }
      })
      .on("mousemove", function (event) {
        if (tooltipRef.current) {
          const tooltipWidth = tooltipRef.current.offsetWidth || 150;
          const tooltipHeight = tooltipRef.current.offsetHeight || 80;

          let left = event.clientX + 15;
          let top = event.clientY - 15;

          if (left + tooltipWidth > window.innerWidth)
            left = event.clientX - tooltipWidth - 15;
          if (top + tooltipHeight > window.innerHeight)
            top = event.clientY - tooltipHeight - 15;
          if (top < 0) top = event.clientY + 15;

          tooltipRef.current.style.left = left + "px";
          tooltipRef.current.style.top = top + "px";
        }
      })
      .on("mouseout", function (_event, d) {
        if (d.id === selectedStockId) return;
        d3.select(this)
          .style("stroke", filteredIds.has(d.id) ? "#0046FF" : "#e2e8f0")
          .style("stroke-width", filteredIds.has(d.id) ? 1.2 : 1)
          .style("opacity", filteredIds.has(d.id) ? 0.6 : 0.05);

        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "0";
          tooltipRef.current.style.visibility = "hidden";
        }
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        // ref를 사용하여 최신 filteredIds 값 참조
        if (filteredIdsRef.current.has(d.id)) {
          onStockSelect(d);
        }
      });

    const axes = g
      .selectAll(".axis")
      .data(AXES)
      .enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${x(d.key)},0)`)
      .each(function (d) {
        d3.select(this).call(d3.axisLeft(y[d.key]).ticks(5));
      });

    // --- [복구] 상단 설명 텍스트 (Description) ---
    axes
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -32) // 지표 이름보다 조금 더 위에 배치
      .text((d) => d.description)
      .style("fill", "#94a3b8")
      .style("font-size", "10px");

    // 지표 이름 (Label)
    axes
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -12)
      .text((d) => d.label)
      .style("fill", "#0046FF")
      .style("font-weight", "bold")
      .style("font-size", "13px");

    const brush = d3
      .brushY<AxisInfo>()
      .extent([
        [-15, 0],
        [15, height],
      ])
      .on("brush end", function (event, d) {
        if (!event.selection) {
          delete activeFilters.current[d.key];
        } else {
          const [y1, y0] = event.selection as [number, number];
          activeFilters.current[d.key] = {
            min: y[d.key].invert(y0),
            max: y[d.key].invert(y1),
          };
        }
        onFilterChange({ ...activeFilters.current });
      });

    axes
      .append("g")
      .attr("class", "brush")
      .each(function () {
        d3.select<SVGGElement, AxisInfo>(this).call(brush);
      });

    svg.on("click", () => onStockSelect(null));
  }, [data, onFilterChange, onStockSelect]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const lines = svg.selectAll<SVGPathElement, Stock>(".stock-line");

    lines.style("pointer-events", (d) =>
      filteredIds.has(d.id) ? "auto" : "none",
    );

    lines
      .transition()
      .duration(300)
      .style("stroke", (d) => {
        if (!filteredIds.has(d.id)) return "#e2e8f0";
        return d.id === selectedStockId ? "#ff3366" : "#0046FF";
      })
      .style("opacity", (d) => {
        if (!filteredIds.has(d.id)) return 0.05;
        return d.id === selectedStockId ? 1 : 0.5;
      })
      .style("stroke-width", (d) => {
        if (!filteredIds.has(d.id)) return 0.8;
        return d.id === selectedStockId ? 4 : 1.2;
      });

    lines.each(function (d) {
      const el = d3.select(this);
      if (d.id === selectedStockId) {
        el.style("filter", "url(#glow)").raise();
      } else {
        el.style("filter", null);
      }
    });
  }, [filteredIds, selectedStockId]);

  useEffect(() => {
    if (Object.keys(filters).length === 0 && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll<SVGGElement, AxisInfo>(".brush").each(function () {
        d3.select<SVGGElement, AxisInfo>(this).call(
          d3.brushY<AxisInfo>().move,
          null,
        );
      });
      activeFilters.current = {};
    }
  }, [filters]);

  const handleReset = () => {
    onFilterChange({});
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden relative p-4 z-0"
      style={{ isolation: "isolate" }}
    >
      <svg
        ref={svgRef}
        className="w-full select-none block"
        style={{ aspectRatio: "21/9", maxHeight: "700px" }}
      ></svg>
      <div
        ref={tooltipRef}
        className="pointer-events-none fixed bg-white/95 border border-slate-200 p-3 rounded-lg shadow-2xl backdrop-blur-sm opacity-0 transition-opacity z-[9999] min-w-[150px]"
        style={{ left: 0, top: 0 }}
      ></div>

      {/* 왼쪽 아래: 기업 수 표시 */}
      <div className="absolute bottom-4 left-4">
        <span className="text-sm text-slate-500">
          표시 기업{" "}
          <span className="font-bold text-[#0046FF]">{filteredIds.size}</span>
          <span className="text-slate-400"> / {data.length}</span>
        </span>
      </div>

      {/* 오른쪽 아래: 초기화 버튼 */}
      <button
        onClick={handleReset}
        className="absolute bottom-4 right-4 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
      >
        초기화
      </button>
    </div>
  );
};

export default ParallelCoordinatesChart;
