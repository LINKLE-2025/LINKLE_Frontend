import ChatHeader from "@/components/header/ChatHeader";
import BackTitleHeader from "@/components/header/BackTitleHeader";
import BackChatProfileHeader, { BackChatHeaderDMOverride } from "@/components/header/BackChatProfileHeader";
import MainFooter from "@/components/footer/MainFooter";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

  const [headerHeight, setHeaderHeight] = useState(56);
  const [footerHeight, setFooterHeight] = useState(0);

  const isChatList = pathname === "/chat" || pathname === "/chat/";
  const isCreateRoom = pathname.startsWith("/chat/room/create");
  const isChatRoom = pathname.startsWith("/chat/room/") && !isCreateRoom;

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
    <div className="relative flex flex-col min-h-screen text-black">
      <div ref={headerHostRef}>
        {isChatList && <ChatHeader title="채팅" className="bg-white" />}
        {isCreateRoom && <BackTitleHeader title="그룹채팅방 만들기" className="bg-white" />}

        {isChatRoom && roomHeader && (
          <BackChatProfileHeader
            room={roomHeader.room}
            backTo="/chat"
            onMenuClick={roomHeader.onMenuClick}
            menuOpen={roomHeader.menuOpen}
            dmName={roomHeader.dmName}
            dmNick={roomHeader.dmNick}
            dmUserId={roomHeader.dmUserId}
          />
        )}

        {isChatRoom && !roomHeader && (
          <header className="fixed top-0 w-full bg-white border-b border-gray-200 py-3 px-3 z-50">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-gray-100" />
              <div className="w-10 h-10 rounded-full bg-gray-200 ml-2 mr-2" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-2.5 w-16 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="absolute right-3 w-10 h-10 rounded-xl bg-gray-100" />
          </header>
        )}

      </div>

      <main className="flex-1" style={{ paddingTop: headerHeight, paddingBottom: footerHeight }}>
        <Outlet context={{ headerHeight, footerHeight, setRoomHeader }} />
      </main>

      <MainFooter />
    </div>
  );
}
