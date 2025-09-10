import { useState, type RefObject, type KeyboardEvent } from "react";
import { MessageCircle, Clock, UserPlus, Users, Search } from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { openDm } from "@/services/chat";
import { sendFriendRequest } from "@/api/friendApi";
import { FriendSummaryWithProfileType, ProfileType } from "@/types/friend";
import { useLocation } from "react-router-dom";

interface SearchLinkerResponseDTO {
    linkerId: number;
    name: string;
    categoryId: number;
    memo: string;
    chatRoomCount: number;
    postCount: number;
}

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

const getButtonConfig = (profileType: ProfileType) => {
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
    const { loggedInUserId } = useOutletContext<OutletContextType>();
    const location = useLocation();
    const pathname = location.pathname;
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"friend" | "linker">("friend");
    const [linkerResults, setLinkerResults] = useState<SearchLinkerResponseDTO[]>([]);

    const fetchLinkers = async () => {
        try {
            const res = await fetch(`/api/search/linker?word=${searchQuery}`);
            const data = await res.json();
            setLinkerResults(data);
        } catch (err) {
            console.error("링커 검색 실패:", err);
        }
    };

    const handleTabSearch = () => {
        if (activeTab === "friend") {
            handleSearch(1);
        } else {
            fetchLinkers();
        }
    };

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
                    user.friendUserid === targetUserId
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
                    <Link
                        to="/profile/friend"
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg border flex items-center"
                    >
                        <Users className="w-4 h-4 mr-1" /> 친구 목록
                    </Link>
                );
            case "stranger":
                return (
                    <button
                        disabled={config.disabled}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm font-medium ${config.color} ${config.disabled ? "opacity-50" : "hover:opacity-90"}`}
                        onClick={() => handleAddFriend(user.friendUserid)}
                    >
                        {ButtonIcon && <ButtonIcon className="w-4 h-4" />} {config.text}
                    </button>
                );
            case "friend":
                return (
                    <button
                        onClick={() => handleMessage(user.friendUserid)}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm font-medium bg-blue-500 disabled:opacity-60"
                    >
                        <MessageCircle className="w-4 h-4" /> {loading ? "여는 중…" : "메시지"}
                    </button>
                );
            case "wait":
                return (
                    <button
                        disabled
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg cursor-default"
                    >
                        수락 대기 중
                    </button>
                );
            default:
                return null;
        }
    };

    // ✅ 검색 결과 없음 UI (중앙 정렬)
    const renderEmptyState = (message: string) => (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <img
                src="/icons/favicon/favicon.svg"
                alt="검색 없음"
                className="w-24 h-24 opacity-20 mb-4"
            />
            <p className="text-center text-sm">{message}</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white">
            {/* 검색창 */}
            <div className="bg-white px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            id="friend-search-input"
                            ref={inputRef}
                            type="text"
                            placeholder="검색어 입력"
                            className="w-full pl-5 ml-2 pr-4 py-2 rounded-full bg-gray-100 text-base outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === "Enter") {
                                    handleTabSearch();
                                    e.currentTarget.blur();
                                }
                            }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => handleTabSearch()}
                        className="px-2 py-2 text-sm text-gray-600 hover:text-blue-600 ml-1"
                    >
                        <img src="/icons/mapicon/search.png" className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* 탭 버튼 */}
            <div className="border-b flex text-sm font-medium">
                <button
                    className={`flex-1 px-4 py-2 border-b-2 ${activeTab === "friend" ? "border-black-500" : "border-transparent text-gray-400"}`}
                    onClick={() => setActiveTab("friend")}
                >
                    친구 검색
                </button>
                <button
                    className={`flex-1 px-4 py-2 border-b-2 ${activeTab === "linker" ? "border-black-500" : "border-transparent text-gray-400"}`}
                    onClick={() => setActiveTab("linker")}
                >
                    링커 검색
                </button>
            </div>

            {/* 검색 결과 */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col">
                {activeTab === "friend" ? (
                    searchResults.length > 0 ? (
                        searchResults.map((user) => {
                            const isDefaultImage = user.image === "public.png" || !user.image;
                            const profileImageSrc = isDefaultImage
                                ? user.gender === "남성"
                                    ? "/icons/public/Man.png"
                                    : "/icons/public/Woman.png"
                                : `/api/user/view/profile/${user.friendUserid}`;

                            return (
                                <div
                                    key={user.friendUserid}
                                    className="flex justify-between items-center py-2 border-b border-gray-200 px-2 gap-x-4"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <Link
                                            to={`/profile`}
                                            state={{
                                                userId: user.friendUserid,
                                                gender: user.gender,
                                                friendId: user.friendUserid,
                                                profileType: user.profileType,
                                                pathname,
                                            }}
                                        >
                                            <img
                                                src={profileImageSrc}
                                                alt={`${user.name} 프로필`}
                                                className={`w-12 h-12 object-cover rounded-full cursor-pointer ${isDefaultImage ? "opacity-20 bg-blue-100" : ""
                                                    }`}
                                            />
                                        </Link>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">
                                                    {user.name}
                                                </span>
                                                {user.profileType === "friend" && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                                        친구
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">@{user.nickname}</p>
                                        </div>
                                    </div>
                                    {renderButton(user)}
                                </div>
                            );
                        })
                    ) : (
                        renderEmptyState("검색 결과가 없습니다")
                    )
                ) : linkerResults.length > 0 ? (
                    linkerResults.map((linker) => (
                        <div key={linker.linkerId} className="p-3 border-b">
                            <div className="font-medium text-gray-800">{linker.name}</div>
                            <div className="text-sm text-gray-500">
                                카테고리: {linker.categoryId}
                            </div>
                            <div className="text-sm text-gray-500">
                                채팅방 수: {linker.chatRoomCount}, 포스트 수: {linker.postCount}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">{linker.memo}</div>
                        </div>
                    ))
                ) : (
                    renderEmptyState("링커 검색 결과가 없습니다")
                )}
            </div>
        </div>
    );
}
