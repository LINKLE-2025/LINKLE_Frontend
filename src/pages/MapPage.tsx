// src/pages/MapPage.tsx (useCategoryFilter 훅 사용)
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
// 🔥 새로 추가: CategoryFilter 컴포넌트와 커스텀 훅
import CategoryFilter from "../components/category/CategoryFilter";
import { useCategoryFilter } from "../hooks/useCategoryFilter";
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
  // ===== 1. 🔥 카테고리 필터링 - 커스텀 훅으로 대체 =====
  const {
    categoryFilterOpen,
    selectedCategories,
    setCategoryFilterOpen,
    toggleCategoryFilter,
    selectAllCategories,
    clearAllFilters,
    selectedCount,
    hasSelection,
    isAllSelected,
  } = useCategoryFilter([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); // 초기에 모든 카테고리 선택

  // ===== 2. 기존 상태들 (변경없음) =====
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
    addressName?: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<LinkerDetail | null>(null);

  // ===== 3. 🔥 마커용 아이콘 상수 (지도에 표시되는 마커용) =====
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

  // ===== 4. 🔥 링커 로드 함수 (selectedCategories 의존성 사용) =====
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
        console.log("lat (from locationY):", json.locationY);
        console.log("lng (from locationX):", json.locationX);
      } catch (e: any) {
        setDetailError(e?.message ?? String(e));
      } finally {
        setDetailLoading(false);
      }
    })();
  }

  // loadExistingLinkers 함수 - selectedCategories 상태를 사용
  const loadExistingLinkers = async (
    map: kakao.maps.Map,
    onOpenDetailById: (linkerId: number) => void,
  ) => {
    try {
      console.log("🔄 링커 데이터 불러오는 중...");
      const items = await fetchLinkers();
      console.log("불러온 링커 목록:", items);

      // 기존 마커 제거
      linkerMarkersRef.current.forEach((m) => m.setMap(null));
      linkerMarkersRef.current = [];

      // 🔥 커스텀 훅의 hasSelection 사용
      if (!hasSelection) {
        console.log("🚫 선택된 카테고리가 없음. 마커 생성 생략");
        return;
      }

      const kakao = (window as any).kakao;
      console.log(`🔍 현재 선택된 카테고리 수: ${selectedCount}`);
      console.log(`🔍 선택된 카테고리들:`, Array.from(selectedCategories));
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

        // 🔥 커스텀 훅의 selectedCategories 사용
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

    setTimeout(() => {
      onOpenDetailById(id);
      try {
        window.history.replaceState({}, document.title);
      } catch {}
    }, 400);
  }, [location.state]);

  // ===== 5. 🔥 카테고리 필터 변경시 마커 다시 로드 (selectedCategories 의존성) =====
  useEffect(() => {
    console.log("🔄 카테고리 필터가 변경됨, 마커 다시 로드");
    console.log(`선택된 카테고리 수: ${selectedCount}, 전체 선택 여부: ${isAllSelected}`);
    if (kakaoMapRef.current) {
      loadExistingLinkers(kakaoMapRef.current, onOpenDetailById);
    }
  }, [selectedCategories, selectedCount, hasSelection, isAllSelected]); // 🔥 커스텀 훅의 값들을 의존성으로 사용

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

  // Kakao Map 로드 (변경없음)
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

          // idle 이벤트는 지도가 완전히 로드되고 유휴 상태가 되었을 때 발생
          let isInitialLoad = true;

          kakao.maps.event.addListener(map, "idle", () => {
            if (isInitialLoad && hasSelection) {
              isInitialLoad = false;
              console.log("🗺️ 지도 로드 완료, 링커 로드 시작");
              loadExistingLinkers(map, onOpenDetailById);
            }
          });

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

  // 나머지 함수들 (기존과 동일 - 생략)
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

  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const handleSearch = (page: number = 1) => {
    // 검색 로직 (기존과 동일)
  };

  const handleResultClick = (item: SearchResult) => {
    // 검색 결과 클릭 로직 (기존과 동일)
  };

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
    <MapWrapper>
      {/* ===== 헤더 ===== */}
      <div className='h-12 flex justify-between items-center px-4 bg-white shadow-md z-20'>
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

        <div className='flex items-center gap-2'>
          <span>🔔</span>
        </div>
      </div>

      {/* 검색창 열렸을 때 상단 버튼 */}
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

      {/* ===== 🔥 CategoryFilter 컴포넌트 사용 (커스텀 훅의 값들 전달) ===== */}
      <CategoryFilter
        isOpen={categoryFilterOpen}
        selectedCategories={selectedCategories}
        onClose={() => setCategoryFilterOpen(false)}
        onCategoryToggle={toggleCategoryFilter}
        onSelectAll={selectAllCategories}
        onClearAll={clearAllFilters}
      />

      {/* 지도 영역 */}
      <div className='relative w-full h-[100vh]'>
        <div ref={mapRef} className='w-full h-full' />

        {/* 🔥 카테고리 토글 버튼 (커스텀 훅의 함수 사용) */}
        {!searchOpen && (
          <div className='absolute top-4 left-4 z-10'>
            <button
              className={`px-4 py-2 rounded-lg shadow transition-colors ${
                categoryFilterOpen
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              onClick={() => {
                console.log("⭐ 카테고리 필터 토글");
                setCategoryFilterOpen(!categoryFilterOpen);
              }}
            >
              ⭐
            </button>
          </div>
        )}

        {/* 지도 컨트롤 버튼들 (오른쪽 하단) */}
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

      {/* 나머지 모달들 (기존과 동일) */}
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
                  setSearchQuery={() => {}}
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
  );
}
