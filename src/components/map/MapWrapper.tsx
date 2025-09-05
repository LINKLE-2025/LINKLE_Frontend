// src/components/map/MapWrapper.tsx
import { useEffect, useState, type ReactNode } from "react";

interface MapWrapperProps {
  children: ReactNode;
}

export default function MapWrapper({ children }: MapWrapperProps) {
  const [vh, setVh] = useState<number>(typeof window !== "undefined" ? window.innerHeight : 800);

  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return <div className='w-full h-full relative overflow-hidden'>{children}</div>;
}
