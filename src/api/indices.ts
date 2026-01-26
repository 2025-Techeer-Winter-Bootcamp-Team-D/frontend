import { api } from "./axios";

// 1. 서버 응답 데이터 원본 타입
interface IndexRaw {
  date: string;
  value: number;
  volume: number;
  amount: number;
}

interface MarketIndexResponse {
  status: number;
  message: string;
  data: {
    market: string;
    count: number;
    indices: IndexRaw[];
  };
}

// 2. 대시보드 컴포넌트에서 실제로 사용할 가공된 데이터 타입
export interface MarketIndexData {
  current_price: number;
  change_rate: number;
  indices: IndexRaw[];
}

export const getMarketIndex = async (
  marketType: "kospi" | "kosdaq",
): Promise<MarketIndexData> => {
  // baseURL 설정에 따라 '/api' 추가 여부를 결정하세요.
  const res = await api.get<MarketIndexResponse>(`/indices/${marketType}/`);
  const indices = res.data.data.indices;

  // 데이터가 2개 이상일 때 최신 데이터와 이전 데이터를 비교
  if (indices.length >= 2) {
    // 배열의 마지막이 최신 데이터인 경우 [indices.length - 1]
    // 만약 백엔드에서 내림차순(최신이 0번)으로 준다면 [0]과 [1]을 비교해야 합니다.
    const latest = indices[indices.length - 1];
    const previous = indices[indices.length - 2];
    const change_rate =
      previous.value === 0
        ? 0
        : ((latest.value - previous.value) / previous.value) * 100;

    return {
      current_price: latest.value,
      change_rate: change_rate,
      indices: indices,
    };
  }

  const firstValue = indices[0]?.value ?? 0;
  return {
    current_price: firstValue,
    change_rate: 0,
    indices: indices,
  };
};

export const getKospi = () => getMarketIndex("kospi");
export const getKosdaq = () => getMarketIndex("kosdaq");
