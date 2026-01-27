import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분 동안 데이터를 fresh로 간주 (불필요한 재요청 방지)
      staleTime: 1000 * 60 * 5,
      // 30분 동안 캐시 유지 (페이지 이동 후 돌아와도 데이터 유지)
      gcTime: 1000 * 60 * 30,
      // 창 포커스 시 자동 refetch 비활성화 (불필요한 요청 방지)
      refetchOnWindowFocus: false,
      // 마운트 시 stale 데이터만 refetch (fresh 데이터는 재요청 안함)
      refetchOnMount: true,
      // 네트워크 재연결 시 refetch
      refetchOnReconnect: true,
      // 실패 시 3번까지 재시도
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

async function enableMocking() {
  if (import.meta.env.VITE_MSW_ENABLED !== "true") {
    return;
  }

  const { worker } = await import("./mocks/browser");
  return worker.start({
    onUnhandledRequest: "warn",
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
});
