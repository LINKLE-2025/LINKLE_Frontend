// src/components/map/AddressDisplay.tsx
import { useEffect, useState } from "react";
import { Sheet } from "react-modal-sheet";

declare global {
  interface Window {
    kakao: typeof kakao;
  }
}

interface AddressDisplayProps {
  map: any; // kakao.maps.Map 객체
  isOpen: boolean; // 부모에서 Sheet 열기/닫기 제어
  onClose: () => void;
}

export default function AddressDisplay({ map, isOpen, onClose }: AddressDisplayProps) {
  const [address, setAddress] = useState("");

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
      // 이벤트 제거, 활성화 안 되어있을 때는 사용하지 않도록 막아둠.
      (window.kakao.maps.event as any).removeListener(map, "idle", updateAddress);
    };
  }, [map, isOpen]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address).then(() => {
      alert("주소가 복사되었습니다!");
    });
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.4, 0.2, 0]}
      initialSnap={0}
      {...({
        onSpringEnd: (snapIndex: number) => {
          if (snapIndex === 0) onClose();
        },
      } as any)}
    >
      <Sheet.Container style={{ zIndex: 1500, boxShadow: "none" }}>
        <Sheet.Header />
        <Sheet.Content>
          <div className='flex flex-col gap-3 p-4'>
            <div className='text-sm font-medium text-center'>
              {address ? ` ${address}` : "주소를 불러오는 중..."}
            </div>
            <div className='text-sm font-medium text-gray-400 text-center border-b'>링커 개수</div>
          </div>
          <button className='text-blue-500 text-xs self-center' onClick={copyAddress}>
            아랫부분 그 지역 링커 뜨면되나
          </button>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
}
