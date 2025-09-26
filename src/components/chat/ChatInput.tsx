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
  onHeightChange?: (h: number) => void; // 부모는 이 값을 채팅 리스트의 bottom padding/margin으로 사용
  footerHeightPx?: number;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const [text, setText] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { inset: keyboardInset } = useKeyboardInset();

  // 푸터 높이 + 키보드 높이만큼 ChatInput을 올림 (푸터는 건드리지 않음)
  const bottomPx = keyboardInset > 0 ? keyboardInset : footerHeightPx;

  // 높이(입력바 실제 높이) + bottomPx(키보드/푸터)에 맞춰 부모에 알려 채팅 리스트가 겹치지 않게 함
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const report = () => {
      const occupied = el.offsetHeight + bottomPx;
      onHeightChange?.(occupied);
    };

    const ro = new ResizeObserver(report);
    ro.observe(el);
    report(); // 초기 1회

    return () => ro.disconnect();
  }, [onHeightChange, bottomPx]);

  const doSend = () => {
    if (disabled) return;
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText("");
    // iOS에서 키보드 유지: 버튼 탭으로 인한 blur 방지 + 전송 후 다시 포커스
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      doSend();
    }
  };

  return (
    <div
      ref={rootRef}
      className="fixed left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-20"
      style={{ bottom: bottomPx }}
    >
      <div className="w-full max-w-xl mx-auto px-5 py-2 xs:py-3.5 ">
        {disabled ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-2xl bg-gray-100 px-4 py-1.5 text-base text-gray-500">
              {disabledMessage}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 xs:gap-2.5">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="채팅을 입력하세요"
              className="flex-1 rounded-2xl bg-gray-100 px-4 py-1.5 xs:px-5 xs:py-3 text-base focus:outline-none"
              enterKeyHint="send"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
            />
            <button
              // iOS에서 버튼 탭 시 input blur를 유발하는 포커스 전환을 차단
              onPointerDown={(e) => e.preventDefault()}
              onClick={doSend}
              className="p-1.5 xs:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              aria-label="send"
              type="button"
            >
              <ArrowRight className="text-linkleGray w-5 h-5 xs:w-6 xs:h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
