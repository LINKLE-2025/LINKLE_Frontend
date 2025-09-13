import RandomPastelBackground from "@/components/background/RandomPastelBackground";
import TeamNameFooter from "@/components/footer/TeamNameFooter";
import MainHeader from "@/components/header/MainHeader";
import { Outlet, useLocation } from "react-router-dom";

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className='relative flex flex-col min-h-[100dvh] text-black'>
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

      {/* 헤더 뒤 paddingTop 보정 + 그라데이션 */}
      <div className="absolute top-0 left-0 w-full h-[52px] bg-gradient-to-b from-white to-transparent pointer-events-none z-[1]" />

      {/* Outlet */}
      <main
        className={`flex-grow flex flex-col items-center text-center pt-[52px]
          ${location.pathname === "/signup" ||
            location.pathname === "/password/reset" ?
            "justify-start sm:justify-center" :
            "justify-center"}`}
      >
        <Outlet />
      </main>

      {/* 푸터 위 paddingBottom 보정 + 그라데이션 */}
      <div className="absolute bottom-0 left-0 w-full h-[40px] bg-gradient-to-t from-white to-transparent pointer-events-none z-[1]" />

      {/* Footer */}
      <TeamNameFooter />
    </div>
  );
}
