import MainFooter from "@/components/footer/MainFooter";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "@/api/authApi";

export default function FriendLayout() {
  const [isAuthLoading, setIsAuthLoading] = useState(true); // ← 여기에 주목
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const userId = await getCurrentUserId(); // accessToken 만료 시 refresh 요청 포함
        setLoggedInUserId(userId);
      } catch (err) {
        console.error("현재 유저 ID 불러오기 실패:", err);
      } finally {
        setIsAuthLoading(false); // ✅ 무조건 false로 내려줌
      }
    })();
  }, []);

  if (isAuthLoading) {
    return <div className="h-screen bg-white" />; // 혹은 null
  }

  return (
    <div className="flex flex-col min-h-[100dvh] text-black">
      <main className="flex-col items-center justify-center text-center">
        {/* ✅ context로 userId 전달 */}
        <Outlet context={{ loggedInUserId }} />
      </main>
      <MainFooter />
    </div>
  );
}
