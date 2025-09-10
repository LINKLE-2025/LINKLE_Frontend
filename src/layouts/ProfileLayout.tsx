import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUserId, refreshToken } from "@/api/authApi";
import MainFooter from "@/components/footer/MainFooter";
import FullScreenLoader from "@/components/common/FullScreenLoader";

export default function ProfileLayout() {
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 먼저 현재 유저 정보 요청
        const userId = await getCurrentUserId();
        setLoggedInUserId(userId);
      } catch (err: any) {
        // 401 Unauthorized인 경우 accessToken이 만료되었을 수 있음
        if (err?.response?.status === 401) {
          try {
            // 토큰 refresh 시도
            await refreshToken();
            const userId = await getCurrentUserId(); // 다시 시도
            setLoggedInUserId(userId);
          } catch (refreshError) {
            console.error("토큰 리프레시 실패:", refreshError);
            // 여기서 로그인 페이지로 이동하거나 처리 가능
          }
        } else {
          console.error("유저 정보 불러오기 실패:", err);
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isAuthLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="flex flex-col min-h-[100dvh] text-black">
      <main className="flex-col items-center justify-center text-center">
        <Outlet context={{ loggedInUserId }} />
      </main>
      <MainFooter />
    </div>
  );
}
