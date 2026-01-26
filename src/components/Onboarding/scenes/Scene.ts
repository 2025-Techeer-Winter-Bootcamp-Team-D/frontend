import type { EChartsOption } from "echarts";

function convertToArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

// ECharts 인스턴스 인터페이스 (echarts/core와 echarts 모두 호환)
export interface EChartsInstance {
  setOption: (option: EChartsOption, notMerge?: boolean | object) => void;
  getWidth: () => number;
  getHeight: () => number;
  dispose: () => void;
  resize: () => void;
  clear: () => void;
}

export type GetOption = (
  chart: EChartsInstance,
) => EChartsOption | undefined | void;

export interface SceneConfig {
  option: GetOption | EChartsOption | (GetOption | EChartsOption)[];
  duration: number | number[];
  background?: string;
  title?: string;
  dark?: boolean;
  file?: string;
  morphFromPrevious?: boolean; // true면 이전 씬에서 페이드 없이 모핑 전환
}

class Scene {
  private _options: (GetOption | EChartsOption)[];
  private _durations: number[];
  private _title: string;
  private _dark: boolean;
  private _background: string;
  private _file: string;
  private _morphFromPrevious: boolean;
  private _currentIndex: number = 0;
  private _timeoutId?: ReturnType<typeof setTimeout>;

  constructor(opts: SceneConfig) {
    this._options = convertToArray(opts.option);
    this._durations = convertToArray(opts.duration);
    this._title = opts.title || "";
    this._background = opts.background || "#FFFFFF";
    this._dark = opts.dark || false;
    this._file = opts.file || "scene";
    this._morphFromPrevious = opts.morphFromPrevious || false;
  }

  getDuration(): number {
    let sum = 0;
    this._options.forEach((_, idx) => {
      const duration =
        this._durations[idx] || this._durations[this._durations.length - 1];
      sum += duration;
    });
    return sum;
  }

  getFile(): string {
    return this._file;
  }

  getTitle(): string {
    return this._title;
  }

  getBackground(): string {
    return this._background;
  }

  isDark(): boolean {
    return this._dark;
  }

  shouldMorphFromPrevious(): boolean {
    return this._morphFromPrevious;
  }

  getOptions(): (GetOption | EChartsOption)[] {
    return this._options;
  }

  getDurations(): number[] {
    return this._durations;
  }

  reset(): void {
    this._currentIndex = 0;
  }

  play(chart: EChartsInstance, onfinish: () => void): void {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
    }
    this._playCurrent(chart, onfinish);
  }

  stop(): void {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = undefined;
    }
  }

  private _playCurrent(chart: EChartsInstance, onfinish: () => void): void {
    if (this._currentIndex >= this._options.length) {
      onfinish();
      return;
    }

    // morphFromPrevious가 true면 첫 번째 옵션에서도 notMerge: false로 설정해야 모핑이 작동함
    const notMerge = this._currentIndex === 0 && !this._morphFromPrevious;
    const option = this._options[this._currentIndex];

    if (typeof option === "function") {
      const ret = option(chart);
      if (ret) {
        chart.setOption(ret, notMerge);
      }
    } else {
      chart.setOption(option, notMerge);
    }

    const duration =
      this._durations[this._currentIndex] ||
      this._durations[this._durations.length - 1];

    this._timeoutId = setTimeout(() => {
      this._playCurrent(chart, onfinish);
    }, duration);

    this._currentIndex++;
  }
}

export default Scene;
