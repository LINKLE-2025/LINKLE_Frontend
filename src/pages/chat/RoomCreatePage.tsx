// src/pages/chat/RoomCreatePage.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState, useEffect } from "react";
import { createGroupRoom } from "@/services/chat";
import type { RoomResponseDTO } from "@/types/chat";
import { Camera, Users, Crown, CircleDollarSign, X } from "lucide-react";

type LinkerDetail = { linkerId: number; name: string };
type RoomType = "LIGHT" | "CLASS";

// 색상은 id(1~6)로 식별. label/src/hex는 렌더링용 메타데이터
type ColorItem = { id: number; label: string; hex: string; src: string };

const COLORS: ColorItem[] = [
  { id: 1, label: "red", hex: "#F8A89F", src: "/icons/color/red.png" },
  { id: 2, label: "orange", hex: "#F6BF9E", src: "/icons/color/orange.png" },
  { id: 3, label: "yellow", hex: "#F6DE9E", src: "/icons/color/yellow.png" },
  { id: 4, label: "green", hex: "#9EF79E", src: "/icons/color/green.png" },
  { id: 5, label: "blue", hex: "#9FC6F8", src: "/icons/color/blue.png" },
  { id: 6, label: "purple", hex: "#B99EF7", src: "/icons/color/purple.png" },
];

