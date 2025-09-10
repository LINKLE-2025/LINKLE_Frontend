import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatInput({
  onSend,
  onHeightChange,
}: {
  onSend: (text: string) => void;
  onHeightChange?: (h: number) => void;
}) {
  const [text, setText] = useState("");
  const [footerBottom, setFooterBottom] = useState(0);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const footer = document.querySelector("footer");
      setFooterBottom(footer ? footer.clientHeight : 0);
      if (inputRef.current) onHeightChange?.(inputRef.current.clientHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setInterval(measure, 300);
    return () => {
      window.removeEventListener("resize", measure);
      clearInterval(t);
    };
  }, [onHeightChange]);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText("");
  };

  return (
    <div
      ref={inputRef}
      className='fixed left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-20'
      style={{ bottom: `calc(${footerBottom}px + env(safe-area-inset-bottom, 0px))` }}
    >
      <div className='w-full max-w-md mx-auto px-4 py-2'>
        <div className='flex items-center gap-2'>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder='채팅을 입력하세요'
            className='flex-1 rounded-2xl bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100'
          />
          <button
            onClick={send}
            className='p-2 rounded-full hover:bg-gray-100 transition'
            aria-label='send'
            type='button'
          >
            <Send size={20} className='text-gray-600' />
          </button>
        </div>
      </div>
    </div>
  );
}
