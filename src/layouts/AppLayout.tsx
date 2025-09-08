import RandomPastelBackground from "@/components/background/RandomPastelBackground";
import MainFooter from "@/components/footer/MainFooter";
import TeamNameFooter from "@/components/footer/TeamNameFooter";
import BackTitleHeader from "@/components/header/BackTitleHeader";
import MainHeader from "@/components/header/MainHeader";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useOutletContext } from "react-router-dom";

export default function AppLayout() {
  const location = useLocation();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

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

  // Outlet context 받아오기
  const outletContext = useOutletContext<{
    headerHeight: number;
    footerHeight: number;
    searchOpen?: boolean;
    setSearchOpen?: (open: boolean) => void;
  }>();

  return (
    <div className='relative flex flex-col min-h-screen text-black'>
      {/* 배경 */}
      {/* <RandomPastelBackground /> */}

      {/* Header */}
      {location.pathname === "/signup" ? (
        <BackTitleHeader title='회원가입' className='bg-white/60' />
      ) : (
        <MainHeader />
      )}

      {/* Header */}
      {outletContext?.searchOpen ? (
        // 🔹 검색창 열리면 BackTitleHeader로 교체
        <BackTitleHeader
          title='검색'
          onBack={() => {
            console.log("🔙 검색창 닫기");
            outletContext.setSearchOpen?.(false);
          }}
        />
      ) : location.pathname === "/signup" ? (
        <BackTitleHeader title='회원가입' className='bg-white/60' />
      ) : (
        <MainHeader />
      )}

      {/* Outlet */}
      <main
        className={`flex flex-col items-center text-center 
          ${location.pathname === "/signup" ? "justify-start sm:justify-center" : "justify-center"}`}
        style={{ paddingTop: headerHeight, paddingBottom: footerHeight }}
      >
        <Outlet context={{ headerHeight, footerHeight }} />
      </main>

      {/* Footer */}
      <MainFooter />
    </div>
  );
}
