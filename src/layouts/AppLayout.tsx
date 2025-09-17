import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MainHeader from "@/components/header/MainHeader";
import MainFooter from "@/components/footer/MainFooter";

export default function AppLayout() {

  interface SearchItem {
    name: string;
    address: string;
    lat: number;
    lng: number;
  }

  const location = useLocation();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  // 전역 상태로 링커 생성 모드 관리
  const [linkerCreateMode, setLinkerCreateMode] = useState(false);

  // 🔥 검색 관련 상태도 여기서 관리
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [showAddress, setShowAddress] = useState(false);
  const [showClusterList, setShowClusterList] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
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
  // ----------------
  // post 페이지 여부 판단
  // ----------------
  const isPostPage = location.pathname.startsWith("/post");

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
        <Outlet context={{
          headerHeight,
          footerHeight,
          linkerCreateMode,
          setLinkerCreateMode,
          searchOpen,
          setSearchOpen,
          searchQuery,
          setSearchQuery,
          searchResults,
          setSearchResults,
          showAddress,
          setShowAddress,
          showClusterList,
          setShowClusterList,
          detailOpen,
          setDetailOpen,
        }} />
      </main>

      {/* Footer */}
      {/* ---------------- */}
      {!isPostPage && (
        <MainFooter
          linkerCreateMode={linkerCreateMode}
          setLinkerCreateMode={setLinkerCreateMode}
          onResetSearch={() => {
            console.log("초기화 실행");
            setSearchOpen(false);
            setSearchQuery("");
            setSearchResults([]);
            setShowAddress(false);
            setShowClusterList(false);
            setDetailOpen(false);
          }}
        />
      )}
      {/* ---------------- */}
    </div>
  );
}
