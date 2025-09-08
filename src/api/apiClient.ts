import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api", // 환경 변수에서 API 기본 URL 설정
  withCredentials: true, // ✅ HttpOnly Cookie 전송
});

export default apiClient;
