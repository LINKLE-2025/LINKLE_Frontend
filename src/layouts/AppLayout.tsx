import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MainHeader from "@/components/header/MainHeader";
import MainFooter from "@/components/footer/MainFooter";

export default function AppLayout() {
  const location = useLocation();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  // 전역 상태로 링커 생성 모드 관리
  const [linkerCreateMode, setLinkerCreateMode] = useState(false);

  // Header 뒤쪽 paddingTop 높이 동적으로 조정
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.clientHeight);
    }
  }, []);

  // Footer 뒤쪽 paddingBottom 높이 동적으로 조정
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) {
      setFooterHeight(footer.clientHeight);
    }
  }, []);

  return (
    <div className='relative flex flex-col min-h-screen text-black'>
      {/* Header */}
      <MainHeader />

      {/* Outlet */}
      <main
        className={`flex flex-col items-center text-center 
          ${location.pathname === "/signup" ? "justify-start sm:justify-center" : "justify-center"}`}
        style={{ paddingTop: headerHeight, paddingBottom: footerHeight }}
      >
        <Outlet context={{ headerHeight, footerHeight, linkerCreateMode, setLinkerCreateMode }} />
      </main>

      {/* Footer */}
      <MainFooter linkerCreateMode={linkerCreateMode} setLinkerCreateMode={setLinkerCreateMode} />
    </div>
  );
}
