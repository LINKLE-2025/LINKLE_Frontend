import MainFooter from "@/components/footer/MainFooter";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "@/api/authApi";
import MainHeader from "@/components/header/MainHeader";
import BackTitleHeader from "@/components/header/BackTitleHeader";

export default function FriendLayout() {
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
      {/* Main: Footer 높이만큼 패딩 확보 */}
      <main
        className="flex-1 flex-col items-center justify-center text-center"
        style={{ paddingTop: headerHeight, paddingBottom: footerHeight }}
      >
        <Outlet context={{ loggedInUserId, headerHeight, footerHeight }} />
      </main>

      {/* Footer: 항상 화면 하단 고정 */}
      <footer className="fixed bottom-0 w-full z-50">
        <MainFooter />
      </footer>
    </div>
  );
}
