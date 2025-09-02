import { jsx as _jsx } from "react/jsx-runtime";
// src/components/map/MapWrapper.tsx
import { useEffect, useState } from "react";
export default function MapWrapper({ children }) {
    const [vh, setVh] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
    useEffect(() => {
        const handleResize = () => setVh(window.innerHeight);
        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
        };
    }, []);
    return (_jsx("div", { className: "w-full relative overflow-hidden", style: { height: vh }, children: children }));
}
