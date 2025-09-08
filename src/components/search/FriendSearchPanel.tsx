// src/components/search/FriendSearchPanel.tsx

import { type RefObject, type KeyboardEvent, useState } from "react";
import { MessageCircle, Clock, UserPlus } from "lucide-react";
import { ProfileType } from "@/types/friend";

export interface FriendResult {
    id: number;
    name: string;
    nickname: string;
    imageUrl?: string;
    profileType: ProfileType;
}

export interface FriendSearchPanelProps {
    currentUserId: number;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    searchResults: FriendResult[];
    setSearchResults: React.Dispatch<React.SetStateAction<FriendResult[]>>;
    handleSearch: (page?: number) => void;
    inputRef: RefObject<HTMLInputElement | null>;
}



const getButtonConfig = (profileType: ProfileType) => {
    switch (profileType) {
        case "friend":
            return { text: "메시지", icon: MessageCircle, color: "bg-blue-500", disabled: false };
        case "wait":
            return { text: "수락 대기중", icon: Clock, color: "bg-gray-400", disabled: true };
        case "stranger":
            return { text: "친구 추가", icon: UserPlus, color: "bg-green-500", disabled: false };
        default:
            return { text: "나", icon: null, color: "", disabled: true };
    }
};

export default function FriendSearchPanel({
    currentUserId,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    handleSearch,
    inputRef,
}: FriendSearchPanelProps) {
    const handleAddFriend = async (targetUserId: number) => {
        try {
            const response = await fetch("/api/friend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId1: currentUserId,
                    userId2: targetUserId,
                }),
            });

            if (!response.ok) throw new Error("친구 요청 실패");

            setSearchResults((prev) =>
                prev.map((user) =>
                    user.id === targetUserId
                        ? { ...user, profileType: "wait" } // 또는 "friend" 조건에 따라
                        : user
                )
            );
            const data = await response.json();
            console.log("친구 요청 성공:", data);

            // 👉 상태 새로고침 or 버튼 UI 업데이트
        } catch (err) {
            console.error(err);
            alert("친구 요청 중 오류가 발생했습니다.");
        }
    };
    // const [results, setResults] = useState<FriendResult[]>([]);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* 검색창 */}
            <div className="flex items-center p-2 border-b border-gray-200 gap-x-2">
                <input
                    id="friend-search-input"
                    ref={inputRef}
                    type="text"
                    placeholder="친구 검색"
                    className="flex-1 px-3 py-3 rounded-lg bg-gray-100 text-base outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                            handleSearch(1);
                            e.currentTarget.blur();
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={() => handleSearch(1)}
                    className="w-14 h-12 flex items-center justify-center bg-white cursor-pointer"
                >
                    <img
                        src="/icons/user/search.png"
                        alt="검색"
                        className="w-7 h-7"
                    />
                </button>
            </div>

            {/* 검색 결과 */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2">
                {searchResults.length > 0 ? (
                    searchResults.map((user, idx) => {
                        const config = getButtonConfig(user.profileType);
                        const ButtonIcon = config.icon;

                        return (
                            <div
                                key={user.id ?? idx}
                                className="flex justify-between items-center py-2 border-b border-gray-200 px-2 gap-x-4"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <img
                                        src={`/api/user/view/profile/${user.id}`}
                                        alt={`${user.name} 프로필`}
                                        className="w-12 h-12 object-cover rounded-full cursor-pointer"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{user.name}</span>
                                            {user.profileType === "friend" && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">친구</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">@{user.nickname}</p>
                                    </div>
                                </div>
                                <button
                                    disabled={config.disabled}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm font-medium ${config.color} ${config.disabled ? "opacity-50" : "hover:opacity-90"}`}
                                    onClick={() => handleAddFriend(user.id)}
                                >
                                    {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
                                    {config.text}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-4">
                        <img
                            src="/icons/user/empty.svg"
                            alt="검색 없음"
                            className="w-24 h-24 opacity-20 mb-4"
                        />
                        <p className="text-center text-sm">검색 결과가 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}
