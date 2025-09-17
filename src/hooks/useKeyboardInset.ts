// src/hooks/useKeyboardInset.ts
import { useEffect, useState } from "react";

export function useKeyboardInset() {
  const [inset, setInset] = useState(0); // 키보드 높이(px)
  const [open, setOpen] = useState(false); // 키보드 열림 여부

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // 키보드 높이 = 레이아웃 뷰포트와 비주얼 뷰포트 차이
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setInset(kb);
      setOpen(kb > 0);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return { inset, open };
}
