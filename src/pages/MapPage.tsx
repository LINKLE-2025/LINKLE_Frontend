// src/pages/MapPage.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import CircleButton from "../components/ui/CircleButton";
import { load, save } from "../utils/storage";
import { spotIdFromLatLng, nowIso } from "../utils/spot";
import SearchPanel from "../components/search/SearchPanel";
import MapWrapper from "../components/map/MapWrapper";
import LinkerCreateModal from "../components/linker/LinkerCreateModal";
import type { SearchResult } from "../components/search/SearchPanel";
import { Sheet } from "react-modal-sheet";

interface StoredSpot {
  lat: number;
  lng: number;
  alias: string;
  category: string;
  photos?: { url: string; caption?: string; ts?: string }[];
  messages?: { text: string; ts: string }[];
}

type StoredSpots = Record<string, StoredSpot>;

interface SearchItem {
  name: string;
  address: string;
  lat: number;
  lng: number;
}
const STORAGE_KEY = "linkle_spots_v2";

export default function MapPage(): React.ReactElement {
  // spots 저장
  const [spots, setSpots] = useState<StoredSpots>(() =>
    load<StoredSpots>(STORAGE_KEY, {} as StoredSpots),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<{ lat: number; lng: number } | null>(null);

  // 검색 관련
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

  // ref들
  const mapRef = useRef<HTMLDivElement | null>(null);
  const kakaoMapRef = useRef<InstanceType<typeof window.kakao.maps.Map> | null>(null);
  const searchMarkers = useRef<InstanceType<typeof window.kakao.maps.Marker>[]>([]);
  const draftMarkerRef = useRef<InstanceType<typeof window.kakao.maps.Marker> | null>(null);
  const linkerMarkersRef = useRef<InstanceType<typeof window.kakao.maps.Marker>[]>([]);
  // 모달 관련
  const [linkerOpen, setLinkerOpen] = useState(false);
  const [linkerInitial, setLinkerInitial] = useState<{
    lat?: number;
    lng?: number;
    address?: string;
    addressName?: string; // 🔹 추가
  } | null>(null);

  // 검색 input ref
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 서버 저장
  const handleSaveLinker = async (payload: {
    name: string;
    memo: string;
    address: string;
    locationX?: number;
    locationY?: number;
    categoryId: number;
    addressDetail: string;
    addressName: string; // 🔹 추가
  }) => {
    try {
      const res = await fetch("/api/linker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("POST /api/linker 실패");
      if (kakaoMapRef.current) {
        await loadExistingLinkers(kakaoMapRef.current);
      }
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    } finally {
      setLinkerOpen(false);
      setLinkerInitial(null);
      if (draftMarkerRef.current) {
        draftMarkerRef.current.setMap(null);
        draftMarkerRef.current = null;
      }
    }
  };

  // categoryId에 따른 아이콘 매핑
  const CATEGORY_ICONS: Record<number, string> = {
    1: "/icons/meal.png",
    2: "/icons/cafe.png",
    3: "/icons/shopping.png",
    4: "/icons/movie.png",
    5: "/icons/learning.png",
    6: "/icons/exercise.png",
    7: "/icons/reading.png",
    8: "/icons/music.png",
    9: "/icons/drinking.png",
    10: "/icons/hospital.png",
    11: "/icons/game.png",
    12: "/icons/travel.png",
  };

  // 기존 링커 불러오기
  const loadExistingLinkers = async (map: kakao.maps.Map) => {
    try {
      const res = await fetch("/api/linker");
      if (!res.ok) throw new Error("GET /api/linker 실패");
      const items: Array<{
        name: string;
        locationX?: number;
        locationY?: number;
        lat?: number;
        lng?: number;
        categoryId?: number;
      }> = await res.json();

      // 기존 마커 제거
      linkerMarkersRef.current.forEach((m) => m.setMap(null));
      linkerMarkersRef.current = [];

      const kakao = window.kakao;

      items.forEach((m) => {
        const lat = m.locationX ?? m.lat;
        const lng = m.locationY ?? m.lng;
        if (typeof lat !== "number" || typeof lng !== "number") return;

        // 카테고리별 이미지 적용
        const linkerIcon = CATEGORY_ICONS[m.categoryId ?? 0] ?? "/icons/default.png";

        // 마커 이미지 생성
        const markerImage = new kakao.maps.MarkerImage(
          linkerIcon,
          new kakao.maps.Size(32, 32), // 아이콘 크기
          { offset: new kakao.maps.Point(16, 32) },
        );

        const marker = new kakao.maps.Marker({
          map,
          title: m.name,
          position: new kakao.maps.LatLng(lat, lng),
          image: markerImage,
        });

        linkerMarkersRef.current.push(marker);
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Kakao Map 로드
  useEffect(() => {
    if (document.getElementById("kakao-map-script")) return;
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_MAP_KEY ?? "YOUR_KEY"
    }&autoload=false&libraries=services`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current!;
        let lat = 37.5665;
        let lng = 126.978;

        const initMap = (latitude: number, longitude: number) => {
          const options = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 3,
          };
          const map = new window.kakao.maps.Map(container, options);
          kakaoMapRef.current = map;
          loadExistingLinkers(map);

          // 지도 클릭 이벤트(모달 띄우기)
          const handleMapClick = (mouseEvent: kakao.maps.event.MouseEvent) => {
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
              } else {
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
              const myLocationImage = new window.kakao.maps.MarkerImage(
                "/icons/user_location2.png",
                new window.kakao.maps.Size(20, 20),
                { offset: new window.kakao.maps.Point(10, 10) },
              );
              new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(myLat, myLng),
                image: myLocationImage,
                map: kakaoMapRef.current!,
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
          navigator.geolocation.getCurrentPosition(
            (position) => {
              lat = position.coords.latitude;
              lng = position.coords.longitude;
              initMap(lat, lng);
            },
            () => initMap(lat, lng),
          );
        } else {
          initMap(lat, lng);
        }
      });
    };
  }, []);

  // spot markers 렌더링

  useEffect(() => {
    if (!kakaoMapRef.current || !window.kakao?.maps) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    if ((kakaoMapRef.current as any).spotMarkers) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any

      (kakaoMapRef.current as any).spotMarkers.forEach((m: kakao.maps.Marker) => m.setMap(null));
    }

    const newMarkers = markers.map((m) => {
      const marker = new window.kakao.maps.Marker({
        map: kakaoMapRef.current!,

        position: new window.kakao.maps.LatLng(m.lat, m.lng),
      });
      window.kakao.maps.event.addListener(marker, "click", () => setActiveId(m.spotId));
      return marker;
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    (kakaoMapRef.current as any).spotMarkers = newMarkers;
  }, [markers]);

  // 검색 상태

  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const handleSearch = (page: number = 1) => {
    if (!kakaoMapRef.current || !searchQuery || !window.kakao?.maps?.services) return;

    const ps = new window.kakao.maps.services.Places();

    const center = kakaoMapRef.current.getCenter();

    const options = { location: center, radius: 2000, page };
    ps.keywordSearch(
      searchQuery,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any

      (data: any[], status: string, pagination: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults((prev) =>
            page === 1
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
                ],
          );

          if (page === 1) {
            searchMarkers.current.forEach((m) => m.setMap(null));
            searchMarkers.current = [];
          }

          const newMarkers = data.map((d) => {
            const marker = new window.kakao.maps.Marker({
              map: kakaoMapRef.current!,

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
        } else {
          if (page === 1) setSearchResults([]);
          setHasNextPage(false);
        }
      },
      options,
    );
  };

  const handleResultClick = (item: SearchResult) => {
    if (!kakaoMapRef.current) return;

    // 지도 중심 이동
    kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(item.lat, item.lng));
    // 모달 초기값 세팅
    setLinkerInitial({
      lat: item.lat,
      lng: item.lng,
      address: item.address,
      addressName: item.name, // 🔹 상호명
    });
    // 모달 열기
    setLinkerOpen(true);

    // 검색창 닫기
    setSearchOpen(false);
  };

  const saveNewSpot = ({ alias, category }: { alias: string; category: string }) => {
    if (!createDraft) return;
    const { lat, lng } = createDraft;
    const id = spotIdFromLatLng(lat, lng, 4);
    setSpots((prev) => {
      const next: StoredSpots = {
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
  const addPhoto = ({ url, caption }: { url: string; caption?: string }) => {
    if (!activeId) return;
    setSpots((prev) => {
      const s = prev[activeId];
      const next: StoredSpots = {
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
  const addMessage = ({ text }: { text: string }) => {
    if (!activeId) return;
    setSpots((prev) => {
      const s = prev[activeId];
      const next: StoredSpots = {
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

  const handleOpenModal = (item: SearchResult) => {
    console.log("검색 클릭 item:", item);
    setLinkerInitial({
      lat: item.lat,
      lng: item.lng,
      address: item.address,
      addressName: item.name,
    });
    setLinkerOpen(true);
  };

  return (
    <>
      <MapWrapper>
        <div className='h-[50px] flex justify-between items-center px-4 bg-white shadow-md z-20'>
          {searchOpen ? (
            <button
              className='w-9 h-9 text-lg bg-white border border-gray-300 rounded-full flex items-center justify-center'
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
                setSearchResults([]);
                searchMarkers.current.forEach((m) => m.setMap(null));
                searchMarkers.current = [];
              }}
            >
              ←
            </button>
          ) : (
            <span>📍LINKLE</span>
          )}
          <span>🔔</span>
        </div>

        {searchOpen && (
          <div className='absolute top-[60px] left-0 w-full flex justify-center z-20'>
            <button
              className='px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white shadow'
              onClick={() => handleSearch(1)}
            >
              이 지역 재검색
            </button>
          </div>
        )}

        <div className='relative w-full h-full'>
          <div ref={mapRef} className='w-full h-full' />
          {!searchOpen && (
            <div className='absolute bottom-[70px] right-5 flex flex-col gap-3 z-10'>
              <CircleButton
                imgSrc='/icons/search.png'
                alt='검색'
                onClick={() => setSearchOpen(true)}
              />
              <CircleButton
                imgSrc='/icons/refresh.png'
                alt='새로고침'
                onClick={() => window.location.reload()}
              />
              <CircleButton
                imgSrc='/icons/location.png'
                alt='내 위치'
                onClick={() => {
                  if (navigator.geolocation && kakaoMapRef.current) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      const lat = position.coords.latitude;
                      const lng = position.coords.longitude;
                      kakaoMapRef.current.panTo(new (window as any).kakao.maps.LatLng(lat, lng));
                      kakaoMapRef.current.setLevel(2);
                    });
                  }
                }}
              />
            </div>
          )}
        </div>
        {/* 검색 패널 - react-modal-sheet */}
        <Sheet
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          snapPoints={[1, 0.5, 0.3]}
          initialSnap={1}
        >
          <Sheet.Container>
            <Sheet.Header>
              <div className='mx-auto my-2 h-1.5 w-12 rounded-full bg-gray-300' />
            </Sheet.Header>
            <Sheet.Content>
              <div className='flex flex-col h-full'>
                <div className='text-center py-2 border-b'>🔍 검색</div>
                <div className='flex-1 min-h-0 overflow-y-auto'>
                  <SearchPanel
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchResults={searchResults}
                    handleSearch={handleSearch}
                    handleResultClick={handleResultClick}
                    inputRef={inputRef}
                    hasNextPage={hasNextPage}
                    currentPage={currentPage}
                    onOpenModal={handleOpenModal}
                  />
                </div>
              </div>
            </Sheet.Content>
          </Sheet.Container>
        </Sheet>

        <LinkerCreateModal
          open={linkerOpen}
          initial={linkerInitial ?? undefined}
          onClose={() => {
            setLinkerOpen(false);
            setLinkerInitial(null);
            if (draftMarkerRef.current) {
              draftMarkerRef.current.setMap(null);
              draftMarkerRef.current = null;
            }
          }}
          onSubmit={handleSaveLinker}
        />
      </MapWrapper>
    </>
  );
}
