// useViewportHeight.ts
import { useEffect } from "react";

export function useViewportHeight() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty("--app-vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);
}
