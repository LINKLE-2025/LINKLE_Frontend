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
    <div className='flex flex-col min-h-screen text-black'>
      <SectionHeader title='회원가입' />
      <main
        className='flex-grow flex flex-col items-center justify-start text-center'
        style={{ paddingTop: headerHeight }}
      >
        <Outlet />
      </main>
      <TeamNameFooter />
    </div>
  );
}
