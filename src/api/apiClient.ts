import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api", // 환경 변수에서 API 기본 URL 설정
  withCredentials: true, // ✅ HttpOnly Cookie 전송
});

// 모든 요청 후 응답 인터셉터
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!navigator.onLine || err.code === "ERR_NETWORK") {
      window.location.href = "/error/network";
    } else if (err.response?.status >= 500) {
      window.location.href = "/error/server";
    } else if (err.response?.status === 401) {
      // window.location.href = "/error/auth";
    }
    return Promise.reject(err);
  },
);

export default apiClient;
