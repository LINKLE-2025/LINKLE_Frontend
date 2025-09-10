import { Home, Search, Send, CircleUserRound } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import FooterItem from "./FooterItem";

interface MainFooterProps {
  linkerCreateMode?: boolean;
  setLinkerCreateMode?: React.Dispatch<React.SetStateAction<boolean>>; // 🔹 추가
}

function MainFooter({ linkerCreateMode, setLinkerCreateMode }: MainFooterProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
    <footer className='w-full bg-white border-t z-[2] border-gray-200 text-gray-400
                       text-xs py-0 text-center fixed bottom-0 pb-[env(safe-area-inset-bottom)]'>
      <div className='flex items-center justify-around'>
        <FooterItem
          to="/map"
          icon={<Home className="w-6 h-6" />}
          label="홈"
          linkerCreateMode={linkerCreateMode}
        />
        <FooterItem
          to="/search"
          icon={<Search className="w-6 h-6" />}
          label="검색"
          linkerCreateMode={linkerCreateMode}
        />
        <button
          type="button"
          onClick={handleLinkerButton}
          className="p-3 text-gray-900"
        >
          <div className='w-[14vw] flex flex-col items-center rounded-xl hover:bg-gray-100 p-2.5 transition-colors'>
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
        </button>
        <FooterItem
          to="/chat"
          icon={<Send className="w-6 h-6" />}
          label="채팅"
          linkerCreateMode={linkerCreateMode} />
        <FooterItem
          to="/profile"
          icon={<CircleUserRound className="w-6 h-6" />}
          label="프로필"
          linkerCreateMode={linkerCreateMode}
        />
      </div >
    </footer >
  );
}

export default MainFooter;
