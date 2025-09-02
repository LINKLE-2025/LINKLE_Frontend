import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/MapPage.tsx
import { useState, useEffect, useMemo, useRef } from "react";
import CircleButton from "../components/ui/CircleButton";
import { load, save } from "../utils/storage";
import { spotIdFromLatLng, nowIso } from "../utils/spot";
import SearchPanel from "../components/search/SearchPanel";
import MapWrapper from "../components/map/MapWrapper";
import LinkerCreateModal from "../components/linker/LinkerCreateModal";
import { Sheet } from "react-modal-sheet";
const STORAGE_KEY = "linkle_spots_v2";
export default function MapPage() {
    // spots 저장
    const [spots, setSpots] = useState(() => load(STORAGE_KEY, {}));
    const [activeId, setActiveId] = useState(null);
    const [createDraft, setCreateDraft] = useState(null);
    // 검색 관련
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    // ref들
    const mapRef = useRef(null);
    const kakaoMapRef = useRef(null);
    const searchMarkers = useRef([]);
    const draftMarkerRef = useRef(null);
    const linkerMarkersRef = useRef([]);
    // 모달 관련
    const [linkerOpen, setLinkerOpen] = useState(false);
    const [linkerInitial, setLinkerInitial] = useState(null);
    // 검색 input ref
    const inputRef = useRef(null);
    // 서버 저장
    const handleSaveLinker = async (payload) => {
        try {
            const res = await fetch("/api/linker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok)
                throw new Error("POST /api/linker 실패");
            if (kakaoMapRef.current) {
                await loadExistingLinkers(kakaoMapRef.current);
            }
        }
        catch (e) {
            console.error(e);
            alert("저장에 실패했습니다.");
        }
        finally {
            setLinkerOpen(false);
            setLinkerInitial(null);
            if (draftMarkerRef.current) {
                draftMarkerRef.current.setMap(null);
                draftMarkerRef.current = null;
            }
        }
    };
    // 기존 링커 불러오기
    const loadExistingLinkers = async (map) => {
        try {
            const res = await fetch("/api/linker");
            if (!res.ok)
                throw new Error("GET /api/linker 실패");
            const items = await res.json();
            linkerMarkersRef.current.forEach((m) => m.setMap(null));
            linkerMarkersRef.current = [];
            const kakao = window.kakao;
            items.forEach((m) => {
                const lat = m.locationX ?? m.lat;
                const lng = m.locationY ?? m.lng;
                if (typeof lat !== "number" || typeof lng !== "number")
                    return;
                const marker = new kakao.maps.Marker({
                    map,
                    title: m.name,
                    position: new kakao.maps.LatLng(lat, lng),
                });
                linkerMarkersRef.current.push(marker);
            });
        }
        catch (e) {
            console.error(e);
        }
    };
    // spots → markers 변환
    const markers = useMemo(() => Object.entries(spots).map(([spotId, s]) => ({
        spotId,
        lat: s.lat,
        lng: s.lng,
        alias: s.alias,
        category: s.category,
    })), [spots]);
    // Kakao Map 로드
    useEffect(() => {
        if (document.getElementById("kakao-map-script"))
            return;
        const script = document.createElement("script");
        script.id = "kakao-map-script";
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY ?? "YOUR_KEY"}&autoload=false&libraries=services`;
        script.async = true;
        document.head.appendChild(script);
        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = mapRef.current;
                let lat = 37.5665;
                let lng = 126.978;
                const initMap = (latitude, longitude) => {
                    const options = {
                        center: new window.kakao.maps.LatLng(latitude, longitude),
                        level: 3,
                    };
                    const map = new window.kakao.maps.Map(container, options);
                    kakaoMapRef.current = map;
                    loadExistingLinkers(map);
                    // 지도 클릭 이벤트(모달 띄우기)
                    const handleMapClick = (mouseEvent) => {
                        console.log("지도 클릭 시 이벤트");
                        const latlng = mouseEvent.latLng;
                        const geocoder = new window.kakao.maps.services.Geocoder();
                        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
                            const base = { lat: latlng.getLat(), lng: latlng.getLng() };
                            if (status === window.kakao.maps.services.Status.OK) {
                                const road = result?.[0]?.road_address?.address_name;
                                const jibun = result?.[0]?.address?.address_name;
                                const address = road || jibun || "";
                                setLinkerInitial({ ...base, address });
                            }
                            else {
                                setLinkerInitial({ ...base, address: "" });
                            }
                            setLinkerOpen(true);
                        });
                        if (draftMarkerRef.current) {
                            draftMarkerRef.current.setMap(null);
                            draftMarkerRef.current = null;
                        }
                        draftMarkerRef.current = new window.kakao.maps.Marker({
                            position: latlng,
                            map,
                        });
                        setCreateDraft({ lat: latlng.getLat(), lng: latlng.getLng() });
                    };
                    window.kakao.maps.event.addListener(map, "click", handleMapClick);
                    // 내 위치 마커
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                            const myLat = pos.coords.latitude;
                            const myLng = pos.coords.longitude;
                            const myLocationImage = new window.kakao.maps.MarkerImage("/icons/user_location2.png", new window.kakao.maps.Size(20, 20), { offset: new window.kakao.maps.Point(10, 10) });
                            new window.kakao.maps.Marker({
                                position: new window.kakao.maps.LatLng(myLat, myLng),
                                image: myLocationImage,
                                map: kakaoMapRef.current,
                            });
                            new window.kakao.maps.Circle({
                                center: new window.kakao.maps.LatLng(myLat, myLng),
                                radius: 8,
                                strokeWeight: 2,
                                strokeColor: "#007AFF",
                                strokeOpacity: 0.5,
                                strokeStyle: "solid",
                                fillColor: "#007AFF",
                                fillOpacity: 0.1,
                                map,
                            });
                        });
                    }
                };
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        lat = position.coords.latitude;
                        lng = position.coords.longitude;
                        initMap(lat, lng);
                    }, () => initMap(lat, lng));
                }
                else {
                    initMap(lat, lng);
                }
            });
        };
    }, []);
    // spot markers 렌더링
    useEffect(() => {
        if (!kakaoMapRef.current || !window.kakao?.maps)
            return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (kakaoMapRef.current.spotMarkers) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            kakaoMapRef.current.spotMarkers.forEach((m) => m.setMap(null));
        }
        const newMarkers = markers.map((m) => {
            const marker = new window.kakao.maps.Marker({
                map: kakaoMapRef.current,
                position: new window.kakao.maps.LatLng(m.lat, m.lng),
            });
            window.kakao.maps.event.addListener(marker, "click", () => setActiveId(m.spotId));
            return marker;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        kakaoMapRef.current.spotMarkers = newMarkers;
    }, [markers]);
    // 검색 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const handleSearch = (page = 1) => {
        if (!kakaoMapRef.current || !searchQuery || !window.kakao?.maps?.services)
            return;
        const ps = new window.kakao.maps.services.Places();
        const center = kakaoMapRef.current.getCenter();
        const options = { location: center, radius: 2000, page };
        ps.keywordSearch(searchQuery, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data, status, pagination) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setSearchResults((prev) => page === 1
                    ? data.map((d) => ({
                        name: d.place_name,
                        address: d.address_name,
                        lat: parseFloat(d.y),
                        lng: parseFloat(d.x),
                    }))
                    : [
                        ...prev,
                        ...data.map((d) => ({
                            name: d.place_name,
                            address: d.address_name,
                            lat: parseFloat(d.y),
                            lng: parseFloat(d.x),
                        })),
                    ]);
                if (page === 1) {
                    searchMarkers.current.forEach((m) => m.setMap(null));
                    searchMarkers.current = [];
                }
                const newMarkers = data.map((d) => {
                    const marker = new window.kakao.maps.Marker({
                        map: kakaoMapRef.current,
                        position: new window.kakao.maps.LatLng(d.y, d.x),
                    });
                    window.kakao.maps.event.addListener(marker, "click", () => {
                        handleResultClick({
                            name: d.place_name,
                            address: d.address_name,
                            lat: parseFloat(d.y),
                            lng: parseFloat(d.x),
                        });
                    });
                    return marker;
                });
                searchMarkers.current.push(...newMarkers);
                setCurrentPage(page);
                setHasNextPage(pagination.last > page);
            }
            else {
                if (page === 1)
                    setSearchResults([]);
                setHasNextPage(false);
            }
        }, options);
    };
    const handleResultClick = (item) => {
        if (!kakaoMapRef.current)
            return;
        kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(item.lat, item.lng));
        setSearchOpen(false);
    };
    // 검색 결과 버튼 클릭용 모달 열기
    const handleSearchResultClick = (result) => {
        const lat = result.lat;
        const lng = result.lng;
        const address = result.address || "";
        const addressName = result.name || "";
        setLinkerInitial({ lat, lng, address });
        setLinkerOpen(true);
        // 기존 임시 마커 제거
        if (draftMarkerRef.current && kakaoMapRef.current) {
            draftMarkerRef.current.setMap(null);
            draftMarkerRef.current = null;
        }
        // 지도에 마커 추가
        if (kakaoMapRef.current) {
            draftMarkerRef.current = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(lat, lng),
                map: kakaoMapRef.current,
            });
        }
        setCreateDraft({ lat, lng });
    };
    //뭐지이건
    const saveNewSpot = ({ alias, category }) => {
        if (!createDraft)
            return;
        const { lat, lng } = createDraft;
        const id = spotIdFromLatLng(lat, lng, 4);
        setSpots((prev) => {
            const next = {
                ...prev,
                [id]: { lat, lng, alias, category, photos: [], messages: [] },
            };
            save(STORAGE_KEY, next);
            return next;
        });
        setCreateDraft(null);
        setActiveId(id);
    };
    //얘넨 아직 구현안됨
    const addPhoto = ({ url, caption }) => {
        if (!activeId)
            return;
        setSpots((prev) => {
            const s = prev[activeId];
            const next = {
                ...prev,
                [activeId]: {
                    ...s,
                    photos: [...(s.photos || []), { url, caption, ts: nowIso() }],
                },
            };
            save(STORAGE_KEY, next);
            return next;
        });
    };
    //구현안됨
    const addMessage = ({ text }) => {
        if (!activeId)
            return;
        setSpots((prev) => {
            const s = prev[activeId];
            const next = {
                ...prev,
                [activeId]: {
                    ...s,
                    messages: [...(s.messages || []), { text, ts: nowIso() }],
                },
            };
            save(STORAGE_KEY, next);
            return next;
        });
    };
    const spot = activeId ? spots[activeId] : null;
    return (_jsx(_Fragment, { children: _jsxs(MapWrapper, { children: [_jsxs("div", { className: 'h-[50px] flex justify-between items-center px-4 bg-white shadow-md z-20', children: [searchOpen ? (_jsx("button", { className: 'w-9 h-9 text-lg bg-white border border-gray-300 rounded-full flex items-center justify-center', onClick: () => {
                                setSearchOpen(false);
                                setSearchQuery("");
                                setSearchResults([]);
                                searchMarkers.current.forEach((m) => m.setMap(null));
                                searchMarkers.current = [];
                            }, children: "\u2190" })) : (_jsx("span", { children: "\uD83D\uDCCDLINKLE" })), _jsx("span", { children: "\uD83D\uDD14" })] }), searchOpen && (_jsx("div", { className: 'absolute top-[60px] left-0 w-full flex justify-center z-20', children: _jsx("button", { className: 'px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white shadow', onClick: () => handleSearch(1), children: "\uC774 \uC9C0\uC5ED \uC7AC\uAC80\uC0C9" }) })), _jsxs("div", { className: 'relative w-full h-full', children: [_jsx("div", { ref: mapRef, className: 'w-full h-full' }), !searchOpen && (_jsxs("div", { className: 'absolute bottom-[70px] right-5 flex flex-col gap-3 z-10', children: [_jsx(CircleButton, { imgSrc: '/icons/search.png', alt: '\uAC80\uC0C9', onClick: () => setSearchOpen(true) }), _jsx(CircleButton, { imgSrc: '/icons/refresh.png', alt: '\uC0C8\uB85C\uACE0\uCE68', onClick: () => window.location.reload() }), _jsx(CircleButton, { imgSrc: '/icons/location.png', alt: '\uB0B4 \uC704\uCE58', onClick: () => {
                                        if (navigator.geolocation && kakaoMapRef.current) {
                                            navigator.geolocation.getCurrentPosition((position) => {
                                                const lat = position.coords.latitude;
                                                const lng = position.coords.longitude;
                                                kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(lat, lng));
                                                kakaoMapRef.current.setLevel(2);
                                            });
                                        }
                                    } })] }))] }), _jsx(Sheet, { isOpen: searchOpen, onClose: () => setSearchOpen(false), snapPoints: [1, 0.5, 0.3], initialSnap: 2, children: _jsxs(Sheet.Container, { children: [_jsx(Sheet.Header, { children: _jsx("div", { className: 'mx-auto my-2 h-1.5 w-12 rounded-full bg-gray-300' }) }), _jsxs(Sheet.Content, { children: [_jsx("div", { className: 'text-center py-2 border-b', children: "\uD83D\uDD0D \uAC80\uC0C9" }), _jsx(SearchPanel, { searchQuery: searchQuery, setSearchQuery: setSearchQuery, searchResults: searchResults, handleSearch: handleSearch, handleResultClick: handleResultClick, inputRef: inputRef, hasNextPage: hasNextPage, currentPage: currentPage, onOpenModal: handleSearchResultClick })] })] }) }), _jsx(LinkerCreateModal, { open: linkerOpen, initial: linkerInitial ?? undefined, onClose: () => {
                        setLinkerOpen(false);
                        setLinkerInitial(null);
                        if (draftMarkerRef.current) {
                            draftMarkerRef.current.setMap(null);
                            draftMarkerRef.current = null;
                        }
                    }, onSubmit: handleSaveLinker })] }) }));
}
