import axios from "axios";
import { refreshToken } from "./authApi";
import { enqueueRefresh } from "@/utils/refreshQueue";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api", // 환경 변수에서 API 기본 URL 설정
  withCredentials: true, // ✅ HttpOnly Cookie 전송
});

// 모든 요청 후 응답 인터셉터
apiClient.interceptors.response.use(
  (res) => {
    // console.log("응답 인터셉터:", res.data);
    return res;
  },
  async (err) => {
    // ✅ 네트워크 오류
    if (!navigator.onLine || err.code === "ERR_NETWORK") {
      window.location.href = "/error/network";
    }
    // ✅ 서버 오류
    else if (err.response?.status >= 500) {
      window.location.href = "/error/server";
    }
    // ✅ 인증 오류
    else if (err.response?.status === 401) {
      console.log("❌ 인증 실패 - 에러 메시지: ", err.response.data.message);
      // try {
      //   // Queue에 넣어 중복 호출 방지
      //   await enqueueRefresh(refreshToken);
      //   console.log("🔄 토큰 갱신 성공 - 원래 요청 재시도(" + err.config.url + ")");
      //   return apiClient(err.config); // 원래 요청 재시도
      // } catch (refreshError) {
      //   console.log("❌❌ 토큰 갱신 실패 - 로그아웃 처리", refreshError);
      //   alert("로그인이 필요합니다.");
      //   window.location.href = "/auth/login";
      // }
    }

    // ➡️ 나머지 오류 그대로 반환
    return Promise.reject(err);
  },
);

export default apiClient;
