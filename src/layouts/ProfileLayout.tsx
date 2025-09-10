import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUserId, refreshToken } from "@/api/authApi";
import MainFooter from "@/components/footer/MainFooter";
import FullScreenLoader from "@/components/common/FullScreenLoader";

export default function ProfileLayout() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const userId = await getCurrentUserId();
        setLoggedInUserId(userId);
      } catch (err) {
        console.error("현재 유저 ID 불러오기 실패:", err);
      } finally {
        setIsAuthLoading(false);
      }
    })();
  }, []);

  // Header 높이 계산
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.clientHeight);
    }
  }, []);

  // Footer 높이 계산
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) {
      setFooterHeight(footer.clientHeight);
    }
  }, []);

  if (isAuthLoading) {
    return <div className="h-screen bg-white" />;
  }


  return (
    <div className="flex flex-col min-h-[100dvh] text-black">
      <main className="flex-col items-center justify-center text-center"
        style={{ paddingTop: headerHeight }}>
        <Outlet context={{ loggedInUserId }} />
      </main>
      <MainFooter />
    </div>
  );
}
