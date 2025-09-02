import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/map/MapContainer.tsx
import { useEffect, useRef, useState } from "react";
import MapWrapper from "./MapWrapper";
import { useKakaoLoader } from "@/hooks/useKakaoLoader";
import SpotModal from "@/components/spot/SpotModal";
import SpotCreateModal from "@/components/spot/SpotCreateModal";
export default function MapContainer({ apiKey = import.meta.env.VITE_KAKAO_MAP_KEY, defaultCenter = { lat: 37.5665, lng: 126.978 }, defaultLevel = 5, }) {
    const ready = useKakaoLoader(apiKey);
    const mapRef = useRef(null);
    const kakaoMap = useRef(null);
    const geocoder = useRef(null);
    const [spots, setSpots] = useState([]);
    const [selected, setSelected] = useState(null);
    const [draft, setDraft] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openSpot, setOpenSpot] = useState(false);
    useEffect(() => {
        if (!ready || !mapRef.current)
            return;
        const { kakao } = window;
        const center = new kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng);
        kakaoMap.current = new kakao.maps.Map(mapRef.current, { center, level: defaultLevel });
        geocoder.current = new kakao.maps.services.Geocoder();
        kakao.maps.event.addListener(kakaoMap.current, "click", (mouseEvent) => {
            const latlng = mouseEvent.latLng;
            const lat = latlng.getLat();
            const lng = latlng.getLng();
            reverseGeocode(lat, lng).then((address) => {
                setDraft({ lat, lng, address: address ?? "" });
                setOpenCreate(true);
            });
        });
    }, [ready, defaultCenter.lat, defaultCenter.lng, defaultLevel]);
    useEffect(() => {
        if (!ready || !kakaoMap.current)
            return;
        const { kakao } = window;
        // clear overlays: naive approach by recreating map overlays
        // draw markers
        spots.forEach((s) => {
            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(s.lat, s.lng),
                map: kakaoMap.current,
                clickable: true,
            });
            kakao.maps.event.addListener(marker, "click", () => {
                setSelected(s);
                setOpenSpot(true);
            });
        });
    }, [ready, spots]);
    const reverseGeocode = (lat, lng) => {
        return new Promise((resolve) => {
            if (!geocoder.current)
                return resolve(null);
            geocoder.current.coord2RegionCode(lng, lat, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                    resolve(result[0].address_name);
                }
                else {
                    resolve(null);
                }
            });
        });
    };
    const createSpot = (spot) => {
        setSpots((prev) => [{ ...spot, id: `${Date.now()}` }, ...prev]);
        setOpenCreate(false);
        setDraft(null);
    };
    const addPhoto = (data) => {
        if (!selected)
            return;
        setSpots((prev) => prev.map((s) => s.id === selected.id
            ? { ...s, photos: [...(s.photos ?? []), { url: data.url, caption: data.caption }] }
            : s));
    };
    const addMessage = (data) => {
        if (!selected)
            return;
        setSpots((prev) => prev.map((s) => s.id === selected.id
            ? {
                ...s,
                messages: [...(s.messages ?? []), { text: data.text, ts: new Date().toISOString() }],
            }
            : s));
    };
    return (_jsxs(MapWrapper, { children: [_jsx("div", { ref: mapRef, className: 'w-full h-full' }), _jsx(SpotCreateModal, { open: openCreate, draft: draft, onClose: () => setOpenCreate(false), onCreate: createSpot }), _jsx(SpotModal, { open: openSpot, spot: selected, onClose: () => setOpenSpot(false), onAddPhoto: addPhoto, onAddMessage: addMessage })] }));
}
