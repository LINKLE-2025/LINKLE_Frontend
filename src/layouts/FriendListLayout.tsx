import MainFooter from "@/components/footer/MainFooter";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

export default function FriendListLayout() {
  const footerRef = useRef<HTMLElement>(null);
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

  useLayoutEffect(() => {
    if (!footerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setFooterHeight(entry.contentRect.height);
      }
    });
    observer.observe(footerRef.current);

    return () => observer.disconnect();
  }, []);


  return (
    <div className="flex flex-col min-h-screen text-black">
      <main
        className="flex-1"
        style={{ paddingTop: headerHeight, paddingBottom: footerHeight }}
      >
        <Outlet context={{ headerHeight, footerHeight }} />
      </main>
      <MainFooter />
    </div >
  );
}
