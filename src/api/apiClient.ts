import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api", // 환경 변수에서 API 기본 URL 설정
  withCredentials: true, // ✅ HttpOnly Cookie 전송
});

// Lazy Refresh 인터셉터
let isRefreshing = false;
let refreshSubscribers: ((tokenRefreshed: boolean) => void)[] = [];

// 모든 요청 후 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 발생 시
    if (error.response?.status === 401 && !originalRequest._retry) {
      // ✅ /auth/me 는 refresh 시도하지 않고 바로 reject
      if (originalRequest.url?.includes("/auth/me")) {
        return Promise.reject(error);
      }
      if (isRefreshing) {
        // 이미 갱신 중이면, Promise 대기 후 다시 시도
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((success) => {
            if (success) {
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh", {});
        isRefreshing = false;
        refreshSubscribers.forEach((cb) => cb(true));
        refreshSubscribers = [];
        return apiClient(originalRequest); // 원래 요청 재시도
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers.forEach((cb) => cb(false));
        refreshSubscribers = [];
        window.location.href = "/login"; // 로그인 페이지로 리다이렉트
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
