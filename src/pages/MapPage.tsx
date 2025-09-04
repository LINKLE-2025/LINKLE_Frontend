// src/pages/MapPage.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import CircleButton from "../components/ui/CircleButton";
import { load, save } from "../utils/storage";
import { spotIdFromLatLng, nowIso } from "../utils/spot";
import SearchPanel from "../components/search/SearchPanel";
import MapWrapper from "../components/map/MapWrapper";
import LinkerCreateModal from "../components/linker/LinkerCreateModal";
import type { SearchResult } from "../components/search/SearchPanel";
import LinkerDetailModal from "../components/linker/LinkerDetailModal";
import { Sheet } from "react-modal-sheet";
import {
  saveLinker,
  fetchLinkers,
  fetchLinkerDetail,
  type LinkerPayload,
  type LinkerListItem,
  type LinkerDetail,
} from "@/services/linkerService";
import { useLocation } from "react-router-dom";

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
  // ===== 1. 기존 상태들 =====
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
    addressName?: string; // 상호명
  } | null>(null);

  // 검색 input ref
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<LinkerDetail | null>(null);

  // ===== 2. 🔥 새로 추가: 카테고리 필터링 상태들 =====
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false); // 카테고리 선택 패널 열림/닫힘
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  ); // 선택된 카테고리들 (Set 사용)

  // ===== 3. 카테고리 관련 상수들 =====
  // categoryId에 따른 아이콘 매핑
  const CATEGORY_ICONS: Record<number, string> = {
    1: "/icons/category/meal.png",
    2: "/icons/category/cafe.png",
    3: "/icons/category/music.png",
    4: "/icons/category/movie.png",
    5: "/icons/category/reading.png",
    6: "/icons/category/exercise.png",
    7: "/icons/category/drinking.png",
    8: "/icons/category/learning.png",
    9: "/icons/category/shopping.png",
    10: "/icons/category/hospital.png",
    11: "/icons/category/game.png",
    12: "/icons/category/travel.png",
  };

  // categoryId에 따른 아이콘 매핑 (카테고리선택용)
  const CATEGORY_ICONS2: Record<number, string> = {
    1: "/icons/category/mealicon.png",
    2: "/icons/category/cafeicon.png",
    3: "/icons/category/musicicon.png",
    4: "/icons/category/movieicon.png",
    5: "/icons/category/readingicon.png",
    6: "/icons/category/exerciseicon.png",
    7: "/icons/category/drinkingicon.png",
    8: "/icons/category/learningicon.png",
    9: "/icons/category/shoppingicon.png",
    10: "/icons/category/hospitalicon.png",
    11: "/icons/category/gameicon.png",
    12: "/icons/category/travelicon.png",
  };

  // 🔥 새로 추가: 카테고리 이름 매핑
  const CATEGORY_NAMES: Record<number, string> = {
    1: "식사",
    2: "카페",
    3: "음악",
    4: "영화",
    5: "독서",
    6: "운동",
    7: "음주",
    8: "학습",
    9: "쇼핑",
    10: "병원",
    11: "게임",
    12: "여행",
  };

  // ===== 4. 🔥 새로 추가: 카테고리 필터링 함수들 =====

  // 카테고리 하나를 선택/해제하는 함수
  const toggleCategoryFilter = (categoryId: number) => {
    console.log(`카테고리 ${categoryId}(${CATEGORY_NAMES[categoryId]}) 토글`);

    setSelectedCategories((prev) => {
      const newSet = new Set(prev); // 기존 Set을 복사
      if (newSet.has(categoryId)) {
        // 이미 선택되어 있으면 제거
        newSet.delete(categoryId);
        console.log(`카테고리 ${categoryId} 제거됨`);
      } else {
        // 선택되어 있지 않으면 추가
        newSet.add(categoryId);
        console.log(`카테고리 ${categoryId} 추가됨`);
      }
      console.log("현재 선택된 카테고리들:", Array.from(newSet));
      return newSet;
    });
  };

  // 모든 카테고리 필터 해제
  const clearAllFilters = () => {
    console.log("모든 카테고리 필터 해제");
    setSelectedCategories(new Set());
  };

  // 모든 카테고리 선택
  const selectAllCategories = () => {
    console.log("모든 카테고리 선택");
    const allCategoryIds = Object.keys(CATEGORY_NAMES).map(Number);
    setSelectedCategories(new Set(allCategoryIds));
  };

  // ===== 5. 🔥 수정된 loadExistingLinkers 함수 (카테고리 필터링 적용) =====

  //링커 상세보기 함수
  function onOpenDetailById(linkerId: number) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailData(null);

    (async () => {
      try {
        const json = await fetchLinkerDetail(linkerId);
        setDetailData(json);

        console.log("name:", json.name);
        console.log("address:", json.address ?? json.adresssName ?? "(none)");
        console.log("categoryId:", json.categoryId);
        console.log("phone:", json.phone);
        console.log("memo:", json.memo);
        console.log("createdAt:", json.createdAt);
        // 🔹 수정: X는 경도(lng), Y는 위도(lat)로 올바르게 매핑
        console.log("lat (from locationY):", json.locationY);
        console.log("lng (from locationX):", json.locationX);
      } catch (e: any) {
        setDetailError(e?.message ?? String(e));
      } finally {
        setDetailLoading(false);
      }
    })();
  }

  //DB에서 기존 링커 불러와서 마커로 표시
  //onOpenDetailById 함수도 같이 넘겨서 마커 클릭 시 상세보기 가능하게 함
  const loadExistingLinkers = async (
    map: kakao.maps.Map,
    onOpenDetailById: (linkerId: number) => void,
  ) => {
    try {
      console.log("🔄 링커 데이터 불러오는 중...");
      const items = await fetchLinkers();
      console.log("불러온 링커 목록:", items);

      // 기존 마커 제거
      console.log("🗑️ 기존 마커들 제거 중...");
      linkerMarkersRef.current.forEach((m) => m.setMap(null));
      linkerMarkersRef.current = [];

      // 선택된 카테고리가 없으면 마커 생성 안함
      if (selectedCategories.size === 0) {
        console.log("🚫 선택된 카테고리가 없음. 마커 생성 생략");
        return;
      }

      const kakao = (window as any).kakao;
      console.log(`🔍 현재 선택된 카테고리:`, Array.from(selectedCategories));
      console.log(`📊 총 ${items.length}개 링커 처리 시작`);

      let createdMarkerCount = 0;

      items.forEach((m, index) => {
        const lat = m.locationY ?? m.lat;
        const lng = m.locationX ?? m.lng;
        const linkerId = m.linkerId;
        const categoryId = m.categoryId;

        // 좌표 유효성 검증
        if (
          typeof lat !== "number" ||
          typeof lng !== "number" ||
          isNaN(lat) ||
          isNaN(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        ) {
          console.warn(`❌ 잘못된 좌표 데이터: ${m.name}, lat=${lat}, lng=${lng}`);
          return;
        }

        // 카테고리 필터링
        if (!selectedCategories.has(categoryId as any)) {
          console.log(`🚫 카테고리 필터로 제외됨: ${m.name} (카테고리 ${categoryId})`);
          return;
        }

        const linkerIcon = CATEGORY_ICONS[categoryId ?? 0] ?? "/icons/default.png";

        try {
          const markerImage = new kakao.maps.MarkerImage(
            linkerIcon,
            new kakao.maps.Size(45, 64.29),
            { offset: new kakao.maps.Point(22.5, 64.29) },
          );

          const marker = new kakao.maps.Marker({
            map,
            title: m.name,
            position: new kakao.maps.LatLng(lat, lng),
            image: markerImage,
            zIndex: 3,
            clickable: true,
          });

          if (typeof linkerId === "number") {
            kakao.maps.event.addListener(marker, "click", () => {
              console.log(`🎯 마커 클릭됨: ${m.name} (링커 ID: ${linkerId})`);
              onOpenDetailById(linkerId);
            });
          }

          linkerMarkersRef.current.push(marker);
          createdMarkerCount++;
          console.log(`🎉 마커 생성 성공: ${m.name}`);
        } catch (markerError) {
          console.error(`❌ 마커 생성 실패 (${m.name}):`, markerError);
        }
      });

      console.log(`🎯 최종 결과: ${createdMarkerCount}개 마커가 지도에 표시되었습니다.`);
    } catch (e) {
      console.error("❌ 링커 로드 중 오류:", e);
    }
  };

  // 포스트에서 링커 바로가기
  const location = useLocation();
  const openedFromStateRef = useRef(false);

  useEffect(() => {
    const raw = (location.state as any)?.openLinkerId;
    const id = Number(raw);
    if (!id || openedFromStateRef.current) return;
    openedFromStateRef.current = true;

    //지도 뜬 후 링커 띄우기
    setTimeout(() => {
      onOpenDetailById(id);
      try {
        window.history.replaceState({}, document.title);
      } catch {}
    }, 400);
  }, [location.state]);
  // ===== 6. 🔥 카테고리 필터 변경시 마커 다시 로드 =====
  useEffect(() => {
    console.log("🔄 카테고리 필터가 변경됨, 마커 다시 로드");
    if (kakaoMapRef.current) {
      loadExistingLinkers(kakaoMapRef.current, onOpenDetailById);
    }
  }, [selectedCategories]); // selectedCategories가 변경될 때마다 실행

  // 서버 저장
  const handleSaveLinker = async (payload: LinkerPayload) => {
    try {
      await saveLinker(payload);

      if (kakaoMapRef.current) {
        await loadExistingLinkers(kakaoMapRef.current, onOpenDetailById);
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

  // Kakao Map 로드
  useEffect(() => {
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

          // 지도 로드 완료 후 약간의 지연을 두고 링커 로드
          setTimeout(() => {
            console.log("지도 로드 완료, 링커 로드 시작");
            loadExistingLinkers(map, onOpenDetailById);
          });

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

          window.kakao.maps.event.addListener(map, "click", handleMapClick as any);

          // 내 위치 마커
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
              const myLat = pos.coords.latitude;
              const myLng = pos.coords.longitude;
              const myLocationImage = new window.kakao.maps.MarkerImage(
                "/icons/mapicon/user_location2.png",
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
  const markers = useMemo(
    () =>
      Object.entries(spots).map(([spotId, s]) => ({
        spotId,
        lat: s.lat,
        lng: s.lng,
        alias: s.alias,
        category: s.category,
      })),
    [spots],
  );

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
                  // 🔹 카카오 API에서는 y가 위도, x가 경도
                  lat: parseFloat(d.y), // y = 위도(latitude)
                  lng: parseFloat(d.x), // x = 경도(longitude)
                }))
              : [
                  ...prev,
                  ...data.map((d) => ({
                    name: d.place_name,
                    address: d.address_name,
                    lat: parseFloat(d.y), // y = 위도(latitude)
                    lng: parseFloat(d.x), // x = 경도(longitude)
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
              // 🔹 카카오 API에서는 y가 위도, x가 경도
              position: new window.kakao.maps.LatLng(d.y, d.x),
            });
            window.kakao.maps.event.addListener(marker, "click", () => {
              handleResultClick({
                name: d.place_name,
                address: d.address_name,
                lat: parseFloat(d.y), // y = 위도(latitude)
                lng: parseFloat(d.x), // x = 경도(longitude)
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
    kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(item.lat - 0.001, item.lng)); // 약간 위로
    setTimeout(() => {
      kakaoMapRef.current?.setLevel(2);
    }, 400);

    // 모달 초기값 세팅
    setLinkerInitial({
      lat: item.lat,
      lng: item.lng,
      address: item.address,
      addressName: item.name, // 🔹 상호명
    });
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
    setSearchOpen(false);
  };

  return (
    <>
      <MapWrapper>
        {/* ===== 1. 헤더 ===== */}
        <div className='h-12 flex justify-between items-center px-4 bg-white shadow-md z-20'>
          {/* 왼쪽: 뒤로가기 버튼 or 로고 */}
          {searchOpen ? (
            <button
              className='w-9 h-9 text-lg bg-white border border-gray-300 rounded-full flex items-center justify-center'
              onClick={() => {
                console.log("🔙 검색창 닫기");
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

          {/* 오른쪽: 알림 버튼 */}
          <div className='flex items-center gap-2'>
            <span>🔔</span>
          </div>
        </div>

        {/* ===== 3. 검색창 열렸을 때 상단 버튼 ===== */}
        {searchOpen && (
          <div className='absolute top-14 left-0 w-full flex justify-center z-20'>
            <button
              className='px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white shadow'
              onClick={() => handleSearch(1)}
            >
              이 지역 재검색
            </button>
          </div>
        )}

        {/* ===== 4. 카테고리 필터 패널 ===== */}
        {categoryFilterOpen && (
          <div className='absolute top-12 left-0 w-full bg-white shadow-lg z-20 p-4 border-b border-gray-200'>
            {/* 패널 헤더 */}
            <div className='flex justify-between items-center mb-2'>
              <h3 className='font-semibold text-gray-800 text-lg'>링커 카테고리 선택</h3>
              <div className='flex gap-2'>
                <button
                  onClick={selectAllCategories}
                  className='px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors'
                >
                  ✅
                </button>
                <button
                  onClick={clearAllFilters}
                  className='px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors'
                >
                  ❌
                </button>
                <button
                  onClick={() => setCategoryFilterOpen(false)}
                  className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors'
                >
                  ⭐
                </button>
              </div>
            </div>

            {/* 카테고리 그리드 */}
            <div className='grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-1'>
              {Object.entries(CATEGORY_NAMES).map(([id, name]) => {
                const categoryId = Number(id);
                const isSelected = selectedCategories.has(categoryId);
                return (
                  <button
                    key={categoryId}
                    onClick={() => toggleCategoryFilter(categoryId)}
                    className={`flex flex-row items-center w-full h-14 px-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className='w-8 h-8 mr-1 flex items-center justify-center'>
                      <img
                        src={CATEGORY_ICONS2[categoryId]}
                        alt={name}
                        className='w-6 h-6 object-contain'
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}
                    >
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== 5. 지도 ===== */}
        <div className='relative w-full h-[100vh]'>
          <div ref={mapRef} className='w-full h-full' />

          {/* 헤더 아래 카테고리 버튼 */}
          {!searchOpen && (
            <div className='absolute top-4 left-4 flex flex-col gap-3 z-10'>
              <button
                className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors'
                onClick={() => setCategoryFilterOpen(true)}
              >
                ⭐
              </button>
            </div>
          )}

          {!searchOpen && (
            <div className='absolute bottom-16 right-4 flex flex-col gap-3 z-10'>
              <CircleButton
                imgSrc='/icons/mapicon/search.png'
                alt='검색'
                onClick={() => setSearchOpen(true)}
              />
              <CircleButton
                imgSrc='/icons/mapicon/refresh.png'
                alt='새로고침'
                onClick={() => window.location.reload()}
              />
              <CircleButton
                imgSrc='/icons/mapicon/location.png'
                alt='내 위치'
                onClick={() => {
                  if (navigator.geolocation && kakaoMapRef.current) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      const lat = position.coords.latitude;
                      const lng = position.coords.longitude;
                      kakaoMapRef.current?.panTo(new (window as any).kakao.maps.LatLng(lat, lng));
                      kakaoMapRef.current?.setLevel(2);
                    });
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* ===== 6. 검색 패널 & 7. 모달들 ===== */}
        <Sheet
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          snapPoints={[0.6, 0.3]}
          initialSnap={0}
        >
          <Sheet.Container>
            <Sheet.Header>
              <div className='mx-auto my-2 h-1.5 w-12 rounded-full bg-gray-300' />
            </Sheet.Header>
            <Sheet.Content>
              <div className='flex flex-col h-[400px]'>
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
            draftMarkerRef.current?.setMap(null);
            draftMarkerRef.current = null;
          }}
          onSubmit={handleSaveLinker}
        />
        <LinkerDetailModal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          detail={detailData}
          loading={detailLoading}
          error={detailError}
        />
      </MapWrapper>
    </>
  );
}
