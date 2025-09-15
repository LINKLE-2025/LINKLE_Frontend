// src/components/map/AddressDisplay.tsx
import { useEffect, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { useOutletContext } from "react-router-dom";
import { convertToXY } from "@/utils/convertToXY";

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
}: AddressDisplayProps) {
  const [address, setAddress] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  type LayoutContext = { headerHeight: number; footerHeight: number };
  const { footerHeight } = useOutletContext<LayoutContext>();

  // 🔹 시/도 이름 통일 함수 (반드시 포함)
  const normalizeRegion = (raw: string) => {
    const map: Record<string, string> = {
      서울: "서울특별시",
      부산: "부산광역시",
      대구: "대구광역시",
      인천: "인천광역시",
      광주: "광주광역시",
      대전: "대전광역시",
      울산: "울산광역시",
      세종: "세종특별자치시",
      경기: "경기도",
      강원: "강원특별자치도",
      강원도: "강원특별자치도",
      충북: "충청북도",
      충남: "충청남도",
      전북: "전북특별자치도",
      전라북도: "전북특별자치도",
      전남: "전라남도",
      경북: "경상북도",
      경남: "경상남도",
      제주: "제주특별자치도",
      제주도: "제주특별자치도",
    };
    return map[raw] || raw;
  };

  useEffect(() => {
    if (!map || !isOpen) return;

    const { kakao } = window;
    const geocoder = new kakao.maps.services.Geocoder();

    // 🔹 좌표 기반 날씨 조회
    const fetchWeather = async (lat: number, lon: number) => {
      const { nx, ny } = convertToXY(lat, lon);
      const now = new Date();
      const baseDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // yyyyMMdd
      let baseTime = now.getHours() * 100 + now.getMinutes() >= 30 ? now.getHours() : now.getHours() - 1;
      if (baseTime < 0) baseTime = 23;
      const formattedTime = `${String(baseTime).padStart(2, "0")}30`;

      const serviceKey = import.meta.env.VITE_WEATHER_KEY;

      const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${formattedTime}&nx=${nx}&ny=${ny}`;

      try {
        const res = await fetch(url);
        console.log("✅ 날씨 API 응답 상태", res.status);
        const data = await res.json();
        console.log("📦 날씨 API 데이터", data);
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

    // 🔹 카카오맵 좌표 → 주소 변환
    const updateAddress = () => {
      const center = map.getCenter();
      geocoder.coord2Address(center.getLng(), center.getLat(), (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const fullAddr = result[0].road_address?.address_name || result[0].address.address_name;
          const words = fullAddr.trim().split(/\s+/);
          const region = normalizeRegion(words[0]);
          const district = words[1] ?? "";
          const addressDetail = `${region} ${district}`;
          setAddress(addressDetail);

          // 좌표 기반 날씨 요청
          console.log("☁️ 날씨 API 호출", center.getLat(), center.getLng());
          fetchWeather(center.getLat(), center.getLng());
        } else {
          console.warn("⚠️ 주소 변환 실패", status);
        }
      });
    };

    // 지도 idle 시마다 갱신
    const idleListener = kakao.maps.event.addListener(map, "idle", updateAddress);
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
      snapPoints={[0.65, 0.3, 0]}
      initialSnap={1}
      style={{ bottom: footerHeight }}
      {...({ onSpringEnd: (snapIndex: number) => { if (snapIndex === 0) onClose(); } } as any)}
    >
      <Sheet.Container style={{ zIndex: 1, boxShadow: "none" }}>
        <Sheet.Header />
        <Sheet.Content>
          <div className="flex items-center gap-3 p-4 border">
            <img src="/icons/mapicon/linker.png" alt="Pin Icon" className="w-10 h-10 rounded-full" />
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
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
}
