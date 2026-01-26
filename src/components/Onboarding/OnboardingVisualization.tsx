import React, { useRef, useEffect, useCallback, useState } from "react";
import * as echarts from "echarts/core";
import {
  PieChart,
  SankeyChart,
  RadarChart,
  ParallelChart,
  SunburstChart,
  TreemapChart,
  GraphChart,
} from "echarts/charts";
import {
  GridComponent,
  TitleComponent,
  LegendComponent,
  GraphicComponent,
  TooltipComponent,
  ParallelComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { UniversalTransition } from "echarts/features";

import scenes from "./scenes";
import type Scene from "./scenes/Scene";
import type { EChartsInstance } from "./scenes/Scene";

// ECharts 컴포넌트 등록
echarts.use([
  PieChart,
  SankeyChart,
  RadarChart,
  ParallelChart,
  SunburstChart,
  TreemapChart,
  GraphChart,
  GridComponent,
  TitleComponent,
  LegendComponent,
  GraphicComponent,
  TooltipComponent,
  ParallelComponent,
  CanvasRenderer,
  UniversalTransition,
]);

interface OnboardingVisualizationProps {
  onComplete?: () => void;
  autoPlay?: boolean;
  loop?: boolean;
}

const OnboardingVisualization: React.FC<OnboardingVisualizationProps> = ({
  onComplete,
  autoPlay = true,
  loop = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsInstance | null>(null);
  const sceneIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const [currentBackground, setCurrentBackground] = useState<string>("#FFFFFF");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [showStartButton, setShowStartButton] = useState<boolean>(true);
  const [isEntryDisplayed, setIsEntryDisplayed] = useState<boolean>(false);

  // 씬 플레이 함수 - clear() 제거하여 빈 화면 방지
  const playScene = useCallback((scene: Scene, onFinish: () => void) => {
    if (!chartRef.current || !isPlayingRef.current) return;

    scene.reset();
    setCurrentBackground(scene.getBackground());

    // Scene.ts에서 첫 옵션에 notMerge=true 사용하므로 clear() 불필요
    scene.play(chartRef.current, () => {
      if (isPlayingRef.current) {
        onFinish();
      }
    });
  }, []);

  // 다음 씬으로 이동
  const playNextScene = useCallback(() => {
    if (!isPlayingRef.current) return;

    const currentIndex = sceneIndexRef.current;
    const scene = scenes[currentIndex];

    if (!scene) {
      // 모든 씬 완료
      if (loop) {
        sceneIndexRef.current = 0;
        playNextScene();
      } else {
        isPlayingRef.current = false;
        onComplete?.();
      }
      return;
    }

    playScene(scene, () => {
      sceneIndexRef.current++;
      playNextScene();
    });
  }, [playScene, loop, onComplete]);

  // 엔트리 씬 첫 번째 단계만 표시 (랜딩 페이지)
  const displayEntryLanding = useCallback(() => {
    if (!chartRef.current) return;

    const entryScene = scenes[0];
    if (!entryScene) return;

    setCurrentBackground(entryScene.getBackground());
    chartRef.current.clear();

    // 엔트리 씬의 첫 번째 옵션만 표시
    const options = entryScene.getOptions();
    if (options.length > 0) {
      const firstOption = options[0];
      const option =
        typeof firstOption === "function"
          ? firstOption(chartRef.current)
          : firstOption;
      chartRef.current.setOption(option);
    }

    setIsEntryDisplayed(true);
  }, []);

  // 사용자가 버튼 클릭 시 애니메이션 시작
  const handleStartClick = useCallback(() => {
    setShowStartButton(false);

    // 엔트리 씬의 두 번째 단계부터 시작 (페이드아웃 + 수축)
    if (!chartRef.current) return;

    const entryScene = scenes[0];
    if (!entryScene) return;

    isPlayingRef.current = true;

    const options = entryScene.getOptions();
    const durations = entryScene.getDurations();

    if (options.length > 1) {
      // 두 번째 옵션 적용 (페이드아웃)
      const secondOption = options[1];
      const option =
        typeof secondOption === "function"
          ? secondOption(chartRef.current)
          : secondOption;
      chartRef.current.setOption(option, { notMerge: false });

      // 두 번째 단계 duration 후 다음 씬으로 이동
      setTimeout(() => {
        sceneIndexRef.current = 1; // 다음 씬부터 시작
        playNextScene();
      }, durations[1] || 1200);
    } else {
      // 옵션이 하나뿐이면 바로 다음 씬으로
      sceneIndexRef.current = 1;
      playNextScene();
    }
  }, [playNextScene]);

  // 시작
  const start = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    sceneIndexRef.current = 0;
    playNextScene();
  }, [playNextScene]);

  // 정지
  const stop = useCallback(() => {
    isPlayingRef.current = false;
    const currentScene = scenes[sceneIndexRef.current];
    currentScene?.stop();
  }, []);

  // 차트 초기화
  useEffect(() => {
    if (!containerRef.current) return;

    // ECharts 초기화
    const chart = echarts.init(containerRef.current, undefined, {
      renderer: "canvas",
    });

    chartRef.current = chart as unknown as EChartsInstance;

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener("resize", handleResize);

    // 초기화 완료 후 상태 업데이트 (다음 프레임에서)
    requestAnimationFrame(() => {
      setIsInitialized(true);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      stop();
      chart.dispose();
      chartRef.current = null;
    };
  }, [stop]);

  // 초기 화면 표시 (엔트리 랜딩 페이지)
  useEffect(() => {
    if (isInitialized && chartRef.current && !isEntryDisplayed) {
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          displayEntryLanding();
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isEntryDisplayed, displayEntryLanding]);

  return (
    <div
      className="relative w-full h-full overflow-hidden transition-all duration-500"
      style={{ background: currentBackground }}
    >
      {/* Liquid Glass 배경 효과 - Entry 씬에서만 표시 */}
      {showStartButton && isEntryDisplayed && (
        <>
          {/* Top-left: Strong white reflection */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              top: "-60px",
              left: "40%",
              width: "300px",
              height: "300px",
              background: "rgba(255, 255, 255, 0.25)",
              filter: "blur(60px)",
            }}
          />
          {/* 차트 중앙: 강한 블루 글로우 */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              top: "15%",
              right: "10%",
              width: "55%",
              height: "70%",
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(96, 165, 250, 0.15) 40%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          {/* Bottom-right: Deep blue glow */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              bottom: "-80px",
              right: "15%",
              width: "350px",
              height: "350px",
              background: "rgba(37, 99, 235, 0.35)",
              filter: "blur(70px)",
            }}
          />
          {/* Surface Gloss - wet look gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, transparent 100%)",
            }}
          />
        </>
      )}

      <div ref={containerRef} className="w-full h-full" />

      {/* Glass Play Button - Apple/Toss 스타일 */}
      {showStartButton && isEntryDisplayed && (
        <button
          onClick={handleStartClick}
          className="absolute z-50 flex items-center justify-center transition-all duration-300 rounded-full cursor-pointer hover:scale-110"
          style={{
            left: "70%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 100,
            height: 100,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            boxShadow:
              "0 20px 50px rgba(37, 99, 235, 0.25), inset 0 2px 0 0 rgba(255,255,255,1), inset 2px 0 0 0 rgba(255,255,255,0.6), inset 0 -2px 0 0 rgba(255,255,255,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)";
            e.currentTarget.style.boxShadow =
              "0 25px 60px rgba(37, 99, 235, 0.35), inset 0 2px 0 0 rgba(255,255,255,1), inset 2px 0 0 0 rgba(255,255,255,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)";
            e.currentTarget.style.boxShadow =
              "0 20px 50px rgba(37, 99, 235, 0.25), inset 0 2px 0 0 rgba(255,255,255,1), inset 2px 0 0 0 rgba(255,255,255,0.6), inset 0 -2px 0 0 rgba(255,255,255,0.2)";
          }}
        >
          {/* 버튼 내부 하이라이트 */}
          <div
            className="pointer-events-none absolute"
            style={{
              top: "8%",
              left: "15%",
              width: "50%",
              height: "25%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)",
              borderRadius: "50%",
              filter: "blur(2px)",
            }}
          />
          {/* Play Icon Triangle */}
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "14px solid transparent",
              borderBottom: "14px solid transparent",
              borderLeft: "26px solid #2563eb",
              marginLeft: 10,
              filter: "drop-shadow(0 3px 8px rgba(37, 99, 235, 0.4))",
            }}
          />
        </button>
      )}
    </div>
  );
};

export default OnboardingVisualization;
