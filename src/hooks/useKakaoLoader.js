// src/hooks/useKakaoLoader.ts
import { useEffect, useRef, useState } from "react";
export function useKakaoLoader(key) {
    const [ready, setReady] = useState(false);
    const bootedRef = useRef(false);
    useEffect(() => {
        if (!key)
            return;
        if (bootedRef.current)
            return;
        bootedRef.current = true;
        // already loaded
        if (typeof window !== "undefined" && window.kakao?.maps) {
            setReady(true);
            return;
        }
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services,clusterer`;
        script.onload = () => {
            window.kakao.maps.load(() => setReady(true));
        };
        document.head.appendChild(script);
    }, [key]);
    return ready;
}
