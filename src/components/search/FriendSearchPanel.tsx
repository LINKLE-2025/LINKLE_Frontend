// src/components/search/FriendSearchPanel.tsx
import { type RefObject, type KeyboardEvent, useState } from "react";
import { MessageCircle, Clock, UserPlus, Users } from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { openDm } from "@/services/chat";
import { sendFriendRequest } from "@/api/friendApi";
import { FriendSummaryWithProfileType, ProfileType } from "@/types/friend";

type OutletContextType = { loggedInUserId: number };

export interface FriendSearchPanelProps {
    currentUserId: number;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    searchResults: FriendSummaryWithProfileType[];
    setSearchResults: React.Dispatch<React.SetStateAction<FriendSummaryWithProfileType[]>>;
    handleSearch: (page?: number) => void;
    inputRef: RefObject<HTMLInputElement | null>;
}

type ButtonConfig = {
    text: string;
    color: string;
    disabled: boolean;
    icon?: React.ComponentType<{ className?: string }>;
};

const getButtonConfig = (profileType: ProfileType): ButtonConfig => {
    switch (profileType) {
        case "friend":
            return { text: "메시지", icon: MessageCircle, color: "bg-blue-500", disabled: false };
        case "wait":
            return { text: "수락 대기중", icon: Clock, color: "bg-gray-400", disabled: true };
        case "stranger":
            return { text: "친구 추가", icon: UserPlus, color: "bg-green-500", disabled: false };
        case "self":
        default:
            return { text: "나", color: "bg-gray-300", disabled: true };
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
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { loggedInUserId } = useOutletContext<OutletContextType>();

    const handleMessage = async (targetUserId: number) => {
        if (loading || targetUserId === loggedInUserId) {
            alert("자기 자신에게는 DM을 보낼 수 없습니다.");
            return;
        }

        setLoading(true);
        try {
            const room = await openDm(targetUserId);
            navigate(`/chat/room/${room.roomId}`);
        } catch (e) {
            console.error(e);
            alert("DM을 여는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (targetUserId: number) => {
        try {
            const data = await sendFriendRequest(loggedInUserId, targetUserId);
            setSearchResults(prev =>
                prev.map(user =>
                    user.id === targetUserId
                        ? { ...user, profileType: data.state === "ACCEPTED" ? "friend" : "wait" }
                        : user
                )
            );
        } catch (err) {
            console.error("친구 요청 중 오류:", err);
            alert("친구 요청 실패");
        }
    };

    const renderButton = (user: FriendSummaryWithProfileType) => {
        const config = getButtonConfig(user.profileType);
        const ButtonIcon = config.icon;

        switch (user.profileType) {
            case "self":
                return (
                    <Link to="/friend" className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg border flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        친구 목록
                    </Link>
                );
            case "stranger":
                return (
                    <button
                        disabled={config.disabled}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm font-medium ${config.color} ${config.disabled ? "opacity-50" : "hover:opacity-90"
                            }`}
                        onClick={() => handleAddFriend(user.id)}
                    >
                        {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
                        {config.text}
                    </button>
                );
            case "friend":
                return (
                    <button
                        onClick={() => handleMessage(user.id)}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm font-medium bg-blue-500 disabled:opacity-60"
                    >
                        <MessageCircle className="w-4 h-4" />
                        {loading ? "여는 중…" : "메시지"}
                    </button>
                );
            case "wait":
                return (
                    <button disabled className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg cursor-default">
                        수락 대기 중
                    </button>
                );
            default:
                return null;
        }
    };

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
                    <img src="/icons/mapicon/search.png" alt="검색" className="w-7 h-7" />
                </button>
            </div>

            {/* 검색 결과 */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2">
                {searchResults.length > 0 ? (
                    searchResults.map((user) => {
                        const isDefaultImage = user.imageUrl === 'public.png' || !user.imageUrl;

                        const profileImageSrc = isDefaultImage
                            ? user.gender === '남성'
                                ? '/icons/public/Man.png'
                                : '/icons/public/Woman.png'
                            : `/api/user/view/profile/${user.id}`;

                        return (
                            <div key={user.id} className="flex justify-between items-center py-2 border-b border-gray-200 px-2 gap-x-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <Link to={`/profile`} state={{ userId: user.id, gender: user.gender }}>
                                        <img
                                            src={profileImageSrc}
                                            alt={`${user.name} 프로필`}
                                            className={`w-12 h-12 object-cover rounded-full cursor-pointer ${isDefaultImage ? 'opacity-20 bg-blue-100' : ''
                                                }`}
                                        />
                                    </Link>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{user.name}</span>
                                            {user.profileType === "friend" && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                                    친구
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">@{user.nickname}</p>
                                    </div>
                                </div>

                                {/* 타입별 버튼 */}
                                {renderButton(user)}
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-4">
                        <img src="/icons/favicon/favicon.svg" alt="검색 없음" className="w-24 h-24 opacity-20 mb-4" />
                        <p className="text-center text-sm">검색 결과가 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}
