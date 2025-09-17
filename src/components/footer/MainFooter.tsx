import { Home, Search, Send, CircleUserRound } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import FooterItem from "./FooterItem";

interface MainFooterProps {
  linkerCreateMode?: boolean;
  setLinkerCreateMode?: React.Dispatch<React.SetStateAction<boolean>>;
  onResetSearch?: () => void; // 검색 상태 초기화 함수 추가
}

function MainFooter({ linkerCreateMode, setLinkerCreateMode, onResetSearch }: MainFooterProps) {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <footer className='w-full bg-white border-t z-40 border-gray-200 text-gray-400
                       text-xs py-0 text-center fixed bottom-0 pb-[env(safe-area-inset-bottom)]'>
      <div className='flex items-center justify-around'>
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
          className="px-3 py-2 text-gray-900"
        >
          <div className='w-[14vw] flex flex-col items-center rounded-xl hover:bg-gray-100/60 '>
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
          icon={<Send className="w-6 h-6" strokeWidth={1.7} />}
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
