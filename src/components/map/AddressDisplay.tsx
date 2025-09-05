import { useEffect, useState } from "react";

declare global {
  interface Window {
    kakao: typeof kakao;
  }
}

interface AddressDisplayProps {
  map: any; // kakao.maps.Map 객체
}

export default function AddressDisplay({ map }: AddressDisplayProps) {
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!map) return;

    const { kakao } = window;
    const geocoder = new kakao.maps.services.Geocoder();

    function searchAddrFromCoords(coords: any, callback: any) {
      geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
    }

    const updateAddress = () => {
      const center = map.getCenter();
      searchAddrFromCoords(center, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          let fullAddr = "";

          if (result[0].road_address) {
            fullAddr = result[0].road_address.address_name;
          } else {
            fullAddr = result[0].address.address_name;
          }

          // 구까지 간략 주소 추출
          const simpleAddr = fullAddr.split(" ").slice(0, 2).join(" ");
          setAddress(simpleAddr);
        }
      });
    };

    // 지도 이동이 멈출 때마다 주소 갱신
    kakao.maps.event.addListener(map, "idle", updateAddress);

    // 초기 실행
    updateAddress();
  }, [map]);

  return (
    <div className='absolute bottom-0 z-[10] left-0 w-full flex justify-center pb-4'>
      <div className='bg-white px-4 py-2 rounded-2xl shadow-md text-sm flex items-center gap-2'>
        {address ? `📍 ${address}` : "주소를 불러오는 중..."}
      </div>
    </div>
  );
}
