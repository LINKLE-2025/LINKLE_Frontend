import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import MainFooter from "@/components/footer/MainFooter";

export default function ProfileLayout() {
  const [footerHeight, setFooterHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.clientHeight);
    }
  }, []);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) {
      setFooterHeight(footer.clientHeight);
    }
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] text-black">
      <main
        className={`flex-1 overflow-y-auto`}
        style={{ paddingBottom: footerHeight }}
      >
        <Outlet context={{ headerHeight, footerHeight }} />
      </main>
      <MainFooter />
    </div >
  );
}
