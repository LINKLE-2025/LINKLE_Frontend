import ChatHeader from "@/components/header/ChatHeader";
import BackTitleHeader from "@/components/header/BackTitleHeader";
import BackChatProfileHeader, { BackChatHeaderDMOverride } from "@/components/header/BackChatProfileHeader";
import MainFooter from "@/components/footer/MainFooter";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { JSX, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RoomResponseDTO } from "@/types/chat";

export type ChatOutletContext = {
  headerHeight: number;
  footerHeight: number;
  setRoomHeader: (
    v: (
      {
        room: RoomResponseDTO;
        onMenuClick?: () => void;
        menuOpen?: boolean;
      } & BackChatHeaderDMOverride
    ) | null
  ) => void;
};

export default function ChatLayout() {
  const { pathname } = useLocation();

  const [headerHeight, setHeaderHeight] = useState(66);
  const [footerHeight, setFooterHeight] = useState(0);

  const isChatList = pathname === "/chat" || pathname === "/chat/";
  const isCreateRoom = pathname.startsWith("/chat/room/create");
  const isChatRoom = pathname.startsWith("/chat/room/") && !isCreateRoom;
  const navigate = useNavigate();
  const [roomHeader, setRoomHeader] = useState<
    (
      {
        room: RoomResponseDTO;
        onMenuClick?: () => void;
        menuOpen?: boolean;
      } & BackChatHeaderDMOverride
    ) | null
  >(null);

  const headerHostRef = useRef<HTMLDivElement | null>(null);
  const footerElRef = useRef<HTMLElement | null>(null);


  // Header, Footer 컴포넌트 동적 설정
  let header: JSX.Element | null = null;
  let footer: JSX.Element | null = null;
  let paddingBottom = "";

  switch (true) {
    case isChatList:  // 채팅 목록
      header = <ChatHeader title="채팅" className="bg-white" />;
      footer = <MainFooter />;
      paddingBottom = "pb-[calc(4.8rem+env(safe-area-inset-bottom))]";
      break;
    case isCreateRoom:  // 채팅방 생성
      const location = useLocation();
      const linkerFromState = location.state?.linker;
      header = <BackTitleHeader title="그룹채팅방 만들기" className="bg-white"
        onBack={() => {
          const linkerId = linkerFromState?.linkerId
          navigate("/map", { state: { openLinkerId: linkerId } });
          console.log("채팅방생성뒤로가기: ", linkerId)
        }}
      />;
      break;
    case isChatRoom:  // 채팅방
      if (roomHeader) {
        header = (
          <BackChatProfileHeader
            room={roomHeader.room}
            backTo="/chat"
            onMenuClick={roomHeader.onMenuClick}
            menuOpen={roomHeader.menuOpen}
            dmName={roomHeader.dmName}
            dmNick={roomHeader.dmNick}
            dmUserId={roomHeader.dmUserId}
            linkerId={roomHeader.room.linkerId}
          />
        );
      }
      break;
    default:
      break;
  }

  useLayoutEffect(() => {
    const queryHeader = () =>
      headerHostRef.current?.querySelector("header") as HTMLElement | null;
    let h = queryHeader();
    const measure = () => {
      h = queryHeader();
      if (h) setHeaderHeight(h.clientHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (h) ro.observe(h);
    return () => ro.disconnect();
  }, [pathname, roomHeader]);

  useEffect(() => {
    const f = document.querySelector("footer");
    if (f) footerElRef.current = f as HTMLElement;
  }, []);
  useLayoutEffect(() => {
    const f = footerElRef.current;
    if (!f) return;
    setFooterHeight(f.clientHeight);
    const ro = new ResizeObserver((ents) => {
      for (const e of ents) setFooterHeight(e.contentRect.height);
    });
    ro.observe(f);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isChatRoom && roomHeader) setRoomHeader(null);
  }, [isChatRoom, roomHeader]);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden text-black">
      <div ref={headerHostRef}>
        {header}
      </div>

      {/* 메인만 스크롤되게 */}
      <main className="flex-1 pt-[66px] bg-gray-50 relative">
        <Outlet context={{ headerHeight, footerHeight, setRoomHeader }} />
      </main>

      {footer}
    </div>
  );

}
