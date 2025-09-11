import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { useNavigate, useOutletContext } from "react-router-dom";
import { participateLinker, checkParticipation } from "../../api/mapApi";
import { getCurrentUserId, refreshToken } from "@/api/authApi";

import type { RoomResponseDTO } from "@/types/chat";
import ChatListItem2 from "@/components/chat/ChatListItem2";
import { getRoomsByLinker, joinRoom } from "@/api/chatApi";
import RoomPreviewModal from "@/components/modal/RoomPreviewModal";

export type LinkerDetail = {
  linkerId: number;
  name: string;
  address?: string;
  addressName?: string;
  categoryId?: number | null;
  locationX?: number | null;
  locationY?: number | null;
  memo?: string | null;
  createdDate?: string;
  phone?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  detail: LinkerDetail | null;
  loading: boolean;
  error: string | null;
};

type LinkerPost = {
  postId: number;
  imageUrl?: string | null;
  content?: string | null;
  createdDate?: string;
  author?: { name?: string; handle?: string; avatarUrl?: string | null } | null;
};

export default function LinkerDetailModal({ open, onClose, detail, loading, error }: Props) {
  const navigate = useNavigate();
  const { footerHeight } = useOutletContext<{ headerHeight: number; footerHeight: number }>();

  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"post" | "light" | "class">("post");

  const [posts, setPosts] = useState<LinkerPost[]>([]);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const [participating, setParticipating] = useState(false);
  const [participationLoading, setParticipationLoading] = useState(false);

  const [rooms, setRooms] = useState<RoomResponseDTO[]>([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  const [previewRoom, setPreviewRoom] = useState<RoomResponseDTO | null>(null);
  const openPreview = (r: RoomResponseDTO) => setPreviewRoom(r);
  const closePreview = () => setPreviewRoom(null);

  // 현재 로그인 유저
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await getCurrentUserId();
        setLoggedInUserId(userId);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          try {
            await refreshToken();
            const userId = await getCurrentUserId();
            setLoggedInUserId(userId);
          } catch (refreshErr) {
            console.error("토큰 리프레시 실패:", refreshErr);
          }
        } else {
          console.error("유저 정보 불러오기 실패:", err);
        }
      } finally {
        setIsAuthLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 포스트 불러오기
  const fetchPosts = async (linkerId: number) => {
    setPostLoading(true);
    setPostError(null);
    try {
      const res = await fetch(`/api/post?linkerId=${linkerId}`, { credentials: "include" });
      if (!res.ok) throw new Error(`포스트 조회 실패 (${res.status})`);
      const raw: any[] = await res.json();
      const postImageUrl = (postId: number) => `/api/post/${postId}/image`;

      raw.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

      setPosts(
        raw.map((p) => ({
          postId: p.postId,
          imageUrl: p.image ? postImageUrl(p.postId) : null,
          content: p.memo ?? null,
          createdDate: p.createdDate ?? undefined,
          author: null,
        })),
      );
    } catch (e: any) {
      setPostError(e?.message ?? String(e));
    } finally {
      setPostLoading(false);
    }
  };

  // 방 목록 불러오기
  useEffect(() => {
    if (!open || !detail?.linkerId) return;
    fetchPosts(detail.linkerId);

    (async () => {
      setRoomLoading(true);
      setRoomError(null);
      try {
        const list = await getRoomsByLinker(detail.linkerId);
        setRooms(list ?? []);
      } catch (e: any) {
        setRoomError(e?.message ?? String(e));
      } finally {
        setRoomLoading(false);
      }
    })();
  }, [open, detail?.linkerId]);

  // 참여 여부 체크
  const fetchParticipation = async () => {
    if (!loggedInUserId || !detail) return;
    try {
      setParticipationLoading(true);
      const res = await checkParticipation(detail.linkerId, loggedInUserId);
      setParticipating(res);
    } catch (err) {
      console.error("참여 여부 조회 실패:", err);
      setParticipating(false);
    } finally {
      setParticipationLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !detail?.linkerId || !loggedInUserId) return;
    fetchParticipation();
  }, [open, detail?.linkerId, loggedInUserId]);

  // 참여하기
  const handleParticipate = async () => {
    if (!detail?.linkerId || !loggedInUserId) return;
    try {
      setParticipationLoading(true);
      await participateLinker(detail.linkerId, loggedInUserId);
      setParticipating(true);
    } catch (err) {
      console.error("참여 실패:", err);
      alert("참여 실패. 다시 시도해주세요.");
    } finally {
      setParticipationLoading(false);
    }
  };

  const CreatePost = () => {
    if (!detail) return;
    navigate(`/post?linkerId=${detail.linkerId}`, { state: { linker: detail } });
  };

  const CreateChatRoom = () => {
    if (!detail) return;
    navigate("/chat/room/create", { state: { linker: detail } });
  };

  const expireDate = detail?.createdDate ? dayjs(detail.createdDate).add(30, "day") : null;

  // 해당 링커의 방만 (filteredRooms)
  const filteredRooms = useMemo(
    () =>
      Array.isArray(rooms) && detail?.linkerId != null
        ? rooms.filter((r: any) => (r?.linkerId ?? null) === detail.linkerId)
        : [],
    [rooms, detail?.linkerId],
  );

  // 실제 입장 (모달의 '참여' 버튼에서 호출)
  const openRoom = async (r: RoomResponseDTO) => {
    try {
      if (r.roomType !== "DM") {
        await joinRoom(r.roomId);
      }
      navigate(`/chat/room/${r.roomId}`);
    } catch (e) {
      console.error(e);
      alert("방 참가에 실패했습니다.");
    }
  };

  // 모달에서 참여 누르기
  const handleEnterFromPreview = async () => {
    if (!previewRoom) return;
    await openRoom(previewRoom);
    closePreview();
  };

  return (
    <>
      <Sheet
        isOpen={open}
        onClose={onClose}
        snapPoints={[0.65, 0.5, 0.4]}
        initialSnap={0}
        style={{ bottom: footerHeight }}
      >
        <Sheet.Container style={{ zIndex: 1500, boxShadow: "none" }}>
          <Sheet.Header>
            <div className="mx-auto my-2 h-1.5 w-12 rounded-full bg-gray-300" />
          </Sheet.Header>

          <Sheet.Content style={{ paddingBottom: 12 }}>
            {/* 상단 정보 */}
            <div className="px-4 pb-2">
              {loading ? (
                <p className="text-gray-500">불러오는 중…</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold truncate">{detail?.name ?? "-"}</h2>
                      <p className="mt-0.5 text-sm text-gray-500 truncate">{detail?.address ?? "-"}</p>
                      <p className="mt-0.5 text-sm text-gray-500 truncate">{detail?.addressName ?? "-"}</p>
                    </div>

                    <div className="ml-3 flex shrink-0 gap-2">
                      {participationLoading ? (
                        <button className="h-10 w-24 rounded-full bg-gray-200 text-sm text-gray-500">로딩 중…</button>
                      ) : !participating ? (
                        <button
                          className="h-10 w-28 rounded-full bg-white text-gray-500 font-semibold border border-yellow-400 shadow-sm hover:bg-yellow-50 active:bg-yellow-100 transition-colors duration-200 flex items-center justify-center gap-2"
                          onClick={handleParticipate}
                        >
                          참여
                        </button>
                      ) : (
                        <>
                          <button
                            className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center"
                            title="포스트작성"
                            onClick={CreatePost}
                          >
                            <img src="/icons/mapicon/photo.png" alt="" />
                          </button>
                          <button
                            className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center"
                            title="채팅방생성"
                            onClick={CreateChatRoom}
                          >
                            <img src="/icons/mapicon/chat.png" alt="" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex gap-4">
                      <span>{rooms.length} 채팅방</span>
                      <span>{posts.length} 포스트</span>
                    </div>
                    <span>{expireDate ? expireDate.format("YYYY년 MM월 DD일") : ""} 만료 예정</span>
                  </div>
                </>
              )}
            </div>
            {/* 탭 */}
            <div className="mt-2 border-b">
              <div className="flex items-center justify-around text-sm">
                <button
                  className={activeTab === "post" ? "relative py-2 font-semibold" : "py-2 text-gray-400"}
                  onClick={() => setActiveTab("post")}
                  type="button"
                >
                  <img src="/icons/mapicon/Vector.png" alt="" />
                  {activeTab === "post" && <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-black" />}
                </button>
                <button
                  className={activeTab === "light" ? "relative py-2 font-semibold" : "py-2 text-gray-400"}
                  onClick={() => setActiveTab("light")}
                  type="button"
                >
                  <img src="/icons/mapicon/User Account.png" alt="" />
                  {activeTab === "light" && <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-black" />}
                </button>
                <button
                  className={activeTab === "class" ? "relative py-2 font-semibold" : "py-2 text-gray-400"}
                  onClick={() => setActiveTab("class")}
                  type="button"
                >
                  <img src="/icons/mapicon/lucide_crown.png" alt="" />
                  {activeTab === "class" && <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-black" />}
                </button>
              </div>
            </div>

            {/* 포스트 그리드 / 채팅 리스트 (탭에 따라 분기) */}
            <div className="px-1 pt-2 pb-6">
              {/* 포스트 탭 */}
              {activeTab === "post" &&
                (postLoading && posts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">불러오는 중…</div>
                ) : postError ? (
                  <div className="p-6 text-center text-red-500 text-sm">{postError}</div>
                ) : posts.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">아직 등록된 포스트가 없어요.</div>
                ) : (
                  <div
                    className="grid grid-cols-3 gap-1 overflow-auto"
                    style={{ maxHeight: "190px" }} // 또는 px 단위로 고정 높이
                  >
                    {posts.map((p) => (
                      <button
                        key={p.postId}
                        className="aspect-square bg-gray-100"
                        title={p.content ?? ""}
                        onClick={() => navigate(`/post/${p.postId}`, { state: { linker: detail } })}
                      >
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full p-2 text-[11px] text-left line-clamp-2">{p.content ?? "(이미지 없음)"}</div>
                        )}
                      </button>
                    ))}
                  </div>
                ))}

              {/* 그룹채팅 (LIGHT) */}
              {activeTab === "light" &&
                (roomLoading ? (
                  <div className="p-6 text-center text-gray-500 text-sm">채팅방 불러오는 중…</div>
                ) : roomError ? (
                  <div className="p-6 text-center text-red-500 text-sm">{roomError}</div>
                ) : filteredRooms.filter((r) => r.roomType === "LIGHT").length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">아직 생성된 그룹 채팅방이 없어요.</div>
                ) : (
                  filteredRooms
                    .filter((r) => r.roomType === "LIGHT")
                    .map((r) => (
                      <ChatListItem2
                        key={r.roomId}
                        title={r.roomName ?? "그룹 채팅"}
                        memo={r.memo ?? r.description ?? ""}
                        memberCount={r.memberCount ?? undefined}
                        roomType={r.roomType}
                        startDate={r.startDate ?? undefined}
                        avatarUrl={`/api/chat/view/background/${r.roomId}`}
                        themeColor={r.themeColor as any}
                        onClick={() => openPreview(r)}
                      />
                    ))
                ))}

              {/* 클래스채팅 (CLASS) */}
              {activeTab === "class" &&
                (roomLoading ? (
                  <div className="p-6 text-center text-gray-500 text-sm">채팅방 불러오는 중…</div>
                ) : roomError ? (
                  <div className="p-6 text-center text-red-500 text-sm">{roomError}</div>
                ) : filteredRooms.filter((r) => r.roomType === "CLASS").length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">아직 생성된 클래스톡이 없어요.</div>
                ) : (
                  filteredRooms
                    .filter((r) => r.roomType === "CLASS")
                    .map((r) => (
                      <ChatListItem2
                        key={r.roomId}
                        title={r.roomName ?? "클래스 채팅"}
                        memo={r.memo ?? r.description ?? ""}
                        memberCount={r.memberCount ?? undefined}
                        roomType={r.roomType}
                        startDate={r.startDate ?? undefined}
                        avatarUrl={`/api/chat/view/background/${r.roomId}`}
                        themeColor={r.themeColor as any}
                        onClick={() => openPreview(r)} // 
                      />
                    ))
                ))}
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop style={{ bottom: footerHeight, zIndex: 1490, background: "transparent" }} />
      </Sheet>

      {/* 방 미리보기 모달 */}
      <RoomPreviewModal
        room={previewRoom}
        isOpen={!!previewRoom}
        onClose={closePreview}
        onEnter={handleEnterFromPreview}
      />
    </>
  );
}
