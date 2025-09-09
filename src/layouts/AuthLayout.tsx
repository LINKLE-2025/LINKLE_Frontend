import RandomPastelBackground from "@/components/background/RandomPastelBackground";
import TeamNameFooter from "@/components/footer/TeamNameFooter";
import BackTitleHeader from "@/components/header/BackTitleHeader";
import MainHeader from "@/components/header/MainHeader";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function AuthLayout() {
  const location = useLocation();
  const [headerHeight, setHeaderHeight] = useState(0);

  // Header 뒤쪽 paddingTop 높이 동적으로 조정
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.clientHeight);
    }
  }, []);

  return (
    <div className='relative flex flex-col min-h-screen text-black'>
      {/* 배경 */}
      <RandomPastelBackground />

      {/* Header */}
      {location.pathname === "/signup" ? (
        <></>
      ) : location.pathname === "/password/reset" ? (
        <></>
      ) : (
        <MainHeader className='bg-white/60' />
      )}

      {/* Outlet */}
      <main
        className={`flex-grow flex flex-col items-center text-center 
          ${location.pathname === "/signup" ? "justify-start sm:justify-center" : "justify-center"}`}
        style={{ paddingTop: headerHeight }}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <TeamNameFooter />
    </div>
  );
}
