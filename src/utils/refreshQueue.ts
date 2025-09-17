import { retryWithBackoff } from "./retryWithBackoff";

let isRefreshing = false; // 갱신 작업 진행 중 여부
let refreshPromise: Promise<any> | null = null; // 진행 중인 갱신 작업의 Promise

// 토큰 갱신 작업을 Queue에 넣는 함수
export function enqueueRefresh(doRefresh: () => Promise<any>) {
  if (!isRefreshing) {
    isRefreshing = true;
    // 갱신 작업을 재시도 로직과 함께 실행
    refreshPromise = retryWithBackoff(doRefresh, 3).finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  }
  // 이미 갱신 작업이 진행 중이면 기존 작업의 Promise 반환
  return refreshPromise!;
}
