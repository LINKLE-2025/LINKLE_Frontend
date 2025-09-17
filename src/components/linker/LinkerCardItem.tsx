import React from "react";
import { CATEGORY_DATA } from "@/constants/categoryData";
import { useNavigate } from "react-router-dom";

interface LinkerCardItemProps {
    linker: {
        linkerId: number;
        name: string;
        categoryId: number;
        memo?: string;
        chatRoomCount: number;
        postCount: number;
        state: string;
        address: string;
    };
    onClick?: (linkerId: number) => void;
}

const LinkerCardItem = ({ linker, onClick }: LinkerCardItemProps) => {
    const category =
        linker.categoryId >= 1 && linker.categoryId <= CATEGORY_DATA.length
            ? CATEGORY_DATA[linker.categoryId - 1]
            : null;

    const bgColor = category?.color ?? "#F3F4F6";
    const icon = category?.icon ?? "/icons/category/default.png";
    const name = category?.name ?? "기타";
    const navigate = useNavigate();

    const isDeleted = linker.state === "DELETED";

    return (
        <div
            className="p-3 border-b flex items-start gap-3 rounded-xl"
            style={{ backgroundColor: isDeleted ? "#E5E7EB" : `${bgColor}10` }}
        >
            {/* 카테고리 아이콘 */}
            <div
                key={linker.linkerId}
                className={`flex items-center p-4 rounded-2xl border transition ${isDeleted ? "cursor-default" : "cursor-pointer hover:shadow-md"}`}
                style={{ backgroundColor: isDeleted ? "#D1D5DB" : `${bgColor}10` }}
                onClick={() => {
                    if (!isDeleted && onClick) onClick(linker.linkerId); // 여기서 MapPage의 onOpenDetailById 호출
                }}
            >
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: isDeleted ? "#9CA3AF" : `${bgColor}30` }}
                >
                    <img src={icon} alt={name} className="w-6 h-6" />
                </div>
            </div>

            {/* 링커 정보 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between w-full mb-1">
                    <div className={`font-medium truncate pr-2 ${isDeleted ? "text-gray-400" : "text-gray-800"}`}>
                        {linker.name}
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap text-right">
                        <p>채팅방 {linker.chatRoomCount}개</p>
                        <p>포스트 {linker.postCount}개</p>
                    </div>
                </div>
                {linker.memo && (
                    <div className={`text-sm mt-1 line-clamp-2 ${isDeleted ? "text-gray-400" : "text-gray-500"}`}>
                        {linker.memo}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkerCardItem;
