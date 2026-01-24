/**
 * 실시간 주가 WebSocket Hook
 * 실시간 주가 데이터를 수신하기 위한 WebSocket 연결 관리
 */
import { useEffect, useRef, useState, useCallback } from "react";

// 타입 정의
export interface StockPrice {
  type: "stock_price";
  stock_code: string;
  symbol: string;
  time: string;
  price: number;
  volume: number;
}

interface SubscriptionResult {
  type: "subscription_result";
  success: boolean;
  subscribed: string[];
  failed: string[];
  error: string | null;
  total_subscribed: number;
}

interface UnsubscriptionResult {
  type: "unsubscription_result";
  success: boolean;
  unsubscribed: string[];
  error: string | null;
  total_subscribed: number;
}

interface SubscriptionsList {
  type: "subscriptions_list";
  subscribed_codes: string[];
  count: number;
  kis_active_subscriptions: number;
  kis_max_subscriptions: number;
}

type WebSocketMessage =
  | StockPrice
  | SubscriptionResult
  | UnsubscriptionResult
  | SubscriptionsList
  | { type: "connection_established"; message: string; actions: string[] }
  | { type: "pong" }
  | { type: "error"; message: string }
  | { type: "warning"; message: string };

interface UseStockWebSocketOptions {
  /** 자동 연결 여부 (기본값: true) */
  autoConnect?: boolean;
  /** 최대 재연결 시도 횟수 (기본값: 5) */
  maxReconnectAttempts?: number;
  /** 메시지 수신 콜백 */
  onMessage?: (data: WebSocketMessage) => void;
  /** 연결 상태 변경 콜백 */
  onConnectionChange?: (connected: boolean) => void;
}

export function useStockWebSocket(options: UseStockWebSocketOptions = {}) {
  const {
    autoConnect = true,
    maxReconnectAttempts = 5,
    onMessage,
    onConnectionChange,
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState<Map<string, StockPrice>>(new Map());
  const [subscribedCodes, setSubscribedCodes] = useState<string[]>([]);
  const reconnectAttempts = useRef(0);
  const subscribedCodesRef = useRef<Set<string>>(new Set());

  // WebSocket URL 설정
  const getWsUrl = useCallback(() => {
    // 환경 변수에서 URL 가져오기
    const wsUrl = import.meta.env.VITE_WS_URL;
    if (wsUrl) return wsUrl;

    // 기본값: 현재 호스트 기반으로 URL 생성
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_API_BASE_URL
      ? new URL(import.meta.env.VITE_API_BASE_URL).host
      : "localhost:8000";
    return `${protocol}//${host}/ws/stock/`;
  }, []);

  const connectRef = useRef<(() => void) | undefined>(undefined);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = getWsUrl();
    console.log("[WS] 연결 시도:", wsUrl);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("[WS] 연결됨");
      setIsConnected(true);
      onConnectionChange?.(true);
      reconnectAttempts.current = 0;

      // 재연결 시 이전 구독 복원
      if (subscribedCodesRef.current.size > 0) {
        const codes = [...subscribedCodesRef.current];
        console.log("[WS] 이전 구독 복원:", codes);
        ws.current?.send(JSON.stringify({ action: "subscribe", codes }));
      }
    };

    ws.current.onmessage = (event) => {
      let data: WebSocketMessage;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error("[WS] 메세지 파싱 실패:", e, event.data);
        return;
      }

      // 콜백 호출
      onMessage?.(data);

      switch (data.type) {
        case "connection_established":
          console.log("[WS]", data.message);
          break;

        case "stock_price":
          setPrices((prev) => {
            const next = new Map(prev);
            next.set(data.stock_code, data);
            return next;
          });
          break;

        case "subscription_result":
          if (data.subscribed.length > 0) {
            data.subscribed.forEach((code) =>
              subscribedCodesRef.current.add(code),
            );
            setSubscribedCodes([...subscribedCodesRef.current]);
          }
          if (!data.success) {
            console.warn("[WS] 구독 실패:", data.failed, data.error);
          }
          break;

        case "unsubscription_result":
          if (data.unsubscribed.length > 0) {
            data.unsubscribed.forEach((code) =>
              subscribedCodesRef.current.delete(code),
            );
            setSubscribedCodes([...subscribedCodesRef.current]);
            // 해제된 종목 가격 데이터 제거
            setPrices((prev) => {
              const next = new Map(prev);
              data.unsubscribed.forEach((code) => next.delete(code));
              return next;
            });
          }
          break;

        case "subscriptions_list":
          subscribedCodesRef.current = new Set(data.subscribed_codes);
          setSubscribedCodes(data.subscribed_codes);
          break;

        case "error":
          console.error("[WS] 에러:", data.message);
          break;

        case "warning":
          console.warn("[WS] 경고:", data.message);
          break;
      }
    };

    ws.current.onclose = (event) => {
      console.log("[WS] 연결 종료:", event.code, event.reason);
      setIsConnected(false);
      onConnectionChange?.(false);

      // 자동 재연결 (지수 백오프)
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current),
          30000,
        );
        console.log(
          `[WS] ${delay}ms 후 재연결 시도 (${reconnectAttempts.current}/${maxReconnectAttempts})`,
        );
        setTimeout(() => connectRef.current?.(), delay);
      } else {
        console.error("[WS] 최대 재연결 시도 횟수 초과");
      }
    };

    ws.current.onerror = (error) => {
      console.error("[WS] 에러:", error);
    };
  }, [getWsUrl, maxReconnectAttempts, onMessage, onConnectionChange]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // 연결 해제
  const disconnect = useCallback(() => {
    reconnectAttempts.current = maxReconnectAttempts; // 재연결 방지
    ws.current?.close();
    ws.current = null;
  }, [maxReconnectAttempts]);

  // 종목 구독
  const subscribe = useCallback((codes: string[]) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: "subscribe", codes }));
    } else {
      // 연결 전 구독 요청 시 저장해두고 연결 후 구독
      codes.forEach((code) => subscribedCodesRef.current.add(code));
      console.warn("[WS] 연결되지 않음. 연결 후 구독됩니다:", codes);
    }
  }, []);

  // 종목 구독 해제
  const unsubscribe = useCallback((codes: string[]) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: "unsubscribe", codes }));
    }
    // ref에서도 제거
    codes.forEach((code) => subscribedCodesRef.current.delete(code));
  }, []);

  // 구독 목록 조회
  const listSubscriptions = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: "list_subscriptions" }));
    }
  }, []);

  // 연결 확인 (ping)
  const ping = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: "ping" }));
    }
  }, []);

  // 특정 종목 가격 조회
  const getPrice = useCallback(
    (code: string): StockPrice | undefined => {
      return prices.get(code);
    },
    [prices],
  );

  // 자동 연결
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [autoConnect, connect]);

  return {
    /** WebSocket 연결 상태 */
    isConnected,
    /** 실시간 주가 데이터 Map (종목코드 -> StockPrice) */
    prices,
    /** 현재 구독 중인 종목 코드 목록 */
    subscribedCodes,
    /** WebSocket 연결 */
    connect,
    /** WebSocket 연결 해제 */
    disconnect,
    /** 종목 구독 */
    subscribe,
    /** 종목 구독 해제 */
    unsubscribe,
    /** 구독 목록 조회 */
    listSubscriptions,
    /** 연결 확인 (ping) */
    ping,
    /** 특정 종목 가격 조회 */
    getPrice,
  };
}
