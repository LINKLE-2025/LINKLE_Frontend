import PastelBackground from "@/components/background/PastelBackground";
import RandomPastelBackground from "@/components/background/RandomPastelBackground";
import TeamNameFooter from "@/components/footer/TeamNameFooter";
import MainHeader from "@/components/header/MainHeader";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
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
      {/* <PastelBackground /> */}
      <RandomPastelBackground />

      {/* header */}
      <MainHeader className='bg-white/90' />

      {/* Outlet */}
      <main
        className='flex-grow flex flex-col items-center justify-center text-center'
        style={{ paddingTop: headerHeight }}
      >
        <Outlet />
      </main>

      {/* footer */}
      <TeamNameFooter />
    </div>
  );
}
