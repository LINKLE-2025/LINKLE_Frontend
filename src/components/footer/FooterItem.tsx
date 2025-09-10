// src/components/common/FooterItem.tsx
import { Link, useLocation } from "react-router-dom";

interface FooterItemProps {
    to: string;
    icon: React.ReactNode;
    label?: string;
    linkerCreateMode?: boolean;
}

export default function FooterItem({ to, icon, label, linkerCreateMode }: FooterItemProps) {
    const location = useLocation();
    // 현재 경로가 to로 시작하면 active 처리 (링커 생성 모드가 아닐 때만)
    const isActive = !linkerCreateMode && location.pathname.startsWith(to);

    return (
        <Link to={to} className="p-3">
            <div
                className={`w-[14vw] flex flex-col items-center rounded-xl px-2 pt-2 pb-1 transition-colors
        ${isActive
                        ? "bg-gray-200/60 text-black"
                        : "hover:bg-gray-100 text-gray-900"
                    }`}
            >
                {icon}
                {label && (
                    <span className="block text-[0.55rem] mt-0.5">{label}</span>
                )}
            </div>
        </Link>
    );
}
