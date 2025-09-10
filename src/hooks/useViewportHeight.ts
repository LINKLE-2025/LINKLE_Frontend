// src/hooks/useViewportHeight.ts
import { useEffect } from "react";

export function useViewportHeight() {
  useEffect(() => {
    const setVh = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      // 1vh에 해당하는 px값
      document.documentElement.style.setProperty("--app-vh", `${h / 100}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    window.visualViewport?.addEventListener("resize", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
      window.visualViewport?.removeEventListener("resize", setVh);
    };
  }, []);
}
