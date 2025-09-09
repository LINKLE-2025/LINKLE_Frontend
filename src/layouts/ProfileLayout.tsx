import MainFooter from "@/components/footer/MainFooter";
import MainHeader from "@/components/header/MainHeader";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "@/api/authApi";

export default function ProfileLayout() {
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const userId = await getCurrentUserId(); // ✅ 여기서 await 가능
        setLoggedInUserId(userId);
      } catch (err) {
        console.error("현재 유저 ID 불러오기 실패:", err);
      }
    })();
  }, []);

  // 아직 userId 안 불러왔을 때 로딩 처리
  if (loggedInUserId === null) {
    return <div className="text-center py-10">불러오는 중...</div>;
  }

  return (
    <div className='flex flex-col min-h-[100dvh] text-black'>
      <main
        className='flex-col items-center justify-center text-center'
      >
        <Outlet context={{ loggedInUserId }} />
      </main>
      <MainFooter />
    </div>
  );
}
