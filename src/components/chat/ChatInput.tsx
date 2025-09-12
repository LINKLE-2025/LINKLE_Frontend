// src/components/chat/ChatInput.tsx
import { ArrowRight, SendHorizontal, } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatInput({
  onSend,
  onHeightChange,
  footerHeightPx = 0,
}: {
  onSend: (text: string) => void;
  onHeightChange?: (h: number) => void;
  footerHeightPx?: number;
}) {
  const [text, setText] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // 자신의 실제 높이를 관찰해서 부모(ChatWindow)에 통지
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => onHeightChange?.(el.offsetHeight));
    ro.observe(el);
    onHeightChange?.(el.offsetHeight); // 초기 통지
    return () => ro.disconnect();
  }, [onHeightChange]);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText("");
  };

  return (
    <div
      ref={rootRef}
      className="fixed left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-20"
      style={{ bottom: `calc(${footerHeightPx}px + env(safe-area-inset-bottom, 0px))` }}
    >
      <div className="w-full max-w-md mx-auto px-4 py-2">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="채팅을 입력하세요"
            className="flex-1 rounded-2xl bg-gray-100 px-4 py-1.5 text-base focus:outline-none "
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
      </div>
    </div>
  );
}
