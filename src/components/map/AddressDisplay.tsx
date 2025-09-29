// src/components/map/AddressDisplay.tsx
import { useEffect, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { useOutletContext } from "react-router-dom";
import { convertToXY } from "@/utils/convertToXY";
import { getCurrentUserInfo } from "@/api/authApi";
import LinkerCardItem from "../linker/LinkerCardItem";
import { LucideWand } from "lucide-react";
import { getRecommendations } from "@/api/recommendApi";

declare global {
  interface Window {
    kakao: typeof kakao;
  }
}

interface AddressDisplayProps {
  map: any;
  isOpen: boolean;
  onClose: () => void;
  activeLinkers: any[];
  loggedInUserId: number | null;
  onOpenDetailById: (linkerId: number) => void;
}

interface WeatherData {
  temp: number;
  rainType: string;
}

export default function AddressDisplay({
  map,
  isOpen,
  onClose,
  activeLinkers,
  loggedInUserId,
  onOpenDetailById
}: AddressDisplayProps) {
  const [address, setAddress] = useState("");
  const [addressDistrict, setAddressDistrict] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const { footerHeight } = useOutletContext<{ headerHeight: number; footerHeight: number }>();

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  // 좌표 상태
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  // 유저 정보 (추가로 쓰려면 state 활용)
  useEffect(() => {
    if (!map || !isOpen) return;
    const fetchUserAndInit = async () => {
      try {
        await getCurrentUserInfo();
      } catch (err) {
        console.error("유저 정보 불러오기 실패", err);
      }
    };
    fetchUserAndInit();
  }, [map, isOpen]);

  // 추천 실행
  const handleRecommend = async () => {
    try {
      if (!currentCoords || !loggedInUserId) return;
      setLoadingRecommend(true);

      const { lat, lng } = currentCoords;
      const data = await getRecommendations(lat, lng, loggedInUserId, 5);
      setRecommendations(data);

      console.log("AI 추천 응답 데이터:", data);
    } catch (err) {
      console.error("추천 요청 에러:", err);
    } finally {
      setLoadingRecommend(false);
    }
  };

  // 버튼으로 추천 실행 (항상 최신 좌표 반영)
  const handleManualRecommend = async () => {
    if (!map || !loggedInUserId) return;
    const center = map.getCenter();
    setCurrentCoords({ lat: center.getLat(), lng: center.getLng() });
    await handleRecommend();
  };

  // 📌 좌표 변경 시 자동 추천
  useEffect(() => {
    if (currentCoords && loggedInUserId) {
      handleRecommend();
    }
  }, [currentCoords, loggedInUserId]);

  // 카카오맵 idle 이벤트로 주소/좌표 갱신
  useEffect(() => {
    if (!map || !isOpen) return;
    const { kakao } = window;
    const geocoder = new kakao.maps.services.Geocoder();

    // 날씨 가져오기
    const fetchWeather = async (lat: number, lon: number) => {
      const { nx, ny } = convertToXY(lat, lon);
      const now = new Date();
      const baseDate = now.toISOString().slice(0, 10).replace(/-/g, "");
      let baseTime = now.getHours() * 100 + now.getMinutes() >= 30 ? now.getHours() : now.getHours() - 1;
      if (baseTime < 0) baseTime = 23;
      const formattedTime = `${String(baseTime).padStart(2, "0")}30`;

      const serviceKey = import.meta.env.VITE_WEATHER_KEY;
      const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${formattedTime}&nx=${nx}&ny=${ny}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.response.header.resultCode === "00") {
          const items = data.response.body.items.item;
          const T1H = items.find((i: any) => i.category === "T1H")?.obsrValue;
          const PTY = items.find((i: any) => i.category === "PTY")?.obsrValue;
          setWeather({
            temp: Number(T1H),
            rainType: PTY === "0" ? "맑음" : PTY === "1" ? "비" : "눈/진눈깨비",
          });
        }
      } catch (err) {
        console.error("기상청 API 호출 실패", err);
      }
    };


    // 🔹 좌표 기반 날씨 조회 (실황 API)
    const fetchCurrentWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
        const text = await res.text();
        console.log("📦 백엔드 응답", text);

        // 파싱
        // header: "TM T1H PTY"
        // data:   "202503051010 14.0 0"
        const [header, line] = text.trim().split("\n");
        const [tm, t1h, pty] = line.split(/\s+/);

        setWeather({
          temp: Number(t1h),
          rainType:
            pty === "0" ? "맑음" : pty === "1" ? "비" : pty === "2" ? "비/눈" : "눈",
        });
      } catch (err) {
        console.error("❌ 날씨 API 호출 실패", err);
        setWeather(null);
      }
    };

    // 🔹 카카오맵 좌표 → 주소 변환
    // 지도 중심 → 주소 변환
    const updateAddress = () => {
      const center = map.getCenter();
      geocoder.coord2Address(center.getLng(), center.getLat(), (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const fullAddr = result[0].road_address?.address_name || result[0].address.address_name;
          const words = fullAddr.trim().split(/\s+/);
          const region = words[0];
          const district = words[1] ?? "";
          setAddress(`${region} ${district}`);
          setAddressDistrict(region === "서울특별시" ? district : "etc");


          // 좌표 기반 날씨 요청
          console.log("☁️ 날씨 API 호출", center.getLat(), center.getLng());
          fetchCurrentWeather(center.getLat(), center.getLng());
        } else {
          console.warn("⚠️ 주소 변환 실패", status);
        }
      });
    };

    kakao.maps.event.addListener(map, "idle", updateAddress);
    updateAddress();

    return () => {
      (kakao as any).maps.event.removeListener(map, "idle", updateAddress);
    };
  }, [map, isOpen]);

  const linkerCount = activeLinkers.filter((linker) => linker.addressDetail === address).length;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.65, 0.5, 0]}
      initialSnap={0}
      style={{ bottom: footerHeight }}
      {...({ onSpringEnd: (snapIndex: number) => { if (snapIndex === 0) onClose(); } } as any)}
    >
      <Sheet.Container style={{ boxShadow: "1px 2px 15px rgba(0, 0, 0, 0.2)" }}>
        <Sheet.Header>
          <div className="mx-auto my-2 h-1.5 w-12 rounded-full bg-gray-300" />
        </Sheet.Header>
        <Sheet.Content>
          <div className="flex flex-col">
            {/* 주소 / 날씨 */}
            <div className="flex items-center gap-3 p-4 border-b border-t">
              <img src={`/icons/district/${addressDistrict}.png`} alt="Pin Icon" className="w-10 h-10 rounded-full" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{address || "주소를 불러오는 중..."}</span>
                <span className="text-xs text-gray-500">{linkerCount}개의 링커 활성화 됨</span>
                {weather && (
                  <span className="text-xs text-gray-500">
                    🌡 {weather.temp.toFixed(1)}°C · {weather.rainType}
                  </span>
                )}
              </div>
            </div>

            {/* AI 추천 안내 */}
            <div className="flex rounded-lg border-2 border-gray-200/40 my-2 mx-3 py-1.5 text-xs items-center justify-center shadow-sm bg-gradient-to-r from-purple-100/35 via-pink-100/10 to-pink-100/35">
              <LucideWand className="text-[#BA8ED4] mr-2" />
              {loadingRecommend ? (
                <span>
                  {recommendations[0]?.userName
                    ? `${recommendations[0].userName}님을 위한 AI 추천을 준비중이에요...`
                    : "AI가 추천을 준비중이에요..."}
                </span>
              ) : (
                <span>
                  {recommendations[0]?.userName
                    ? `${recommendations[0].userName}님과 친구들이 자주 찾는 링커를 찾아왔어요!`
                    : "AI가 이 지역에서 자주 찾는 링커를 추천했어요!"}
                </span>
              )}
            </div>

            {/* 추천 결과 */}
            <div className="flex-1 overflow-y-auto max-h-[380px]" style={{ paddingBottom: footerHeight }}>
              {recommendations.length > 0 ? (
                recommendations.map((linker) => (
                  <LinkerCardItem
                    key={linker.linkerId}
                    linker={linker}
                    onClick={() => onOpenDetailById(linker.linkerId)}
                  />
                ))
              ) : (
                !loadingRecommend && (
                  <div className="flex items-center justify-center p-3 text-sm text-gray-400">
                    추천된 링커가 없습니다.
                  </div>
                )
              )}
            </div>

            {/* 수동 추천 버튼 (디버그/테스트용) */}
            {/* <button
              onClick={handleManualRecommend}
              className="m-3 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm"
            >
              AI 추천 새로고침
            </button> */}
          </div>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
}
