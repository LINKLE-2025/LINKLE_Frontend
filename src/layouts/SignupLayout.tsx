import RandomPastelBackground from "@/components/background/RandomPastelBackground";
import TeamNameFooter from "@/components/footer/TeamNameFooter";
import BackTitleHeader from "@/components/header/BackTitleHeader";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export default function SignupLayout() {
  const [step, setStep] = useState(1);
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
      <RandomPastelBackground />

      {/* header */}
      <BackTitleHeader title='회원가입' className='bg-white/60' />

      {/* Outlet */}
      <main
        className='flex-grow flex flex-col items-center justify-start sm:justify-center text-center'
        style={{ paddingTop: headerHeight }}
      >
        <Outlet context={{ step, setStep }} />
      </main>

      {/* footer */}
      <TeamNameFooter />
    </div>
  );
}
