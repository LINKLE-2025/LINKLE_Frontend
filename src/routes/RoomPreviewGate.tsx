// src/routes/RoomPreviewGate.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoom, joinRoom } from "@/api/chatApi";
import type { RoomResponseDTO } from "@/types/chat";
import RoomPreviewModal from "@/components/modal/RoomPreviewModal";

/**
 * 프리뷰 전용 라우트
 * - 이미 멤버면 바로 방으로 보냄
 * - 미가입이면 RoomPreviewModal 표시 → "참가하기" 시 joinRoom 후 방으로 이동
 */
export default function RoomPreviewGate() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState<RoomResponseDTO | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let ignore = false;

        (async () => {
            const id = Number(roomId);
            if (!id || Number.isNaN(id)) {
                navigate("/chat", { replace: true });
                return;
            }

            try {
                const data: RoomResponseDTO = await getRoom(id);
                if (ignore) return;

                const isMember =
                    typeof (data as any)?.isMember === "boolean" ? (data as any).isMember : undefined;

                if (isMember === true) {
                    // 이미 멤버 → 프리뷰 생략하고 입장
                    navigate(`/chat/room/${id}`, { replace: true });
                    return;
                }

                // 미가입(또는 isMember를 안 주는 서버): 프리뷰 오픈
                setRoom(data);
                setOpen(true);
            } catch {
                navigate("/chat", { replace: true });
            }
        })();

        return () => {
            ignore = true;
        };
    }, [roomId, navigate]);

    const handleEnter = async () => {
        if (!room) return;
        try {
            await joinRoom((room as any).roomId ?? (room as any).id ?? Number(roomId));
            navigate(`/chat/room/${(room as any).roomId ?? (room as any).id ?? roomId}`, {
                replace: true,
            });
        } catch {
            // 실패 시 리스트로 복귀(원하면 토스트 추가)
            navigate("/chat", { replace: true });
        }
    };

    const handleClose = () => {
        setOpen(false);
        navigate("/chat", { replace: true });
    };

    if (!room) return null;

    return (
        <RoomPreviewModal
            room={room}
            isOpen={open}
            onClose={handleClose}
            onEnter={handleEnter}
        />
    );
}
