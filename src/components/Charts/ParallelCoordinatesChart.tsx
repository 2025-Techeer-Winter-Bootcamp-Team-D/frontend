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

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const margin = { top: 70, right: 60, bottom: 40, left: 60 };
    const width = containerRef.current.clientWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
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

    const g = svg
      .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scalePoint<AxisKey>()
      .range([0, width])
      .padding(1)
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
        .y((key) => y[key](stock[key]));
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
          : "#f1f5f9",
      )
      .style("opacity", (d) =>
        filteredIds.has(d.id) ? (d.id === selectedStockId ? 1 : 0.6) : 0.1,
      )
      .style("stroke-width", (d) =>
        filteredIds.has(d.id) ? (d.id === selectedStockId ? 3 : 1.2) : 1,
      )
      .style("pointer-events", (d) => (filteredIds.has(d.id) ? "auto" : "none"))
      .on("mouseover", function (_event, d) {
        if (!filteredIds.has(d.id)) return;
        d3.select(this)
          .raise()
          .style("stroke", "#ff3366")
          .style("stroke-width", 4)
          .style("opacity", 1);

        if (tooltipRef.current) {
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

          // Boundary check - prevent going off-screen
          if (left + tooltipWidth > window.innerWidth) {
            left = event.clientX - tooltipWidth - 15;
          }
          if (top + tooltipHeight > window.innerHeight) {
            top = event.clientY - tooltipHeight - 15;
          }
          if (top < 0) {
            top = event.clientY + 15;
          }

          tooltipRef.current.style.left = left + "px";
          tooltipRef.current.style.top = top + "px";
        }
      })
      .on("mouseout", function (_event, d) {
        if (d.id === selectedStockId) return;
        d3.select(this)
          .style("stroke", filteredIds.has(d.id) ? "#0046FF" : "#f1f5f9")
          .style("stroke-width", filteredIds.has(d.id) ? 1.2 : 1)
          .style("opacity", filteredIds.has(d.id) ? 0.6 : 0.1);

        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "0";
          tooltipRef.current.style.visibility = "hidden";
        }
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        if (filteredIds.has(d.id)) {
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

    axes
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -15)
      .text((d) => d.label)
      .style("fill", "#1e293b")
      .style("font-weight", "bold")
      .style("font-size", "14px");

    axes
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -35)
      .text((d) => d.description)
      .style("fill", "#64748b")
      .style("font-size", "10px");

    const brush = d3
      .brushY<AxisInfo>()
      .extent([
        [-10, 0],
        [10, height],
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

    lines
      .style("pointer-events", (d) => (filteredIds.has(d.id) ? "auto" : "none"))
      .transition()
      .duration(300)
      .style("stroke", (d) => {
        if (!filteredIds.has(d.id)) return "#f1f5f9";
        return d.id === selectedStockId ? "#ff3366" : "#0046FF";
      })
      .style("opacity", (d) => {
        if (!filteredIds.has(d.id)) return 0.1;
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

  // 필터가 빈 객체가 되면 브러시를 클리어
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

  return (
    <div
      ref={containerRef}
      className="w-full bg-white rounded-xl p-4 shadow-xl border border-slate-100 overflow-hidden relative"
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#0046FF]">
          나만의 저평가 우량주 발굴 (Parallel Coordinates)
        </h2>
        <p className="text-sm text-slate-500">
          선을 클릭하면 해당 기업이 강조됩니다.
        </p>
      </div>
      <svg
        ref={svgRef}
        className="w-full select-none"
        style={{ maxHeight: "600px" }}
      ></svg>
      <div
        ref={tooltipRef}
        className="pointer-events-none fixed bg-white/95 border border-slate-200 p-3 rounded-lg shadow-2xl backdrop-blur-sm opacity-0 transition-opacity z-[9999] min-w-[150px]"
        style={{ left: 0, top: 0 }}
      ></div>
    </div>
  );
};

export default ParallelCoordinatesChart;
