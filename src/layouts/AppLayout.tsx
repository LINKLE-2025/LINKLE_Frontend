import { JSX, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MainHeader from "@/components/header/MainHeader";
import MainFooter from "@/components/footer/MainFooter";
import BackTitleHeader from "@/components/header/BackTitleHeader";

export default function AppLayout() {

  interface SearchItem {
    name: string;
    address: string;
    lat: number;
    lng: number;
  }

  const location = useLocation();
  const headerHeight = 52;
  const footerHeight = 78;

  // 전역 상태로 링커 생성 모드 및 검색 관련 관리
  const [linkerCreateMode, setLinkerCreateMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [showAddress, setShowAddress] = useState(false);
  const [showClusterList, setShowClusterList] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);


  // Header, Footer 컴포넌트 동적 설정
  let header: JSX.Element | null = null;
  let footer: JSX.Element | null = null;
  let paddingBottom = "";

  switch (true) {
    case location.pathname.startsWith("/post"): // post 상세, 작성, 수정 페이지
      header = <BackTitleHeader title="포스트" backTo="/post" className="bg-white" />;
      break;
    case location.pathname.startsWith("/map"): // 지도 페이지
      header = <MainHeader />;
      footer = <MainFooter
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
        }} />
      paddingBottom = "pb-[calc(4.8rem+env(safe-area-inset-bottom))]";
      break;
    default:  // 그 외 모든 페이지
      header = <MainHeader />;
      footer = <MainFooter linkerCreateMode={linkerCreateMode} setLinkerCreateMode={setLinkerCreateMode} />
      paddingBottom = "pb-[calc(4.8rem+env(safe-area-inset-bottom))]";
      break;
  }


  return (
    <div className='relative flex flex-col min-h-screen text-black'>
      {/* Header */}
      {header}

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
      {footer}
    </div>
  );
}
