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
import CategoryFilter from "../components/category/CategoryFilter";
import { useCategoryFilter } from "../hooks/useCategoryFilter";
import {
  saveLinker,
  fetchLinkers,
  fetchLinkerDetail,
  type LinkerPayload,
  type LinkerListItem,
  type LinkerDetail,
} from "@/api/mapApi";
import { useLocation, useOutletContext } from "react-router-dom";
import ClusterMarkerList from "@/components/linker/ClustermarkerItem";
import AddressDisplay from "@/components/map/AddressDisplay";
import BackTitleHeader from "@/components/header/BackTitleHeader";
import LinkerListModal from "@/components/linker/ListLinkerDetail";

type LayoutContext = { headerHeight: number; footerHeight: number };

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
  const [mapReady, setMapReady] = useState(false); //지도 로드 완료 여부
  const [activeLinkers, setActiveLinkers] = useState<any[]>([]);  // 활성 링커 목록


  // 버튼 관련
  const [linkerCreateMode, setLinkerCreateMode] = useState(false); // 🔥 링커 생성 모드
  const [showAddress, setShowAddress] = useState(false); // 🔥 주소 표시

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
  // 🔥 클러스터러 인스턴스를 저장할 ref 추가 (중복 이벤트 방지를 위해)
  const clustererRef = useRef<any>(null);
  // 최신 상태를 ref로 보관
  const linkerCreateModeRef = useRef(false);
  // 상태가 바뀔 때마다 ref 갱신
  useEffect(() => {
    linkerCreateModeRef.current = linkerCreateMode;
  }, [linkerCreateMode]);

  // AppLayout의 Outlet context에 상태 전달
  const outletContext = useOutletContext<{
    headerHeight: number;
    footerHeight: number;
  }>();

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

  // 클러스터 리스트 상태
  const [clusterMarkers, setClusterMarkers] = useState<any[]>([]);
  const [showClusterList, setShowClusterList] = useState(false);

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

  // 전체 활성 링커를 메모리에 보관
  const [linkers, setLinkers] = useState<LinkerListItem[]>([]);

  // 문자열 정규화 유틸 (공백/대소문자 정리) -> 특정 상호명에 생성된 링커 조회에 사용
  const normalize = (s?: string | null) => (s ?? "").trim().replace(/\s+/g, " ").toLowerCase();

  // ===== 4. 🔥 링커 로드 함수 (selectedCategories 의존성 사용) =====
  // 링커 상세보기
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
        console.log("address:", json.address ?? json.addressName ?? "(none)");
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

  // 🔥 수정된 loadExistingLinkers 함수 - 클러스터러 업데이트만 담당하도록 변경
  const loadExistingLinkers = async (
    map: kakao.maps.Map,
    clusterer: any, // 클러스터러 인스턴스를 매개변수로 받음
    onOpenDetailById: (linkerId: number) => void,
  ) => {
    try {
      console.log("🔄 링커 데이터 불러오는 중...");
      const items = await fetchLinkers();
      // 상태 필터링 추가
      const activeItems = items.filter((m) => m.state === "ACTIVATED");
      setActiveLinkers(activeItems);  // 부모 컴포넌트에 활성 링커 목록 저장


      console.log("불러온 링커 목록:", activeItems);

      setLinkers(activeItems);
      console.log(`링커 setLinkers 완료, 총 ${activeItems.length}개`);

      // 기존 마커 제거
      linkerMarkersRef.current.forEach((m) => m.setMap(null));
      linkerMarkersRef.current = [];

      // 🔥 클러스터러에서 기존 마커들 제거
      clusterer.clear();

      // 🔥 커스텀 훅의 hasSelection 사용
      if (!hasSelection) {
        console.log("🚫 선택된 카테고리가 없음. 마커 생성 생략");
        return;
      }

      const kakao = (window as any).kakao;
      console.log(`🔍 현재 선택된 카테고리 수: ${selectedCount}`);
      console.log(`🔍 선택된 카테고리들:`, Array.from(selectedCategories));
      console.log(`📊 총 ${activeItems.length}개 링커 처리 시작`);

      let createdMarkerCount = 0;

      activeItems.forEach((m, index) => {
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
            title: m.name,
            position: new kakao.maps.LatLng(lat, lng),
            image: markerImage,
            zIndex: 3,
            clickable: true,
          });

          // 🔥 마커에 데이터 저장 (클러스터 클릭 시 사용)
          marker.data = {
            linkerId: m.linkerId,
            name: m.name,
            address: m.address ?? "",
            categoryId: m.categoryId,
            lat,
            lng,
          };

          // 🔥 개별 마커 클릭 이벤트 등록
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

      // 🔥 클러스터러에 새로운 마커들 추가
      clusterer.addMarkers(linkerMarkersRef.current);

      console.log(`🎯 최종 결과: ${createdMarkerCount}개 마커가 지도에 표시되었습니다.`);
    } catch (e) {
      console.error("❌ 링커 로드 중 오류:", e);
    }
  };

  // 포스트에서 링커 바로가기
  const location = useLocation();
  const openedFromStateRef = useRef(false);

  useEffect(() => {
    if (!mapReady) return;

    const raw = (location.state as any)?.openLinkerId;
    const id = Number(raw);
    if (!id || openedFromStateRef.current) return;

    openedFromStateRef.current = true;
    onOpenDetailById(id);

    // 🔹 한 번 열고 나면 state 제거(뒤로가기해도 다시 안 열리게)
    try {
      window.history.replaceState({}, document.title);
    } catch { }
  }, [mapReady, location.state]);

  // ===== 5. 🔥 카테고리 필터 변경시 마커 다시 로드 (selectedCategories 의존성) =====
  useEffect(() => {
    if (!mapReady) return;
    console.log("🔄 카테고리 필터가 변경됨, 마커 다시 로드");
    console.log(`선택된 카테고리 수: ${selectedCount}, 전체 선택 여부: ${isAllSelected}`);

    // 🔥 지도와 클러스터러가 모두 준비된 경우에만 실행
    if (kakaoMapRef.current && clustererRef.current) {
      loadExistingLinkers(kakaoMapRef.current, clustererRef.current, onOpenDetailById);
    }
  }, [selectedCategories, selectedCount, hasSelection, isAllSelected]); // 🔥 커스텀 훅의 값들을 의존성으로 사용

  // 서버 저장
  const handleSaveLinker = async (payload: LinkerPayload) => {
    try {
      await saveLinker(payload);
      // 🔥 지도와 클러스터러가 모두 준비된 경우에만 실행
      if (kakaoMapRef.current && clustererRef.current) {
        await loadExistingLinkers(kakaoMapRef.current, clustererRef.current, onOpenDetailById);
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

  // 🔥 수정된 Kakao Map 로드 useEffect - 클러스터러 이벤트 중복 등록 방지
  useEffect(() => {
    if (!mapRef.current) return;
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY ?? "YOUR_KEY"
      }&autoload=false&libraries=services,clusterer`; // 사용할 서비스 명시
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

          // 🔥 클러스터러 생성 및 ref에 저장 (한 번만 생성)
          const clusterer = new (window.kakao.maps as any).MarkerClusterer({
            map,
            averageCenter: true,
            minLevel: 1, // 클러스터가 적용될 최소 지도 레벨
            disableClickZoom: true, // 클러스터 클릭 시 확대 비활성화 (직접 제어하기 위해)
          });
          clustererRef.current = clusterer;

          // 🔥 클러스터 클릭 이벤트 등록 (한 번만 등록)
          window.kakao.maps.event.addListener(clusterer, "clusterclick", (cluster: any) => {
            console.log("🔥 클러스터 클릭 이벤트 발생!"); // 디버그 로그 추가

            const level = (map as any).getLevel();
            const clusterData = cluster.getMarkers().map((m: any) => ({
              marker: m,
              ...m.data, // 마커에 넣어둔 원본 데이터
            }));

            // 줌 레벨이 3보다 클 때는 확대, 그 외에는 리스트 표시
            if (level > 3) {
              console.log("📍 클러스터 확대 실행");
              (map as any).setLevel(level - 1, { anchor: cluster.getCenter() });
            } else {
              console.log("📋 클러스터 리스트 표시", clusterData.length, "개 마커");
              setClusterMarkers(clusterData);
              setShowClusterList(true);
            }
          });

          // idle 이벤트는 지도가 완전히 로드되고 유휴 상태가 되었을 때 발생
          let isInitialLoad = true;

          kakao.maps.event.addListener(map, "tilesloaded", () => {
            if (isInitialLoad && hasSelection) {
              isInitialLoad = false;
              console.log("🗺️ 지도 로드 완료, 링커 로드 시작");
              loadExistingLinkers(map, clusterer, onOpenDetailById);
            }
          });

          // 지도 준비 완료 상태 설정
          // 포스트에서 링커 바로가기 기능에서 사용
          setMapReady(true);

          // 🔥 지도 클릭 이벤트 핸들러
          const handleMapClick = (mouseEvent: kakao.maps.event.MouseEvent) => {
            if (!linkerCreateModeRef.current) return;
            console.log("지도 클릭 시 이벤트");
            setDetailOpen(false);

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

          // 🔥 사용자 위치 표시
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
  }, []); // 🔥 의존성 배열을 비워서 한 번만 실행되도록 함

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
    if (!kakaoMapRef.current || !searchQuery || !window.kakao?.maps?.services) return;

    const ps = new window.kakao.maps.services.Places();
    const center = kakaoMapRef.current.getCenter();
    const options = { location: center, radius: 2000, page };  // 반경 2km

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

  // 특정 상호명으로 링커 리스트 열기

  // 상태 추가
  const [filteredLinkers, setFilteredLinkers] = useState<LinkerListItem[]>([]);
  const [listModalOpen, setListModalOpen] = useState(false);

  // 특정 상호명으로 링커 리스트 열기
  const handleOpenLinkerList = (item: SearchResult) => {
    const key = normalize(item.name);
    const matches = linkers.filter(
      (l) => normalize(l.name) === key || normalize(l.addressName) === key,
    );
    if (matches.length === 0) {
      alert("일치하는 링커가 없어요!");
      return;
    }
    setFilteredLinkers(matches);
    setListModalOpen(true);
    setSearchOpen(false);
  };

  const handleResultClick = (item: SearchResult) => {
    // 검색 결과 클릭 로직 (기존과 동일)
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

  // 내위치 버튼 핸들러
  const handleMyLocation = () => {
    if (!kakaoMapRef.current) return;

    console.log("🐥 내 위치 버튼 클릭");

    const map = kakaoMapRef.current;
    const currentCenter = map.getCenter();
    map.panTo(currentCenter); // 그냥 시각적 피드백

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          console.log("📍 GPS 위치 획득:", lat, lng);

          map.panTo(new (window as any).kakao.maps.LatLng(lat, lng));
          map.setLevel(2);
        },
        (err) => {
          console.warn("⚠️ 위치를 가져올 수 없습니다.", err);
          alert("위치 정보를 가져올 수 없습니다. 다시 시도해보세요.");
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        },
      );
    } else {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
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

  const { headerHeight, footerHeight } = useOutletContext<LayoutContext>();

  return (
    <MapWrapper>
      {/* ===== 헤더 ===== */}
      {/* 검색창 열렸을 때 뒤로가기 헤더 */}
      {searchOpen && (
        <BackTitleHeader
          title='링커 검색'
          onBack={() => {
            console.log("🔙 검색창 닫기");
            setSearchOpen(false);
            setSearchQuery("");
            setSearchResults([]);
            searchMarkers.current.forEach((m) => m.setMap(null));
            searchMarkers.current = [];
          }}
        />
      )}
      {/* 링커 생성 모드일 때 헤더 */}
      {linkerCreateMode && !searchOpen && (
        <BackTitleHeader
          title='링커 생성'
          onBack={() => {
            console.log("🔙 링커 생성 모드 종료");
            setLinkerCreateMode(false);
          }}
        />
      )}

      {/* <div className='h-12 flex justify-between items-center px-4 bg-white shadow-md z-20'>
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
      </div> */}
      {/* <MainHeader /> */}
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
      <div
        className='relative w-full'
        style={{ height: `calc(100vh - ${headerHeight + footerHeight}px)` }}
      >
        <div ref={mapRef} className='w-full h-full' />

        {/* 🔥 카테고리 토글 버튼 (커스텀 훅의 함수 사용) */}
        {!searchOpen && (
          <div className='absolute top-4 left-4 z-10'>
            <button
              className={`px-4 py-2 rounded-lg shadow transition-colors ${categoryFilterOpen
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
          <div className='absolute bottom-5 right-4 flex flex-col gap-3 z-10'>
            {linkerCreateMode ? (
              <>
                {/* 링커 생성 모드일 때 버튼 */}
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
                  onClick={handleMyLocation}
                />
              </>
            ) : (
              <>
                {/* 기본 버튼 리스트 */}
                <CircleButton
                  imgSrc='/icons/mapicon/linker2.png'
                  alt='링커 생성 모드 진입'
                  onClick={() => setLinkerCreateMode(true)}
                />
                <CircleButton
                  imgSrc='/icons/mapicon/info.png'
                  alt='주소 표시 토글'
                  onClick={() => setShowAddress((prev) => !prev)}
                />
                <CircleButton
                  imgSrc='/icons/mapicon/location.png'
                  alt='내 위치'
                  onClick={handleMyLocation}
                />
              </>
            )}
          </div>
        )}
      </div>
      {/* 🔥 주소 표시 컴포넌트 */}
      <AddressDisplay
        map={kakaoMapRef.current}
        isOpen={showAddress}
        onClose={() => setShowAddress(false)}
        activeLinkers={activeLinkers}
      />
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
                  setSearchQuery={setSearchQuery}
                  searchResults={searchResults}
                  handleSearch={handleSearch}
                  handleResultClick={handleResultClick}
                  inputRef={inputRef}
                  hasNextPage={hasNextPage}
                  currentPage={currentPage}
                  onOpenModal={handleOpenModal}
                  onOpenLinkerList={handleOpenLinkerList}
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
      {/* 클러스터 리스트 모달 */}
      <ClusterMarkerList
        isOpen={showClusterList}
        markers={clusterMarkers}
        onClose={() => setShowClusterList(false)}
        onMarkerClick={(linkerId) => {
          console.log("클러스터 리스트에서 선택된 링커:", linkerId);
          onOpenDetailById(linkerId); // 기존 상세 모달 열기 재사용
        }}
      />
      {/* 특정 상호명에 생성된 링커조회 */}
      <LinkerListModal
        isOpen={listModalOpen}
        linkers={filteredLinkers.map((l) => ({
          linkerId: l.linkerId,
          name: l.name,
          address: l.address ?? l.addressName ?? "",
          categoryId: l.categoryId ?? 0,
          lat: l.locationY ?? 0,
          lng: l.locationX ?? 0,
        }))}
        title='검색된 링커'
        onClose={() => setListModalOpen(false)}
        onItemClick={(linkerId) => onOpenDetailById(linkerId)}
      />
    </MapWrapper>
  );
}
