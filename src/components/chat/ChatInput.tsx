// src/components/chat/ChatInput.tsx
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";

export default function ChatInput({
  onSend,
  onHeightChange,
  footerHeightPx = 0,
  disabled = false,
  disabledMessage = "탈퇴한 사용자입니다",
}: {
  onSend: (text: string) => void;
  onHeightChange?: (h: number) => void;
  footerHeightPx?: number;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const [text, setText] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const { inset: keyboardInset } = useKeyboardInset();

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => onHeightChange?.(el.offsetHeight));
    ro.observe(el);
    onHeightChange?.(el.offsetHeight);
    return () => ro.disconnect();
  }, [onHeightChange]);

  const send = () => {
    if (disabled) return;
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText("");
  };

  // 푸터 높이 + 키보드 높이만큼만 ChatInput을 올림 (푸터는 건드리지 않음)
  const bottomPx = keyboardInset > 0
    ? keyboardInset // 키보드 열렸을 땐, 푸터 높이는 제외
    : footerHeightPx; // 닫혔을 땐 푸터 높이만

  return (
    <div
      ref={rootRef}
      className="fixed left-0 right-0 bg-white border-t 
               border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-20"
    >
      <div className="w-full max-w-xl mx-auto px-5 py-2">
        {
          disabled ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-2xl bg-gray-100 px-4 py-1.5 text-base text-gray-500">
                {disabledMessage}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="채팅을 입력하세요"
                className="flex-1 rounded-2xl bg-gray-100 px-4 py-1.5 text-base focus:outline-none"
              />
              <button
                onClick={send}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                aria-label="send"
                type="button"
              >
                <ArrowRight size={20} className="text-linkleGray" />
              </button>
            </div>
          )
        }
      </div >
    </div >
  );
}
