// src/components/common/FooterItem.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";

interface FooterItemProps {
    to: string;
    icon: React.ReactNode;
    label?: string;
    linkerCreateMode?: boolean;
    setLinkerCreateMode?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FooterItem({ to, icon, label, linkerCreateMode, setLinkerCreateMode }: FooterItemProps) {
    const location = useLocation();
    const navigate = useNavigate();

    // 현재 경로가 to로 시작하면 active 처리 (링커 생성 모드가 아닐 때만)
    const isActive = !linkerCreateMode && location.pathname.startsWith(to);

    const handleClick = () => {
        if (linkerCreateMode) {
            setLinkerCreateMode?.(false); // 다른 버튼 누르면 항상 OFF
        }
        navigate(to);
    };

    return (
        <button onClick={handleClick} className="px-3 py-2">
            <div
                className={`w-[14vw] flex flex-col items-center rounded-xl 
                            transition-colors duration-100
        ${isActive
                        ? "bg-gray-100/80 text-black"
                        : "hover:bg-gray-100/60 text-gray-900"
                    }`}
            >
                <div className="flex flex-col items-center w-full h-full active:scale-95 transition-transform duration-100 px-2 pt-2 pb-1">
                    {icon}
                    {label && (
                        <span className="block text-[0.55rem] mt-0.5">{label}</span>
                    )}
                </div>
            </div>
        </button>
    );
}
