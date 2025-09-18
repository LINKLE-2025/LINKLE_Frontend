import { useState, type RefObject, type KeyboardEvent, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Clock, UserPlus, Users, Search } from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { openDm } from "@/services/chat";
import { sendFriendRequest } from "@/api/friendApi";
import { FriendSummaryWithProfileType, ProfileType } from "@/types/friend";
import { useLocation } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import SearchHeader from "../header/SearchHeader";
import { searchLinkers } from "@/api/searchApi";
import LinkerCardItem from "../linker/LinkerCardItem";

interface SearchLinkerResponseDTO {
    linkerId: number;
    name: string;
    categoryId: number;
    memo: string;
    chatRoomCount: number;
    postCount: number;
    state: string;
    address: string;
}

type OutletContextType = {
    loggedInUserId: number
    headerHeight: number;
    footerHeight: number;
};

export interface TotalSearchPanelProps {
    currentUserId: number;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    searchResults: FriendSummaryWithProfileType[];
    setSearchResults: React.Dispatch<React.SetStateAction<FriendSummaryWithProfileType[]>>;
    handleSearch: (page?: number) => void;
    inputRef: RefObject<HTMLInputElement | null>;
    headerHeight: number;
    footerHeight: number;
    isSearching?: boolean;
    hasSearched?: boolean;
    page: number;
    totalPages: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
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


export default function TotalSearchPanel({
    currentUserId,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    handleSearch,
    inputRef,
    isSearching,
    hasSearched,
    page,
    totalPages,
    setPage,
}: TotalSearchPanelProps) {
    const navigate = useNavigate();

    const location = useLocation();
    const pathname = location.pathname;
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"friend" | "linker">("friend");
    const [linkerResults, setLinkerResults] = useState<SearchLinkerResponseDTO[]>([]);
    const { footerHeight } =
        useOutletContext<OutletContextType>();
    const [totalPage, setTotalPages] = useState(0);

    const [linkerPage, setLinkerPage] = useState(0);
    const [linkerTotalPages, setLinkerTotalPages] = useState(0);
    const [tabHeight, setTabHeight] = useState(0);


    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = el;

            const bottomThreshold = scrollHeight - clientHeight * 1.1; // 90% 이하 도달
            if (scrollTop > bottomThreshold && !loading && page + 1 < totalPages) {
                handleSearch(page + 1);
            }
        };

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, [loading, page, totalPages, searchQuery]);

    useEffect(() => {
        const nav = document.querySelector("nav");
        if (nav) {
            setTabHeight(nav.clientHeight);
        }
    }, []);


    const fetchLinkers = async (pageToFetch = 0) => {
        try {
            const data = await searchLinkers(searchQuery, pageToFetch, 10);

            if (pageToFetch === 0) {
                // 첫 페이지는 초기화
                setLinkerResults(data.content);
            } else {
                // 그 외는 이어붙이기
                setLinkerResults(prev => [...prev, ...data.content]);
            }

            setLinkerPage(data.number);
            setLinkerTotalPages(data.totalPages);
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
        if (loading || targetUserId === currentUserId) {
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
            const data = await sendFriendRequest(currentUserId, targetUserId);
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

    // 검색 결과 없음 UI (중앙 정렬)
    const renderEmptyState = (message: string) => (
        <div className="flex flex-col items-center text-gray-300"
            style={{ marginBottom: footerHeight }}
        >
            <img
                src="/icons/favicon/favicon.svg"
                alt="검색 없음"
                className="w-44 h-44 xxs:w-56 xxs:h-56 opacity-10 mb-4"
            />
            <p className="text-center text-xl xxs:text-[23px]">{message}</p>
        </div>
    );

    const [headerHeight, setHeaderHeight] = useState(0);
    useEffect(() => {
        const header = document.querySelector("header");
        if (header) {
            setHeaderHeight(header.clientHeight);
        }
    }, []);
    return (
        <div className="flex flex-col h-full bg-white">
            {/* 검색창 */}
            <SearchHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={() => {
                    handleTabSearch();
                    inputRef?.current?.blur();
                }}
                placeholder="친구 또는 링커 검색"
            />

            {/* 탭 버튼 */}
            <nav
                className="fixed left-0 right-0 w-full bg-white border-b border-gray-200 flex text-[15px] font-medium z-40"
                style={{ marginTop: headerHeight }}
            >
                <button
                    className={`flex-1 px-4 py-2 border-b-2 mx-4 ${activeTab === "friend"
                        ? "border-linkleGray/25 text-black"
                        : "border-transparent text-gray-400"
                        }`}
                    onClick={() => setActiveTab("friend")}
                >
                    친구 검색
                </button>
                <button
                    className={`flex-1 px-4 py-2 border-b-2 mx-4 ${activeTab === "linker"
                        ? "border-linkleGray/25 text-black"
                        : "border-transparent text-gray-400"
                        }`}
                    onClick={() => setActiveTab("linker")}
                >
                    링커 검색
                </button>
            </nav>

            {/* 검색 결과 */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col"
                style={{ marginTop: headerHeight + tabHeight }}
            >
                {activeTab === "friend" ? (
                    <>
                        {searchResults.length > 0 ? (
                            <>
                                {searchResults.map((user) => {
                                    const isDefaultImage = user.image === "public.png" || !user.image;
                                    const profileImageSrc = isDefaultImage
                                        ? user.gender === "남성"
                                            ? "/icons/profile/Man.png"
                                            : "/icons/profile/Woman.png"
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
                                                        className={`w-12 h-12 object-cover rounded-full cursor-pointer ${isDefaultImage ? "opacity-65 bg-blue-100" : ""
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
                                            {renderButton(user)}
                                        </div>
                                    );
                                })}

                                {/* 페이지네이션 */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-3 gap-2">
                                        <button
                                            disabled={page === 0}
                                            onClick={() => {
                                                setPage(page - 1);
                                                handleSearch(page - 1);
                                            }}
                                        >
                                            이전
                                        </button>
                                        <button
                                            disabled={page === totalPages - 1}
                                            onClick={() => {
                                                setPage(page + 1);
                                                handleSearch(page + 1);
                                            }}
                                        >
                                            다음
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center">
                                {renderEmptyState("검색 결과가 없습니다")}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {linkerResults.length > 0 ? (
                            <>
                                {linkerResults.map((linker) => (
                                    <div
                                        key={linker.linkerId}
                                        onClick={() =>
                                            navigate("/map", { state: { openLinkerId: linker.linkerId } })
                                        }
                                    >
                                        <LinkerCardItem linker={{ ...linker }} />
                                    </div>
                                ))}

                                {/* 더보기 버튼 (마지막 페이지가 아닐 때만 표시) */}
                                {linkerPage + 1 < linkerTotalPages && (
                                    <div className="flex justify-center mt-3">
                                        <button
                                            onClick={() => fetchLinkers(linkerPage + 1)}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                        >
                                            더보기
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center">
                                {renderEmptyState("링커 검색 결과가 없습니다")}
                            </div>
                        )}

                    </>
                )}
            </div>

        </div>
    );
}
