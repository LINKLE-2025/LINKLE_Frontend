import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoom, getRoomList } from "@/api/chatApi";
import type { RoomResponseDTO } from "@/types/chat";

/** 상단 경고 노출: 프로젝트에 토스트가 있으면 여기서 바꿔서 쓰세요 */
function warn(message: string) {
    // 1) shadcn/use-toast 같은 글로벌 토스트가 있다면:
    // (window as any).toast?.warning?.(message);
    // 2) 공용 이벤트로 AppLayout에서 받아 띄우는 방식도 가능:
    // window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "warning", message } }));
    // 3) 임시 fallback:
    // eslint-disable-next-line no-alert
    alert(message);
}

/** 주소창 직접 진입(새로고침/최초 로드/외부 유입)으로 보이면 true */
function isDirectEntry(): boolean {
    try {
        // Navigation Timing으로 하드 네비게이션 감지
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        const hard = nav && (nav.type === "navigate" || nav.type === "reload");
        const noHistory = window.history.length <= 1;

        // 동일 출처 리퍼러 여부
        const ref = document.referrer;
        let sameOriginRef = false;
        if (ref) {
            const refUrl = new URL(ref);
            sameOriginRef = refUrl.origin === window.location.origin;
        }

        // 하드 내비/최초 히스토리/외부 리퍼러 → 직접 진입으로 간주
        return !!(hard || noHistory || !sameOriginRef);
    } catch {
        // 보수적으로 처음 진입으로 간주
        return true;
    }
}

export default function RequireRoomAccess({ children }: { children: ReactNode }) {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [pass, setPass] = useState(false);

    useEffect(() => {
        let ignore = false;

        (async () => {
            const id = Number(roomId);
            if (!id || Number.isNaN(id)) {
                navigate("/chat", { replace: true });
                return;
            }

            try {
                // 1차: 방 단건 조회
                const room: RoomResponseDTO = await getRoom(id);
                if (ignore) return;

                const apiSaysMember =
                    typeof (room as any)?.isMember === "boolean" ? (room as any).isMember : undefined;

                if (apiSaysMember === true) {
                    setPass(true);
                    return;
                }

                if (apiSaysMember === false) {
                    // 미가입
                    if (isDirectEntry()) {
                        // ✅ 주소창 직진: 프리뷰 금지 + 경고 + 이전/대체 이동
                        warn("정상적인 경로가 아닙니다.");
                        if (window.history.length > 1) {
                            navigate(-1);
                        } else {
                            navigate("/chat", { replace: true });
                        }
                    } else {
                        // ✅ 내부 진입: 프리뷰 라우트로
                        navigate(`/chat/preview/${id}`, { replace: true });
                    }
                    return;
                }

                // 2차: isMember를 안 내려주는 서버 대비 → 목록에 있는지 확인
                try {
                    const list: RoomResponseDTO[] = await getRoomList();
                    const has = Array.isArray(list) && list.some((r) => String((r as any).roomId) === String(id));
                    if (has) {
                        setPass(true);
                        return;
                    }

                    // 목록에도 없음 = 미가입
                    if (isDirectEntry()) {
                        warn("정상적인 경로가 아닙니다.");
                        if (window.history.length > 1) navigate(-1);
                        else navigate("/chat", { replace: true });
                    } else {
                        navigate(`/chat/preview/${id}`, { replace: true });
                    }
                } catch {
                    // 목록 조회 실패 시: 보수적으로 직접 진입 처리
                    warn("정상적인 경로가 아닙니다.");
                    if (window.history.length > 1) navigate(-1);
                    else navigate("/chat", { replace: true });
                }
            } catch {
                // 404/403 등 → 리스트로
                if (isDirectEntry()) {
                    warn("정상적인 경로가 아닙니다.");
                    if (window.history.length > 1) navigate(-1);
                    else navigate("/chat", { replace: true });
                } else {
                    navigate("/chat", { replace: true });
                }
            }
        })();

        return () => {
            ignore = true;
        };
    }, [roomId, navigate]);

    if (!pass) return null;
    return <>{children}</>;
}