export default function RoomCreatePage() {
  const navigate = useNavigate();
  const linker: LinkerDetail | null = (useLocation().state as any)?.linker ?? null;

  // themeColor는 숫자 id(1~6)
  const [themeColor, setThemeColor] = useState<number>(1);
  const [roomType, setRoomType] = useState<RoomType>("LIGHT");
  const [roomName, setRoomName] = useState("");
  const [memo, setMemo] = useState("");
  const [description, setDescription] = useState("");
  const [entryFee, setEntryFee] = useState<string>(""); // 문자열(콤마 포함)
  const [startDate, setStartDate] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 업로드 배경 이미지
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!bgFile) {
      setBgPreview(null);
      return;
    }
    const url = URL.createObjectURL(bgFile);
    setBgPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bgFile]);

  // 페이지 진입 시 혹시 남아있는 body 스크롤락을 해제
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = ""; // unlock
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const isClass = roomType === "CLASS";

  const canSubmit = useMemo(() => {
    if (!roomName.trim() || !memo.trim() || !description.trim()) return false;
    if (isClass) {
      const feeDigits = entryFee.replace(/[^0-9]/g, "");
      const feeNum = feeDigits === "" ? 0 : Number(feeDigits);
      if (!Number.isFinite(feeNum) || feeNum < 0) return false; // 0 허용
      if (!startDate) return false;
    }
    return true;
  }, [roomName, memo, description, isClass, entryFee, startDate]);

  async function submitCreate() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const payload: any = {
        roomType,
        roomName: roomName.trim(),
        description: description.trim(),
        memo: memo.trim(),
        themeColor, // 숫자(1~6) 그대로 전송
        linkerId: linker?.linkerId,
      };
      if (isClass) {
        const feeDigits = entryFee.replace(/[^0-9]/g, "");
        const feeNum = feeDigits === "" ? 0 : Number(feeDigits);
        payload.entryFee = Number.isFinite(feeNum) && feeNum >= 0 ? feeNum : 0;
        payload.startDate = new Date(startDate).toISOString().slice(0, 19);
      }

      // 파일이 있으면 멀티파트로, 없으면 JSON으로
      const created: RoomResponseDTO = await createGroupRoom(payload, bgFile ?? undefined);
      navigate(`/chat/room/${created.roomId}`, { replace: true });
    } catch (e: any) {
      alert(e?.message ?? "채팅방 생성 실패");
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  function hexToRgba(hex: string, alpha = 0.5) {
    const h = hex.replace("#", "");
    const bigint = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const inputBase =
    "w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 text-base placeholder:text-gray-400 shadow-inner border-0 focus:outline-none focus:ring-2 focus:ring-gray-300";
  const textareaBase =
    "w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 text-base placeholder:text-gray-400 shadow-inner border-0 focus:outline-none focus:ring-2 focus:ring-gray-300 min-h-32 resize-none";

  const activeColor = COLORS.find((c) => c.id === themeColor);

  return (
    // 부모가 overflow-hidden/h-screen이어도 독립 스크롤을 갖도록 고정 뷰포트 컨테이너로 래핑
    <div
      className={[
        "fixed left-0 right-0 bottom-0",
        "overflow-y-auto overscroll-contain",
        "[-webkit-overflow-scrolling:touch]",
        "bg-white",
        "top-[calc(var(--header-h,56px)+env(safe-area-inset-top))]",
      ].join(" ")}
      style={{ "--header-h": "50px" } as React.CSSProperties}          // 헤더 높이(필요시 수정)
    >
      <main
        className={[
          "w-full max-w-md mx-auto px-2 sm:px-0",
          "pb-[calc(env(safe-area-inset-bottom)+2rem)]",
          "min-h-[100dvh]",
        ].join(" ")}
      >
        {/* 프리뷰: 파일이 있으면 파일, 없으면 컬러 아이콘 */}
        <div className="mt-6 mx-auto w-1/2 aspect-square rounded-2xl flex items-center justify-center overflow-hidden relative">
          {bgPreview ? (
            <>
              <img
                src={bgPreview}
                alt="배경 미리보기"
                className="w-full h-full object-cover"
                draggable={false}
              />
              <button
                type="button"
                onClick={() => setBgFile(null)}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                aria-label="배경 제거"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : activeColor ? (
            <img
              src={activeColor.src}
              alt={activeColor.label}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : null}
        </div>

        {/* 팔레트 + 카메라 */}
        <div className="mt-5">
          <div className="text-xs text-gray-600 text-left mb-1">채팅방 테마 선택</div>
          <div className="flex items-center gap-3">
            {COLORS.map((c) => {
              const isActive = themeColor === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setThemeColor(c.id)}
                  aria-label={c.label}
                  className="group relative w-8 h-8 rounded-full border-2 bg-white transition"
                  style={
                    {
                      borderColor: c.hex,
                      ["--fill" as any]: isActive ? c.hex : "transparent",
                      ["--hover" as any]: hexToRgba(c.hex, 0.5),
                    } as React.CSSProperties
                  }
                >
                  <span
                    className={`absolute inset-[1.5px] rounded-full transition-colors duration-150 ${isActive
                      ? "bg-[var(--fill)]"
                      : "bg-transparent [@media(hover:hover)]:group-hover:bg-[var(--hover)]"
                      }`}
                  />
                </button>
              );
            })}

            {/* 업로드: 파일 선택 */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="ml-1 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white text-gray-700 hover:bg-gray-50"
              style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              aria-label="배경 이미지 업로드"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f) setBgFile(f);
              }}
            />
          </div>
        </div>

        {/* 입력값 */}
        <div className="mt-5 space-y-4">
          <div>
            <div className="text-xs text-gray-600 text-left mb-1">채팅방 이름</div>
            <input
              className={inputBase}
              placeholder="채팅방 이름"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs text-gray-600 text-left mb-1">태그를 입력해 주세요</div>
            <input
              className={inputBase}
              placeholder="#밥친구   #햄버거"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs text-gray-600 text-left mb-1">설명을 입력해 주세요</div>
            <textarea
              className={textareaBase}
              placeholder=""
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* 방 종류 */}
        <div className="mt-3">
          <div className="text-xs text-gray-600 text-left mb-1">채팅방 종류를 선택해 주세요</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRoomType("LIGHT")}
              className={[
                "h-12 w-full rounded-2xl border px-4",
                "flex items-center justify-center gap-3",
                "bg-white text-gray-900 shadow-sm",
                "hover:bg-gray-50",
                roomType === "LIGHT" ? "ring-1 ring-black" : "border-gray-300",
              ].join(" ")}
            >
              <Users className="w-5 h-5" />
              <span className="text-[15px] font-medium">그룹 톡</span>
            </button>

            <button
              type="button"
              onClick={() => setRoomType("CLASS")}
              className={[
                "h-12 w-full rounded-2xl border px-4",
                "flex items-center justify-center gap-3",
                "bg-white text-gray-900 shadow-sm",
                "hover:bg-gray-50",
                roomType === "CLASS" ? "ring-1 ring-black" : "border-gray-300",
              ].join(" ")}
            >
              <Crown className="w-5 h-5" />
              <span className="text-[15px] font-medium">링클 톡</span>
            </button>
          </div>
        </div>

        {/* CLASS 옵션 */}
        {isClass && (
          <div className="mt-5">
            <div className="text-xs text-gray-600 text-left mb-2">추가 옵션을 입력해 주세요</div>
            <div className="grid grid-cols-1 gap-3">

              {/* 참가비 */}
              <div className="w-full rounded-2xl border bg-white px-3 h-12 flex items-center gap-2 shadow-sm border-gray-300 flex-nowrap">
                <span className="inline-flex items-center h-8 rounded-xl bg-gray-100 px-3 font-semibold shrink-0 whitespace-nowrap">
                  참가비
                </span>
                <CircleDollarSign className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="5,000"
                  value={entryFee}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const digits = raw.replace(/[^0-9]/g, "");
                    if (digits === "") return setEntryFee("");
                    const formatted = Number(digits).toLocaleString("ko-KR");
                    setEntryFee(formatted);
                  }}
                  className="bg-transparent outline-none border-0 focus:ring-0 text-base flex-1 min-w-0" // ★ 핵심
                />
                <span className="text-gray-700 pr-1 shrink-0 whitespace-nowrap">원</span>
              </div>

              {/* 시작 일정 */}
              <label className="w-full rounded-2xl border bg-white px-3 h-12 flex items-center gap-2 shadow-sm border-gray-300 flex-nowrap">
                <span className="inline-flex items-center h-8 rounded-xl bg-gray-100 px-3 font-semibold shrink-0 whitespace-nowrap">
                  시작 일정
                </span>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent outline-none border-0 focus:ring-0 text-base flex-1 min-w-0" // 일관성 유지
                  min={new Date().toISOString().slice(0, 16)}
                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                />
              </label>

            </div>
          </div>
        )}


        {/* 액션 버튼 */}
        <section className="mt-6 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              className="py-3 rounded-2xl bg-black text-white disabled:opacity-50"
              onClick={() => setConfirmOpen(true)}
              disabled={!canSubmit || submitting}
            >
              생성하기
            </button>
            <button className="py-3 rounded-2xl bg-gray-100" onClick={() => navigate("/map", { state: { openLinkerId: linker?.linkerId } })}>
              취소하기
            </button>
          </div>
        </section>

        {/* 생성 확인 모달 */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-lg">
                <div className="text-center text-sm mb-4">채팅방을 생성하시겠습니까?</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={submitCreate}
                    className="py-2 rounded-lg bg-black text-white disabled:opacity-50"
                    disabled={submitting}
                  >
                    생성
                  </button>
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="py-2 rounded-lg bg-gray-100"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
