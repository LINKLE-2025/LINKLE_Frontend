import { Home, Search, Send, CircleUserRound } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FooterItem from "./FooterItem";
import { fetchRooms } from "@/services/chat";
import type { RoomResponseDTO } from "@/types/chat";
import { stompClient } from "@/lib/stompClient";
import { useAuthStore } from "@/store/authStore";

interface MainFooterProps {
  linkerCreateMode?: boolean;
  setLinkerCreateMode?: Dispatch<SetStateAction<boolean>>;
  onResetSearch?: () => void; // 검색 상태 초기화 함수 추가
}

function MainFooter({ linkerCreateMode, setLinkerCreateMode, onResetSearch }: MainFooterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // 방 목록 구독 (캐시가 없으면 1회 로드, 있으면 캐시만 구독)
  const { data: rooms } = useQuery<RoomResponseDTO[]>({
    queryKey: ["chatRooms"],
    queryFn: fetchRooms,
    staleTime: 10_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // 전체 미읽음 합계
  const unreadTotal = useMemo(
    () =>
      (rooms ?? []).reduce((sum, r: any) => {
        const n = Number(r?.unreadCount ?? 0);
        return sum + (Number.isFinite(n) ? Math.max(0, n) : 0);
      }, 0),
    [rooms],
  );

  // 유저 토픽 구독 → 방 목록 최신화(invalidate). 다른 페이지에서도 실시간 반영.
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!user?.userId) return;
    const topic = `/sub/users.${user.userId}.room-updates`;
    const off = stompClient.subscribe(topic, () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      }) as unknown as number;
    });
    return () => {
      try { off?.(); } catch { }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [user?.userId, queryClient]);

  const handleHomeClick = () => {
    onResetSearch?.(); // 🔥 검색 상태 초기화
    setLinkerCreateMode?.(false);
  };

  // 링커 생성 버튼 클릭 핸들러
  const handleLinkerButton = () => {
    if (location.pathname !== "/map") {
      // 다른 페이지 → /map으로 이동 후 모드 ON
      navigate("/map", { state: { linkerCreateMode: true } });
      setTimeout(() => setLinkerCreateMode?.(true), 0);
    } else {
      // 이미 /map이면 토글
      setLinkerCreateMode?.((prev) => !prev);
    }
  };

  // ✈️ 아이콘 + 미읽음 배지
  const chatIcon = (
    <div className="relative">
      <Send className="w-6 h-6" strokeWidth={1.7} />
      {unreadTotal > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white
                     text-[10px] leading-4 text-center border border-white shadow-sm"
          aria-label={`안 읽은 메시지 ${unreadTotal}개`}
        >
          {unreadTotal > 99 ? "99+" : unreadTotal}
        </span>
      )}
    </div>
  );

  return (
    <footer className='select-none w-full bg-white border-t z-40 border-gray-200 text-gray-400
                       text-xs py-0 text-center fixed bottom-0 pb-[min(env(safe-area-inset-bottom),16px)]'>
      <div className='flex items-center justify-evenly'>
        <FooterItem
          to="/map"
          icon={<Home className="w-6 h-6" />}
          label="홈"
          linkerCreateMode={linkerCreateMode}
          setLinkerCreateMode={setLinkerCreateMode}
          onClick={handleHomeClick}
        />
        <FooterItem
          to="/search"
          icon={<Search className="w-6 h-6" />}
          label="검색"
          linkerCreateMode={linkerCreateMode}
          setLinkerCreateMode={setLinkerCreateMode}
        />
        <button
          type="button"
          onClick={handleLinkerButton}
          className="px-1 xxs:px-3 py-2 text-gray-900"
        >
          <div className='w-[16vw] xxs:w-[14vw] flex flex-col items-center rounded-xl hover:bg-gray-100/60 '>
            <div className="w-full h-full flex flex-col items-center p-2.5 active:scale-95 transition-all duration-100">
              <img
                src={
                  linkerCreateMode
                    ? "/icons/common/footerLinkerOn.svg"   // ON 상태
                    : "/icons/common/footerLinkerOff.svg"  // OFF 상태
                }
                alt="링커 생성"
                className="text-gray-900"
              />
            </div>
          </div>
        </button>
        <FooterItem
          to="/chat"
          icon={chatIcon} // 배지가 얹힌 아이콘
          label="채팅"
          linkerCreateMode={linkerCreateMode}
          setLinkerCreateMode={setLinkerCreateMode}
        />
        <FooterItem
          to="/profile"
          icon={<CircleUserRound className="w-6 h-6" strokeWidth={1.65} />}
          label="프로필"
          linkerCreateMode={linkerCreateMode}
          setLinkerCreateMode={setLinkerCreateMode}
        />
      </div >
    </footer >
  );
}

export default MainFooter;
