// src/components/chat/RoomMemoModal.tsx
import React from "react";
import ReactDOM from "react-dom";
import dayjs from "dayjs";
import { Users, Calendar, Wallet } from "lucide-react";
import type { RoomResponseDTO } from "@/types/chat";

type Props = {
    room: RoomResponseDTO | null;
    isOpen: boolean;
    onClose: () => void;
};

const COLOR_ICON_NAME: Record<number, string> = {
    1: "red.png",
    2: "orange.png",
    3: "yellow.png",
    4: "green.png",
    5: "blue.png",
    6: "purple.png",
};

export default function RoomMemoModal({ room, isOpen, onClose }: Props) {
    if (!isOpen || !room) return null;

    const isClass = room.roomType === "CLASS";
    const title = room.roomName ?? (isClass ? "링클 톡" : "그룹 톡");
    const description = room.description ?? "";
    const memo = room.memo ?? "";
    const memberCount = room.memberCount ?? 0;

    const colorIconName = room.themeColor ? COLOR_ICON_NAME[Number(room.themeColor)] : undefined;
    const heroUrl = colorIconName
        ? `/icons/color/${colorIconName}`
        : `/api/chat/view/background/${room.roomId}`;

    const entryFee = room.entryFee ?? 0;
    const feeText = entryFee === 0 ? "무료" : `${entryFee.toLocaleString()}원`;
    const startDate =
        room.startDate && dayjs(room.startDate).isValid()
            ? dayjs(room.startDate).format("YYYY.MM.DD")
            : null;

    const Z_MAX = 2147483647;
    const Z_BACKDROP = Z_MAX - 1;

    return ReactDOM.createPortal(
        <>
            {/* 어두운 배경 */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    zIndex: Z_BACKDROP,
                }}
                onClick={onClose}
            />

            {/* 중앙 카드 */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: Z_MAX,
                    pointerEvents: "none",
                }}
                role="dialog"
                aria-modal
            >
                <div
                    className="w-[320px] max-w-[92vw] overflow-hidden rounded-2xl bg-white shadow-2xl"
                    style={{ pointerEvents: "auto" }}
                >
                    {/* 대표 이미지 */}
                    <div className="relative aspect-[4/3] w-full bg-gray-100 border-2 border-gray-200">
                        <img
                            src={heroUrl}
                            alt=""
                            className="h-full w-full object-cover border border-gray-200 rounded-t-2xl"
                        />
                    </div>

                    {/* 본문 */}
                    <div className="p-4">
                        <div className="mb-1 flex items-center justify-between">
                            <h3 className="text-xl font-bold leading-snug">{title}</h3>
                            {isClass && (
                                <span className="ml-2 rounded bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
                                    class
                                </span>
                            )}
                        </div>

                        <div className="my-2 h-px w-full bg-gray-200" />

                        {description && (
                            <p className="mb-1 text-sm font-semibold text-gray-800 whitespace-pre-wrap">
                                {description}
                            </p>
                        )}

                        {memo && (
                            <p className="mb-3 text-sm text-gray-400 whitespace-pre-wrap">{memo}</p>
                        )}

                        <div className="space-y-1 text-sm text-gray-800">
                            <div className="flex items-center gap-1.5">
                                <Users size={16} className="text-gray-700" />
                                {memberCount}명 참여중
                            </div>
                            {isClass && (
                                <>
                                    {startDate && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={16} className="text-gray-800" />
                                            시작일 {startDate}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Wallet size={16} className="text-gray-800" />
                                        참가비 {feeText}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* 버튼 (돌아가기만 표시) */}
                        <div className="mt-4">
                            <button
                                onClick={onClose}
                                className="w-full rounded-full border border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-300"
                            >
                                돌아가기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
