// src/components/map/AddressDisplay.tsx
import { useEffect, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { useNavigate, useOutletContext } from "react-router-dom";

declare global {
  interface Window {
    kakao: typeof kakao;
  }
}

interface AddressDisplayProps {
  map: any; // kakao.maps.Map 객체
  isOpen: boolean; // 부모에서 Sheet 열기/닫기 제어
  onClose: () => void;
  activeLinkers: any[]; // 활성 링커 목록
}

export default function AddressDisplay({
  map,
  isOpen,
  onClose,
  activeLinkers,
}: AddressDisplayProps) {
  const [address, setAddress] = useState("");

  type LayoutContext = { headerHeight: number; footerHeight: number };
  const { footerHeight } = useOutletContext<LayoutContext>();


  useEffect(() => {
    if (!map || !isOpen) return;

    const { kakao } = window;
    const geocoder = new kakao.maps.services.Geocoder();



    function searchAddrFromCoords(coords: any, callback: any) {
      geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
    }

    const updateAddress = () => {
      const center = map.getCenter();
      searchAddrFromCoords(center, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          let fullAddr = result[0].road_address
            ? result[0].road_address.address_name
            : result[0].address.address_name;

          // 🔹 시/도 이름 통일 함수
          const normalizeRegion = (raw: string) => {
            const map: Record<string, string> = {
              서울특별시: "서울",
              부산광역시: "부산",
              대구광역시: "대구",
              인천광역시: "인천",
              광주광역시: "광주",
              대전광역시: "대전",
              울산광역시: "울산",
              세종특별자치시: "세종",
              경기도: "경기",
              강원특별자치도: "강원",
              충청북도: "충북",
              충청남도: "충남",
              전라북도: "전북",
              전라남도: "전남",
              경상북도: "경북",
              경상남도: "경남",
              제주특별자치도: "제주",
            };
            return map[raw] || raw;
          };

          // 🔹 주소를 공백 기준으로 분리
          const words = fullAddr.trim().split(/\s+/);
          const region = normalizeRegion(words[0]); // 시/도 통일
          const district = words[1] ?? ""; // 시/군/구
          const addressDetail = `${region} ${district}`; // 최종 address
          console.log("footerHeight", footerHeight);
          setAddress(addressDetail);
          console.log("주소 표시 컴포넌트: 지도 중심 좌표 변경 감지, 주소 갱신");
        }
      });
    };

    // 지도 이동이 멈출 때마다 주소 갱신
    const idleListener = kakao.maps.event.addListener(map, "idle", updateAddress);
    // 초기 주소 표시
    updateAddress();

    return () => {
      // 이벤트 제거
      (window.kakao.maps.event as any).removeListener(map, "idle", updateAddress);
    };
  }, [map, isOpen]);

  const linkerCount = activeLinkers.filter(
    (linker) => linker.addressDetail === address
  ).length;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.65, 0.3, 0]}
      initialSnap={1}
      style={{ bottom: footerHeight }}
      {...({
        onSpringEnd: (snapIndex: number) => {
          if (snapIndex === 0) onClose();
        },
      } as any)
      }
    >
      <Sheet.Container style={{ zIndex: 1, boxShadow: "none" }}>
        <Sheet.Header />
        <Sheet.Content>
          <div className="flex items-center gap-3 p-4 border">
            <img
              src="/icons/mapicon/linker.png"
              alt="Pin Icon"
              className="w-10 h-10 rounded-full" // 이미지 크기와 모서리 둥글게
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{address ? address : "주소를 불러오는 중..."}</span>
              <span className="text-xs text-gray-500">{linkerCount}개의 링커 활성화 됨</span>
            </div>
          </div>
        </Sheet.Content>
      </Sheet.Container>

    </Sheet >
  );
}
