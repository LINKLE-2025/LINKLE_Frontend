import PastelBackground from "@/components/background/PastelBackground";
import RandomPastelBackground from "@/components/background/RandomPastelBackground";
import TeamNameFooter from "@/components/footer/TeamNameFooter";
import SectionHeader from "@/components/header/SectionHeader";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export default function SignupLayout() {
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.clientHeight);
    }
  }, []);

  return (
    <div
      className='flex flex-col min-h-screen 
      relative 
    text-black'
    >
      {/* 배경 */}
      {/* <PastelBackground /> */}
      <RandomPastelBackground />

      {/* header */}
      <SectionHeader title='회원가입' className='bg-white/90' />

      {/* Outlet */}
      <main
        className='flex-grow flex flex-col items-center justify-start sm:justify-center text-center'
        style={{ paddingTop: headerHeight }}
      >
        <Outlet />
      </main>

      {/* footer */}
      <TeamNameFooter />
    </div>
  );
}
