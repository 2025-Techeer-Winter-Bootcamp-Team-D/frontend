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

  // 씬 플레이 함수 - requestAnimationFrame으로 렌더링 완료 후 실행
  const playScene = useCallback((scene: Scene, onFinish: () => void) => {
    if (!chartRef.current || !isPlayingRef.current) return;

    scene.reset();
    setCurrentBackground(scene.getBackground());

    // 이전 차트 완전히 클리어
    chartRef.current.clear();

    // requestAnimationFrame으로 다음 프레임에서 실행
    requestAnimationFrame(() => {
      if (chartRef.current && isPlayingRef.current) {
        scene.play(chartRef.current, () => {
          if (isPlayingRef.current) {
            onFinish();
          }
        });
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
      <div ref={containerRef} className="w-full h-full" />

      {/* READY STATE 버튼 */}
      {showStartButton && isEntryDisplayed && (
        <button
          onClick={handleStartClick}
          className="absolute z-50 px-8 py-4 text-lg font-bold tracking-widest text-white transition-all duration-300 border rounded-xl hover:scale-105"
          style={{
            left: 150,
            bottom: "18%",
            background: "linear-gradient(145deg, #0A1A3F, #020408)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#0066FF";
            e.currentTarget.style.boxShadow = "0 0 35px #0066FF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(145deg, #0A1A3F, #020408)";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
          }}
        >
          READY STATE
        </button>
      )}
    </div>
  );
};

export default OnboardingVisualization;
