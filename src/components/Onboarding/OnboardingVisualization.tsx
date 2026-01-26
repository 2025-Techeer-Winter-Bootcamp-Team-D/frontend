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

  // 자동 재생
  useEffect(() => {
    if (isInitialized && autoPlay && chartRef.current) {
      // 충분한 지연 후 시작 (ECharts가 완전히 준비되도록)
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          start();
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, autoPlay, start]);

  return (
    <div
      className="relative w-full h-full overflow-hidden transition-all duration-500"
      style={{ background: currentBackground }}
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default OnboardingVisualization;
