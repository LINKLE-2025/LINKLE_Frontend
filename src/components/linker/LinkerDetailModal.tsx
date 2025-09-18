// src/components/modal/LinkerDetailModal.tsx
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { useNavigate, useOutletContext } from "react-router-dom";
import { participateLinker, checkParticipation } from "../../api/mapApi";
import { getCurrentUserId, refreshToken } from "@/api/authApi";
import ReactDOM from "react-dom";

import type { RoomResponseDTO } from "@/types/chat";
import ChatListItem2 from "@/components/chat/ChatListItem2";
import { getRoomsByLinker, joinRoom } from "@/api/chatApi";
import RoomPreviewModal from "@/components/modal/RoomPreviewModal";
import { extendLinkerCreatedDate, deductUserBalance } from "@/api/mapApi";
import { Button } from "@/components/ui/button"
import { withdrawBalance, getBalance } from "@/api/payApi";
import { Grid, Users, Crown } from "lucide-react";

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

  const [activeTab, setActiveTab] = useState<"posts" | "participation" | "state">("posts");

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

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [localDetail, setLocalDetail] = useState<LinkerDetail | null>(detail);
  const [insufficientBalance, setInsufficientBalance] = useState(false);




  useEffect(() => {
    setLocalDetail(detail); // detail이 바뀌면 동기화
  }, [detail]);


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

  const expireDate = localDetail?.createdDate
    ? dayjs(localDetail.createdDate).add(30, "day")
    : null;

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
      // 여기서 다시 joinRoom 호출하면 중복 송금됨!
      // if (r.roomType !== "DM") {
      //   await joinRoom(r.roomId);
      // }

      navigate(`/chat/room/${r.roomId}`, { state: { from: location.pathname } });
    } catch (e) {
      console.error(e);
      alert("방 참가에 실패했습니다.");
    }
  };

  // 모달에서 참여 누르기
  const handleEnterFromPreview = async () => {
    if (!previewRoom) return;

    console.log("handleEnterFromPreview", previewRoom);

    try {
      // 이미 참여중이라면 바로 입장만
      if (previewRoom.isMember) {
        await openRoom(previewRoom);
        closePreview();
        return;
      }

      // 처음 참여라면 joinRoom 실행
      const res = await joinRoom(previewRoom.roomId);

      if (res.balance !== undefined) {
        alert(`입장료가 차감되었습니다. 남은 잔액: ${res.balance.toLocaleString()}원`);
      }

      await openRoom(res.room);
      closePreview();
    } catch (err: any) {
      if (err.response?.status === 400 && err.response.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("방 입장 중 오류가 발생했습니다.");
      }
    }
  };

  // 참여 전에는 라이트/클래스 탭 컨텐츠 잠금
  const isLocked = !participating && !participationLoading;



  // 연장 버튼 클릭 시 잔액 체크
  const handleExtendClick = async () => {
    if (!localDetail?.linkerId) return;
    const userId = await getCurrentUserId();
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const userBalance = await getBalance(userId);
      if ((userBalance.balance ?? 0) < 5000) {
        // 잔액 부족
        setInsufficientBalance(true);
      } else {
        setInsufficientBalance(false);
      }
      setShowExtendModal(true);
    } catch (err: any) {
      console.error(err);
      alert("잔액 정보를 불러오지 못했습니다.");
    }
  };

  // 모달 확인 버튼
  const handleModalConfirm = async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (insufficientBalance) {
      // 잔액 부족 → 충전 페이지 이동
      navigate("/profile/account");
      setShowExtendModal(false);
    } else {
      // 잔액 충분 → 기존 연장 로직
      try {
        await withdrawBalance(userId, -5000, "링커 수명 연장"); // 5000원 차감
        await extendLinkerCreatedDate(localDetail!.linkerId);
        setLocalDetail(prev =>
          prev ? { ...prev, createdDate: new Date().toISOString() } : prev,
        );
        alert("링커가 연장되었습니다!");
        setShowExtendModal(false);
      } catch (err: any) {
        console.error(err);
        alert(err.message || "연장에 실패했습니다.");
      }
    }
  };
  // 탭 렌더링 함수
  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <>
            {postLoading && posts.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">불러오는 중…</div>
            ) : postError ? (
              <div className="p-6 text-center text-red-500 text-sm">{postError}</div>
            ) : posts.length === 0 ? (
              <div className="mt-4 flex justify-center opacity-50">
                <div className="max-w-[90%] rounded-2xl border border-gray-300 bg-white px-5 py-4 text-center text-[15px] md:text-base font-medium text-black shadow-md">
                  아직 포스트가 없어요!
                  <br />
                  이 장소의 사진을 공유해 보세요.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 overflow-auto" style={{ maxHeight: "37vh" }}>
                {posts.map((p) => (
                  <button
                    key={p.postId}
                    className="aspect-square bg-gray-100"
                    title={p.content ?? ""}
                    onClick={() => navigate(`/post/${p.postId}`, { state: { linker: detail, from: "/map" } })}
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full p-2 text-[11px] text-left line-clamp-2">
                        {p.content ?? "(이미지 없음)"}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        );
      case "participation":
        return (
          <div
            className={`space-y-2 ${isLocked ? "opacity-50 pointer-events-none select-none" : ""
              }`}
          >
            {filteredRooms.filter((r) => r.roomType === "LIGHT").length > 0 ? (
              filteredRooms
                .filter((r) => r.roomType === "LIGHT")
                .map((r) => (
                  <ChatListItem2
                    key={r.roomId}
                    title={r.roomName ?? "그룹 톡"}
                    memo={r.memo ?? r.description ?? ""}
                    memberCount={r.memberCount ?? undefined}
                    roomType={r.roomType}
                    startDate={r.startDate ?? undefined}
                    avatarUrl={`/api/chat/view/background/${r.roomId}`}
                    themeColor={r.themeColor as any}
                    onClick={() => openPreview(r)}
                  />
                ))
            ) : (
              !isLocked && (
                <div className="mt-4 flex justify-center opacity-50">
                  <div className="max-w-[90%] rounded-2xl border border-gray-300 bg-white px-5 py-4 text-center text-[15px] md:text-base font-medium text-black shadow-md">
                    그룹톡을 생성해보세요!
                    <br />
                    이 장소에 대한 의견을 나눠보세요.
                  </div>
                </div>
              )
            )}

            {isLocked && (
              <div className="mt-4 flex justify-center">
                <div className="max-w-[90%] rounded-2xl border border-gray-300 bg-white px-5 py-4 text-center text-[15px] md:text-base font-medium text-black shadow-md">
                  링커에 참여해 보세요!
                  <br />
                  참여 후 채팅방 입장/생성이 가능합니다.
                </div>
              </div>
            )}
          </div>
        );
      case "state":
        return (
          <div className={`space-y-2 ${isLocked ? "opacity-50 pointer-events-none select-none" : ""}`}>
            {filteredRooms.filter((r) => r.roomType === "CLASS").length > 0 ? (
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
                    onClick={() => openPreview(r)}
                  />
                ))
            ) : (
              !isLocked && (
                <div className="mt-4 flex justify-center opacity-50">
                  <div className="max-w-[90%] rounded-2xl border border-gray-300 bg-white px-5 py-4 text-center text-[15px] md:text-base font-medium text-black shadow-md">
                    링클톡을 생성해보세요!
                    <br />
                    참가비를 받고 소규모 모임을 운영해보세요.
                  </div>
                </div>
              )
            )}
            {isLocked && (
              <div className="mt-4 flex justify-center">
                <div className="max-w-[90%] rounded-2xl border border-gray-300 bg-white px-5 py-4 text-center text-[15px] md:text-base font-medium text-black shadow-md">
                  링커에 참여해 보세요!
                  <br />
                  참여 후 채팅방 입장/생성이 가능합니다.
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
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
                    <span
                      className="cursor-pointer text-blue-500"
                      onClick={handleExtendClick} // 기존 setShowExtendModal(true) → 잔액 체크
                    >
                      {expireDate ? expireDate.format("YYYY년 MM월 DD일") : ""} 만료 예정
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 탭 선택 */}
            <div className="bg-white border-b sticky top-0 z-10">
              <div className="flex">
                <button
                  className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === "posts" ? "border-gray-900" : "border-transparent"}`}
                  onClick={() => setActiveTab("posts")}
                >
                  <Grid className={`w-5 h-5 ${activeTab === "posts" ? "text-gray-900" : "text-gray-400"}`} />
                </button>
                <button
                  className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === "participation" ? "border-gray-900" : "border-transparent"}`}
                  onClick={() => setActiveTab("participation")}
                >
                  <Users className={`w-5 h-5 ${activeTab === "participation" ? "text-gray-900" : "text-gray-400"}`} />
                </button>
                <button
                  className={`flex-1 py-3 flex items-center justify-center border-b-2 ${activeTab === "state" ? "border-gray-900" : "border-transparent"}`}
                  onClick={() => setActiveTab("state")}
                >
                  <Crown className={`w-5 h-5 ${activeTab === "state" ? "text-gray-900" : "text-gray-400"}`} />
                </button>
              </div>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="px-1 pt-2 pb-6">{renderTabContent()}</div>


          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop style={{ bottom: footerHeight, zIndex: 1490, background: "transparent" }} />
      </Sheet>
      {/* 만료일 연장 모달 */}
      {showExtendModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[2147483647]">
            <div className="bg-white px-6 py-7 rounded-lg shadow-lg w-72 xxs:w-80 text-center">
              {insufficientBalance ? (
                <>
                  <p className="mb-2 xxs:text-lg">잔액이 부족합니다.</p>
                  <p className="mb-6 xxs:text-lg">충전하러 이동하시겠습니까?</p>
                </>
              ) : (
                <>
                  <p className="mb-4">링커를 30일 연장하시겠습니까?</p>
                  <p className="mb-4 pb-2">(5000원이 차감됩니다.)</p>
                </>
              )}
              <div className="flex justify-center w-full gap-6 px-3">
                <Button className="flex-1" onClick={handleModalConfirm}>예</Button>
                <Button className="flex-1" variant="outline" onClick={() => setShowExtendModal(false)}>
                  취소
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

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
